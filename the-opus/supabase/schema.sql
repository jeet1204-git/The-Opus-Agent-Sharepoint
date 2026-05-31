-- ============================================================================
-- THE OPUS — Agent SharePoint  |  Full database schema
-- Paste this whole file into Supabase → SQL Editor → Run (once, on the NEW project).
-- Postgres 17 + pgvector. Multi-tenant (org-scoped) with Row-Level Security.
-- Embeddings: OpenRouter openai/text-embedding-3-small (dimensions=768).
-- ============================================================================

-- 1. EXTENSIONS ---------------------------------------------------------------
create extension if not exists vector;

-- 2. TABLES -------------------------------------------------------------------

-- Organizations = the company tenant
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Profiles = app users, 1:1 with auth.users, scoped to an org
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  org_id      uuid references public.organizations(id) on delete cascade,
  full_name   text,
  email       text,
  role        text not null default 'member' check (role in ('admin','member')),
  department  text,
  created_at  timestamptz not null default now()
);

-- Allowlist of authorized employee emails (admin-managed). An email must exist
-- here before that person can sign up; they then verify + set their own password.
create table if not exists public.org_allowlist (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.organizations(id) on delete cascade,
  email             text not null,
  full_name         text,
  department        text,
  role              text not null default 'member' check (role in ('admin','member')),
  status            text not null default 'invited' check (status in ('invited','active')),
  activation_token  text,
  token_expires_at  timestamptz,
  invited_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now()
);
create unique index if not exists org_allowlist_email_uniq
  on public.org_allowlist (org_id, lower(email));
create index if not exists org_allowlist_token_idx
  on public.org_allowlist (activation_token);

-- Assets = the shared things: agents | skills | prompts
create table if not exists public.assets (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  type            text not null check (type in ('agent','skill','prompt')),
  title           text not null,
  description     text,
  -- metadata: { purpose, requirements, tools[], when_not_to_use, framework }
  metadata        jsonb not null default '{}'::jsonb,
  content         text,                 -- the actual prompt / config text
  file_url        text,                 -- optional uploaded file (storage)
  tags            text[] not null default '{}',
  embedding       vector(768),          -- OpenRouter text-embedding-3-small
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Versions of an asset
create table if not exists public.versions (
  id           uuid primary key default gen_random_uuid(),
  asset_id     uuid not null references public.assets(id) on delete cascade,
  version_label text not null default 'v1',
  changelog    text,
  content      text,
  file_url     text,
  created_at   timestamptz not null default now()
);

-- Reviews (rating + comment) — a trust signal
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  asset_id    uuid not null references public.assets(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

-- Likes / endorsements — a trust signal
create table if not exists public.likes (
  asset_id    uuid not null references public.assets(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (asset_id, user_id)
);

-- Usage log (download | run) — powers "used by N teams"
create table if not exists public.usages (
  id          uuid primary key default gen_random_uuid(),
  asset_id    uuid not null references public.assets(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  action      text not null check (action in ('download','run')),
  created_at  timestamptz not null default now()
);

-- Indexes
create index if not exists idx_assets_org      on public.assets(org_id);
create index if not exists idx_assets_owner    on public.assets(owner_id);
create index if not exists idx_assets_type     on public.assets(type);
create index if not exists idx_reviews_asset   on public.reviews(asset_id);
create index if not exists idx_usages_asset    on public.usages(asset_id);
-- Vector similarity index (cosine)
create index if not exists idx_assets_embedding
  on public.assets using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 3. HELPER: current user's org -----------------------------------------------
create or replace function public.current_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from public.profiles where id = auth.uid();
$$;

-- 4. NEW-USER TRIGGER ---------------------------------------------------------
-- When someone signs up, create their profile from auth metadata
-- (admin sets org_id / role / full_name when inviting).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, org_id, full_name, email, role, department)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'org_id','')::uuid,
    new.raw_user_meta_data->>'full_name',
    new.email,
    coalesce(new.raw_user_meta_data->>'role','member'),
    new.raw_user_meta_data->>'department'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. SEMANTIC SEARCH RPC ------------------------------------------------------
-- Embed the query in the app, pass the vector here. Returns same-org matches.
create or replace function public.match_assets(
  query_embedding vector(768),
  match_count int default 10
)
returns table (
  id uuid, type text, title text, description text,
  metadata jsonb, tags text[], owner_id uuid, created_at timestamptz,
  similarity float
)
language sql stable as $$
  select a.id, a.type, a.title, a.description, a.metadata, a.tags,
         a.owner_id, a.created_at,
         1 - (a.embedding <=> query_embedding) as similarity
  from public.assets a
  where a.org_id = public.current_org_id()
    and a.embedding is not null
  order by a.embedding <=> query_embedding
  limit match_count;
$$;

-- 5b. FUNCTION EXPOSURE HARDENING (Supabase security advisor) ------------------
-- Pin search_path on the search function.
alter function public.match_assets(vector, integer) set search_path = public;
-- handle_new_user is a trigger fn — never callable via the REST API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- current_org_id is SECURITY DEFINER and used inside RLS policies, so it MUST stay
-- callable by `authenticated`; just remove the needless anon/public exposure.
revoke execute on function public.current_org_id() from public, anon;
grant execute on function public.current_org_id() to authenticated;

-- 6. ROW-LEVEL SECURITY -------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.profiles      enable row level security;
alter table public.assets        enable row level security;
alter table public.versions      enable row level security;
alter table public.reviews       enable row level security;
alter table public.likes         enable row level security;
alter table public.usages        enable row level security;

-- Organizations: members see only their own org
drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
  for select using (id = public.current_org_id());

-- Profiles: see members of your org; update only yourself
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (org_id = public.current_org_id());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid());

-- Assets: read within org; write your own within org
drop policy if exists assets_select on public.assets;
create policy assets_select on public.assets
  for select using (org_id = public.current_org_id());
drop policy if exists assets_insert on public.assets;
create policy assets_insert on public.assets
  for insert with check (org_id = public.current_org_id() and owner_id = auth.uid());
drop policy if exists assets_update_own on public.assets;
create policy assets_update_own on public.assets
  for update using (owner_id = auth.uid());
drop policy if exists assets_delete_own on public.assets;
create policy assets_delete_own on public.assets
  for delete using (owner_id = auth.uid());

-- Child tables: allowed when the parent asset is in your org
drop policy if exists versions_all on public.versions;
create policy versions_all on public.versions
  for all using (exists (select 1 from public.assets a where a.id = asset_id and a.org_id = public.current_org_id()));

drop policy if exists reviews_select on public.reviews;
create policy reviews_select on public.reviews
  for select using (exists (select 1 from public.assets a where a.id = asset_id and a.org_id = public.current_org_id()));
drop policy if exists reviews_write on public.reviews;
create policy reviews_write on public.reviews
  for insert with check (user_id = auth.uid() and exists (select 1 from public.assets a where a.id = asset_id and a.org_id = public.current_org_id()));

drop policy if exists likes_select on public.likes;
create policy likes_select on public.likes
  for select using (exists (select 1 from public.assets a where a.id = asset_id and a.org_id = public.current_org_id()));
drop policy if exists likes_write on public.likes;
create policy likes_write on public.likes
  for insert with check (user_id = auth.uid());
drop policy if exists likes_delete on public.likes;
create policy likes_delete on public.likes
  for delete using (user_id = auth.uid());

drop policy if exists usages_select on public.usages;
create policy usages_select on public.usages
  for select using (exists (select 1 from public.assets a where a.id = asset_id and a.org_id = public.current_org_id()));
drop policy if exists usages_write on public.usages;
create policy usages_write on public.usages
  for insert with check (user_id = auth.uid());

-- Allowlist: admins of the org manage their own org's entries. Public signup
-- checks run via a service-role server action (bypasses RLS), so this is locked.
alter table public.org_allowlist enable row level security;
drop policy if exists allowlist_admin_all on public.org_allowlist;
create policy allowlist_admin_all on public.org_allowlist
  for all
  using (
    org_id = public.current_org_id()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    org_id = public.current_org_id()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 7. STORAGE BUCKET (for uploaded agent files) --------------------------------
insert into storage.buckets (id, name, public)
values ('assets', 'assets', false)
on conflict (id) do nothing;

drop policy if exists assets_bucket_read on storage.objects;
create policy assets_bucket_read on storage.objects
  for select to authenticated using (bucket_id = 'assets');
drop policy if exists assets_bucket_write on storage.objects;
create policy assets_bucket_write on storage.objects
  for insert to authenticated with check (bucket_id = 'assets');

-- ============================================================================
-- DONE. Next: create your org + admin user (see SETUP.md step 4).
-- ============================================================================
