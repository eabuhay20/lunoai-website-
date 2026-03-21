import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ucuxvcvamglngydpeaoy.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdXh2Y3ZhbWdsbmd5ZHBlYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzgyNDYsImV4cCI6MjA3NTk1NDI0Nn0.1IX3iIJZIptPTEEcUkhBhRB0dB455q8ZkXS-yavuiMM';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdXh2Y3ZhbWdsbmd5ZHBlYW95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM3ODI0NiwiZXhwIjoyMDc1OTU0MjQ2fQ.jBBeIRNAtNDaZTGo3MFV8rVpq2tOKjHStlXCI-Gwpoo';

const sbAdmin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const sbAnon  = createClient(SUPABASE_URL, ANON_KEY,    { auth: { autoRefreshToken: false, persistSession: false } });

const emails = ['eabuhay@gmu.edu', 'eyosiasabuhay20@gmail.com', 'josiahabuhay@gmail.com'];
const PASSWORD = 'Eyosias@1';

console.log('=== Auth user status (admin) ===');
const { data: { users } } = await sbAdmin.auth.admin.listUsers();
for (const email of emails) {
  const u = users.find(u => u.email === email);
  if (u) {
    console.log(`${email}: id=${u.id} confirmed=${u.email_confirmed_at ? 'YES' : 'NO'} banned=${u.banned_until || 'NO'}`);
  } else {
    console.log(`${email}: NOT FOUND in auth`);
  }
}

console.log('\n=== Sign-in test (anon key, as browser would) ===');
for (const email of emails) {
  const { data, error } = await sbAnon.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) {
    console.log(`FAIL  ${email}: ${error.message}`);
  } else {
    console.log(`OK    ${email}: signed in as ${data.user.id}`);
  }
}
