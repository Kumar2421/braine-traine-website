-- Phase 2A: License + IDE handshake (metadata-only)

-- Licenses issued by the website control-plane.
create table if not exists public.licenses (
  license_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  license_type text not null check (license_type in ('free', 'pro', 'enterprise')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz null,
  offline_signature text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists licenses_user_id_idx on public.licenses(user_id);
create index if not exists licenses_active_idx on public.licenses(user_id, is_active);

alter table public.licenses enable row level security;

-- Users can read their own licenses.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='licenses' and policyname='licenses_select_own'
  ) then
    create policy licenses_select_own
      on public.licenses
      for select
      using (auth.uid() = user_id);
  end if;
end$$;

-- Users can insert their own license rows (used for bootstrap / migration tooling).
-- In production, you may want to restrict this to a service role / admin process.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='licenses' and policyname='licenses_insert_own'
  ) then
    create policy licenses_insert_own
      on public.licenses
      for insert
      with check (auth.uid() = user_id);
  end if;
end$$;

-- IDE short-lived auth tokens issued after web login.
create table if not exists public.ide_auth_tokens (
  token text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  license_type text not null check (license_type in ('free', 'pro', 'enterprise')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz null
);

create index if not exists ide_auth_tokens_user_id_idx on public.ide_auth_tokens(user_id);
create index if not exists ide_auth_tokens_expires_idx on public.ide_auth_tokens(expires_at);

alter table public.ide_auth_tokens enable row level security;

-- Users can insert tokens for themselves (token created client-side after auth).
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ide_auth_tokens' and policyname='ide_tokens_insert_own'
  ) then
    create policy ide_tokens_insert_own
      on public.ide_auth_tokens
      for insert
      with check (auth.uid() = user_id);
  end if;
end$$;

-- Users can read their own tokens (useful for debugging). You can disable later.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ide_auth_tokens' and policyname='ide_tokens_select_own'
  ) then
    create policy ide_tokens_select_own
      on public.ide_auth_tokens
      for select
      using (auth.uid() = user_id);
  end if;
end$$;

-- IDE deep-link auth exchanges (short-lived, single-use; never Supabase JWT).
create table if not exists public.auth_exchanges (
  token text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used boolean not null default false
);

create index if not exists auth_exchanges_user_id_idx on public.auth_exchanges(user_id);
create index if not exists auth_exchanges_expires_idx on public.auth_exchanges(expires_at);

alter table public.auth_exchanges enable row level security;

-- Users can insert exchanges for themselves (token created client-side after auth).
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='auth_exchanges' and policyname='auth_exchanges_insert_own'
  ) then
    create policy auth_exchanges_insert_own
      on public.auth_exchanges
      for insert
      with check (auth.uid() = user_id);
  end if;
end$$;

-- Users can read their own exchanges (debugging). You can tighten later.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='auth_exchanges' and policyname='auth_exchanges_select_own'
  ) then
    create policy auth_exchanges_select_own
      on public.auth_exchanges
      for select
      using (auth.uid() = user_id);
  end if;
end$$;

-- Upgrade hooks (no payments): Pro access requests + Enterprise contact.
create table if not exists public.access_requests (
  request_id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('pro', 'enterprise')),
  user_id uuid null references auth.users(id) on delete set null,
  name text null,
  email text not null,
  message text null,
  created_at timestamptz not null default now()
);

-- Extend access requests into a lightweight contact/inbox system.
alter table public.access_requests add column if not exists company text null;
alter table public.access_requests add column if not exists status text not null default 'new' check (status in ('new', 'handled'));
alter table public.access_requests add column if not exists handled_at timestamptz null;
alter table public.access_requests add column if not exists handled_by uuid null;
alter table public.access_requests add column if not exists resend_count integer not null default 0;
alter table public.access_requests add column if not exists resent_at timestamptz null;
alter table public.access_requests add column if not exists resent_by uuid null;

create index if not exists access_requests_user_id_idx on public.access_requests(user_id);
create index if not exists access_requests_type_idx on public.access_requests(request_type);

alter table public.access_requests enable row level security;

-- Allow public inserts (metadata-only). Consider adding rate limits / CAPTCHA later.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='access_requests' and policyname='access_requests_insert_any'
  ) then
    create policy access_requests_insert_any
      on public.access_requests
      for insert
      with check (true);
  end if;
end$$;

-- Logged-in users can view their own requests.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='access_requests' and policyname='access_requests_select_own'
  ) then
    create policy access_requests_select_own
      on public.access_requests
      for select
      using (auth.uid() = user_id);
  end if;
end$$;

-- Admins can view and update requests (inbox workflows).
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='access_requests' and policyname='access_requests_admin_select'
  ) then
    create policy access_requests_admin_select
      on public.access_requests
      for select
      using (public.can_access_admin_panel());
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='access_requests' and policyname='access_requests_admin_update'
  ) then
    create policy access_requests_admin_update
      on public.access_requests
      for update
      using (public.can_access_admin_panel())
      with check (public.can_access_admin_panel());
  end if;
end$$;
