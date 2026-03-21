import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ucuxvcvamglngydpeaoy.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdXh2Y3ZhbWdsbmd5ZHBlYW95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM3ODI0NiwiZXhwIjoyMDc1OTU0MjQ2fQ.jBBeIRNAtNDaZTGo3MFV8rVpq2tOKjHStlXCI-Gwpoo';
const PASSWORD = 'Eyosias@1';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// 1. Fetch all clients
const { data: clients, error: cErr } = await sb.from('clients').select('id, email, name');
if (cErr) { console.error('Failed to fetch clients:', cErr.message); process.exit(1); }
console.log(`Found ${clients.length} client(s):\n`);

for (const client of clients) {
  const email = client.email?.trim();
  if (!email) { console.log(`  [SKIP] Client ${client.id} — no email`); continue; }

  // 2. Check if they already have an auth user via client_users
  const { data: cu } = await sb.from('client_users').select('user_id').eq('client_id', client.id).maybeSingle();

  if (cu?.user_id) {
    // Auth user exists — update password
    const { error } = await sb.auth.admin.updateUserById(cu.user_id, { password: PASSWORD });
    if (error) {
      console.log(`  [FAIL]  ${email} — ${error.message}`);
    } else {
      console.log(`  [UPDATED] ${email} → password set`);
    }
  } else {
    // No auth user — create one and link it
    const { data: created, error: createErr } = await sb.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true
    });
    if (createErr) {
      // If user already exists in auth but not linked, try to find and link
      if (createErr.message.includes('already been registered')) {
        const { data: list } = await sb.auth.admin.listUsers();
        const existing = list?.users?.find(u => u.email === email);
        if (existing) {
          await sb.auth.admin.updateUserById(existing.id, { password: PASSWORD });
          await sb.from('client_users').upsert({ client_id: client.id, user_id: existing.id, role: 'client' }, { onConflict: 'user_id,client_id' });
          console.log(`  [LINKED+UPDATED] ${email} → found existing auth user, linked & password set`);
        } else {
          console.log(`  [FAIL]  ${email} — ${createErr.message}`);
        }
      } else {
        console.log(`  [FAIL]  ${email} — ${createErr.message}`);
      }
    } else {
      // Link new auth user to client
      await sb.from('client_users').upsert({ client_id: client.id, user_id: created.user.id, role: 'client' }, { onConflict: 'user_id,client_id' });
      console.log(`  [CREATED] ${email} → new auth user created & linked`);
    }
  }
}

console.log('\nDone.');
