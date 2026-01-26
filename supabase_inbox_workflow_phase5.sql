-- Phase 5: Extend access_requests into a proper support inbox workflow
-- Adds tags, assignment, linked user + crash event references, and expands status options.

-- Expand status constraint to include investigating/resolved.
-- Drop existing check constraint if present, then re-add with expanded enum.
do $$
declare
  c_name text;
begin
  select conname into c_name
  from pg_constraint
  where conrelid = 'public.access_requests'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%'
  limit 1;

  if c_name is not null then
    execute format('alter table public.access_requests drop constraint %I', c_name);
  end if;
exception
  when undefined_table then
    -- table may not exist in some environments
    null;
end$$;

alter table public.access_requests
  add column if not exists status text not null default 'new',
  add column if not exists handled_at timestamptz null,
  add column if not exists handled_by uuid null references auth.users(id) on delete set null,
  add column if not exists resend_count integer not null default 0,
  add column if not exists resent_at timestamptz null,
  add column if not exists resent_by uuid null references auth.users(id) on delete set null,
  add column if not exists tag text null,
  add column if not exists assigned_to uuid null references auth.users(id) on delete set null,
  add column if not exists assigned_at timestamptz null,
  add column if not exists updated_at timestamptz null,
  add column if not exists updated_by uuid null references auth.users(id) on delete set null,
  add column if not exists linked_user_id uuid null references auth.users(id) on delete set null,
  add column if not exists crash_event_id uuid null;

-- Re-add expanded status constraint
alter table public.access_requests
  alter column status set default 'new';

alter table public.access_requests
  add constraint access_requests_status_check
  check (status in ('new', 'handled', 'investigating', 'resolved'));

-- Helpful indexes for admin inbox filtering
create index if not exists access_requests_status_idx on public.access_requests(status);
create index if not exists access_requests_tag_idx on public.access_requests(tag);
create index if not exists access_requests_assigned_to_idx on public.access_requests(assigned_to);
create index if not exists access_requests_linked_user_id_idx on public.access_requests(linked_user_id);
create index if not exists access_requests_crash_event_id_idx on public.access_requests(crash_event_id);
