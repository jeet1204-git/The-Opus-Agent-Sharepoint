# The Opus — Local Setup (10 minutes)

> Goal: get the app running against a **fresh, separate** Supabase project (NOT your AURA account).

## 1. Create the Supabase project
1. Go to https://supabase.com → log in **with the separate hackathon account**.
2. **New project** → name it `the-opus`, pick a region close to you (e.g. EU West), set a DB password.
3. Wait ~2 min for it to provision.

## 2. Run the schema
1. In the project: **SQL Editor** → **New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. You should see "Success". This creates all tables, RLS, the search function, and the `assets` storage bucket.

## 3. Get your keys → create `.env.local`
1. **Project Settings → API**. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`  (keep secret!)
2. From **Google AI Studio → API Keys**: copy your key → `GEMINI_API_KEY`.
3. In `the-opus/`, run `cp .env.example .env.local` and paste the four values in.

> `.env.local` is gitignored — never commit it. Share keys with teammates over DM, not git.

## 4. Create your org + first admin user
Run this in the Supabase **SQL Editor** (replace the email):
```sql
-- a) create the company
insert into public.organizations (name) values ('Acme Corp')
returning id;  -- copy this org id
```
Then **Authentication → Users → Add user** (email + password, auto-confirm). After creating, run:
```sql
-- b) attach that user to the org as admin (use the org id + the new user's email)
update public.profiles
set org_id = '<ORG_ID_FROM_ABOVE>', role = 'admin', full_name = 'Your Name'
where email = '<your-email>';
```
(Once the in-app Admin page is built, this becomes point-and-click.)

## 5. Run it
```bash
cd the-opus
npm install
npm run dev
```
Open http://localhost:3000 → you should be redirected to `/login`.

## Deploy (later)
Vercel → import the repo → set **Root Directory = `the-opus`** → add the same env vars.
