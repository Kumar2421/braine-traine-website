-- Support (realtime) schema

create table if not exists public.support_messages (
    id bigserial primary key,
    user_id uuid not null references public.profiles(id) on delete cascade,
    role text not null default 'user' check (role in ('user','support','system')),
    message text not null,
    attachments jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
);

alter table public.support_messages
add column if not exists attachments jsonb not null default '[]'::jsonb;

alter table public.support_messages enable row level security;

drop policy if exists support_messages_select_own on public.support_messages;
create policy support_messages_select_own
on public.support_messages
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists support_messages_select_admin on public.support_messages;
create policy support_messages_select_admin
on public.support_messages
for select
to authenticated
using (public.can_access_admin_panel());

drop policy if exists support_messages_insert_own on public.support_messages;
create policy support_messages_insert_own
on public.support_messages
for insert
to authenticated
with check (user_id = auth.uid() and role = 'user');

drop policy if exists support_messages_insert_admin on public.support_messages;
create policy support_messages_insert_admin
on public.support_messages
for insert
to authenticated
with check (public.can_access_admin_panel() and role = 'support');

drop policy if exists support_messages_update_none on public.support_messages;
create policy support_messages_update_none
on public.support_messages
for update
to authenticated
using (false);

drop policy if exists support_messages_delete_none on public.support_messages;
create policy support_messages_delete_none
on public.support_messages
for delete
to authenticated
using (false);

-- Realtime (Postgres Changes) requires replica identity / publication.
-- Ensure your Supabase project has Realtime enabled and the table is in the publication.

grant usage on schema public to authenticated;
grant select, insert on public.support_messages to authenticated;
grant usage, select on sequence public.support_messages_id_seq to authenticated;

-- Support attachments (Supabase Storage)
insert into storage.buckets (id, name, public)
values ('support_attachments', 'support_attachments', true)
on conflict (id) do nothing;

drop policy if exists support_attachments_select on storage.objects;
create policy support_attachments_select
on storage.objects
for select
to authenticated
using (
    bucket_id = 'support_attachments'
    and (
        public.can_access_admin_panel()
        or (storage.foldername(name))[1] = auth.uid()::text
    )
);

drop policy if exists support_attachments_insert_own on storage.objects;
create policy support_attachments_insert_own
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'support_attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists support_attachments_insert_admin on storage.objects;
create policy support_attachments_insert_admin
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'support_attachments'
    and public.can_access_admin_panel()
);
