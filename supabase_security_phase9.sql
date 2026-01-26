-- Phase 9: Security telemetry + blocklists (email / ip_address / user_id)

-- Helper: super-admin gate (requires is_admin + admin_role = super)
create or replace function public.can_access_admin_super()
returns boolean
language plpgsql
security definer
as $$
begin
  return public.can_access_admin_role('super');
end;
$$;

grant execute on function public.can_access_admin_super() to authenticated;

-- Blocklist table
create table if not exists public.admin_blocklist (
  block_id uuid primary key default gen_random_uuid(),
  email text null,
  ip_address inet null,
  user_id uuid null references auth.users(id) on delete cascade,
  reason text null,
  is_active boolean not null default true,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id) on delete set null,
  constraint admin_blocklist_one_target check (num_nonnulls(email, ip_address, user_id) = 1)
);

create index if not exists admin_blocklist_email_idx on public.admin_blocklist(lower(email));
create index if not exists admin_blocklist_ip_idx on public.admin_blocklist(ip_address);
create index if not exists admin_blocklist_user_id_idx on public.admin_blocklist(user_id);
create index if not exists admin_blocklist_active_idx on public.admin_blocklist(is_active);
create index if not exists admin_blocklist_created_at_idx on public.admin_blocklist(created_at desc);

alter table public.admin_blocklist enable row level security;

drop policy if exists admin_blocklist_super_all on public.admin_blocklist;
create policy admin_blocklist_super_all
  on public.admin_blocklist
  for all
  using (public.can_access_admin_super())
  with check (public.can_access_admin_super());

-- Security events table (append-only)
create table if not exists public.admin_security_events (
  event_id uuid primary key default gen_random_uuid(),
  event_type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  email text null,
  ip_address inet null,
  user_id uuid null references auth.users(id) on delete set null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists admin_security_events_created_at_idx on public.admin_security_events(created_at desc);
create index if not exists admin_security_events_event_type_idx on public.admin_security_events(event_type);
create index if not exists admin_security_events_user_id_idx on public.admin_security_events(user_id);
create index if not exists admin_security_events_ip_idx on public.admin_security_events(ip_address);
create index if not exists admin_security_events_email_idx on public.admin_security_events(lower(email));

alter table public.admin_security_events enable row level security;

drop policy if exists admin_security_events_super_all on public.admin_security_events;
create policy admin_security_events_super_all
  on public.admin_security_events
  for all
  using (public.can_access_admin_super())
  with check (public.can_access_admin_super());

-- RPC: list blocklist
create or replace function public.admin_blocklist_list(active_only boolean default true)
returns setof public.admin_blocklist
language plpgsql
security definer
as $$
begin
  if not public.can_access_admin_super() then
    raise exception 'Access denied';
  end if;

  if active_only then
    return query
      select * from public.admin_blocklist
      where is_active = true
      order by created_at desc;
  else
    return query
      select * from public.admin_blocklist
      order by created_at desc;
  end if;
end;
$$;

grant execute on function public.admin_blocklist_list(boolean) to authenticated;

-- RPC: add blocklist entry
create or replace function public.admin_blocklist_add(
  email_val text default null,
  ip_address_val inet default null,
  user_id_val uuid default null,
  reason_val text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  new_id uuid;
  acting_user uuid;
begin
  if not public.can_access_admin_super() then
    raise exception 'Access denied';
  end if;

  acting_user := auth.uid();

  insert into public.admin_blocklist (email, ip_address, user_id, reason, created_by, updated_by)
  values (
    nullif(trim(email_val), ''),
    ip_address_val,
    user_id_val,
    nullif(trim(reason_val), ''),
    acting_user,
    acting_user
  )
  returning block_id into new_id;

  insert into public.admin_security_events (event_type, severity, email, ip_address, user_id, metadata)
  values (
    'blocklist_add',
    'warning',
    nullif(trim(email_val), ''),
    ip_address_val,
    user_id_val,
    jsonb_build_object('reason', reason_val, 'block_id', new_id)
  );

  return new_id;
end;
$$;

grant execute on function public.admin_blocklist_add(text, inet, uuid, text) to authenticated;

-- RPC: deactivate blocklist entry
create or replace function public.admin_blocklist_deactivate(block_id_val uuid)
returns void
language plpgsql
security definer
as $$
declare
  acting_user uuid;
  row_rec record;
begin
  if not public.can_access_admin_super() then
    raise exception 'Access denied';
  end if;

  acting_user := auth.uid();

  update public.admin_blocklist
  set is_active = false,
      updated_at = now(),
      updated_by = acting_user
  where block_id = block_id_val;

  select email, ip_address, user_id
  into row_rec
  from public.admin_blocklist
  where block_id = block_id_val;

  insert into public.admin_security_events (event_type, severity, email, ip_address, user_id, metadata)
  values (
    'blocklist_deactivate',
    'info',
    row_rec.email,
    row_rec.ip_address,
    row_rec.user_id,
    jsonb_build_object('block_id', block_id_val)
  );
end;
$$;

grant execute on function public.admin_blocklist_deactivate(uuid) to authenticated;

-- RPC: recent security events
create or replace function public.admin_security_events_recent(limit_val integer default 50)
returns setof public.admin_security_events
language plpgsql
security definer
as $$
begin
  if not public.can_access_admin_super() then
    raise exception 'Access denied';
  end if;

  return query
    select *
    from public.admin_security_events
    order by created_at desc
    limit greatest(1, least(coalesce(limit_val, 50), 200));
end;
$$;

grant execute on function public.admin_security_events_recent(integer) to authenticated;
