# Carl Websites: Delivery Plan (no client self-serve)

*Saved 2026-10-06. Sites: Extreme Cleanup + Leap Pest Control.*

## What changed from the 2026-10-04 plan
- **Old plan** (`meeting-notes/2026-10-04-vikas-websites-call.md`, contract in `website-contract/`): 3 sites, $5,100 CAD month 1, 2 weeks of teaching Carl's team Claude Code + the OS so they edit and ship themselves.
- **New plan:** 2 sites, no teaching, no self-serve. Carl's team gets the live site on their own Vercel and nothing else. All changes go through Eyu.
- **Why:** Vikas now says about $1,000 for 2 sites (maybe +$500). At that price Eyu is not handing over the system that lets them build sites themselves.
- **To fix:** the sent contract still includes training ($500/mo) and assumes 3 sites. It needs a revised version before anything is signed. The "non-technical team runs its own websites" case study angle no longer fits this plan.

## How Michael's setup works (what to NOT copy)
Michael is fully self-serve:
1. He has a synced clone of both private repos (`MDMI-EA` OS + `mdmi-3d-site` website) and can push.
2. A `CLAUDE.md` in each repo tells Claude to handle all git for him. The OS has `bypassPermissions` on.
3. Skills do the work: `publish` (say "publish" and it commits + pushes), `blog`, and `skill-builder` (teaches the system to build new skills).
4. Vercel is connected to the repo, so a push goes live in about a minute.

Carl gets none of 1-3.

## The setup for Carl
1. **Code stays with Eyu.** One private repo (both sites, shared template) under an account only Eyu controls. No collaborators.
2. **Hosting on Carl's Vercel.** Carl owns the Vercel account, billing (Pro plan, about $20/user/mo, Hobby is non-commercial only) and domains. He can keep the site running or turn it off. That is his only access.
3. **Deploy from Eyu's repo to Carl's Vercel** via a GitHub Action holding Carl's Vercel token as a GitHub secret. Only a push from Eyu's repo ships anything.
4. **If it has to be "on their Claude":** get a seat on a Claude Team plan they pay for. Do not log into a personal account. Connect Eyu's GitHub only while working, then disconnect it in their Claude settings. Leave nothing behind: no skills, no Projects with instructions, no CLAUDE.md system, no Vercel token in their Claude. Anything in their workspace their admins may be able to see.
5. **Changes:** they request them (text/email/form), Eyu makes them, pushes, live.

**Honest limit:** published HTML is always visible (View Source, and the Vercel owner can see deployed files). They could copy a page into normal Claude and edit it. That is fine. The protection is that they don't have the repo, the setup, or one-command publishing, so doing it themselves is a hassle.

## Ownership (how to explain it)
- **Carl owns:** domains, Vercel account + hosting, his Claude account, his content (logo, photos, business info, copy).
- **Eyu owns:** the code and design system, licensed to Carl while he's a client.
- **Changes:** request-based, Eyu does them.
- **Code buyout:** if they want the source and the right to self-edit, one-time fee.

Script: *"You own your domain, hosting, and content, and the site runs on your accounts. I keep the code and handle all updates, so it stays maintained and nothing breaks. If you ever want to take the code and manage it yourselves, there's a one-time buyout."*

Put it in a short written agreement before handoff.

## Pricing at about $1,000-$1,500 for 2 sites
**Scope to match the money:**
- One page per site: hero, services, about, reviews, service area, call/quote CTA.
- One shared template, reskinned per brand.
- 2 revision rounds per site, extra rounds are paid changes.
- They send all content up front (logo, photos, services, phone, service area).
- No booking, blog, extra forms or SEO packages. Those are add-ons.

**Make the money on the back end:**
- Care plan: $75-$100/site/mo, includes a couple of small edits. (The 10-04 contract had $250 CAD/site/mo for up to 10 requests. Keep that if Vikas will hold it.)
- No plan: $50-$75 per small edit, bigger changes quoted.
- Code buyout: $1,500-$2,500.
- Their costs on top: Vercel Pro, Claude Team plan (incl. Eyu's seat) if they insist on it, domains.

**What to say to Vikas:**
> "I can do both for $1,500. That covers a one-page site for each, 2 revision rounds, set up on your Vercel. After launch, updates are $75/month per site, or $60 per change, and I handle everything so you never have to touch it."

Push for $1,500, not $1,000.

## Next actions
- [ ] Confirm the final number with Vikas ($1,000 vs $1,500) and whether the care plan is in.
- [ ] Revise the contract: 2 sites, no training, ownership/licence + buyout clause, care plan.
- [ ] Get Carl's Vercel access (team invite or token) and domain access.
- [ ] Get content (WordPress login or files).
- [ ] Build shared template, then the 2 sites; set up the GitHub Action deploy.
