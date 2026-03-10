-- Phase 15: User Dashboard - Notifications / inbox

create table if not exists public.user_notifications (
  notification_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid null,
  project_id uuid null references public.projects(project_id) on delete set null,
  run_id uuid null references public.training_runs(run_id) on delete set null,
  model_id uuid null references public.models(model_id) on delete set null,
  export_id uuid null references public.exports(export_id) on delete set null,
  deployment_id uuid null references public.deployments(deployment_id) on delete set null,
  type text not null,
  title text not null,
  body text,
  data jsonb default '{}'::jsonb,
  severity text not null default 'info' check (severity in ('info','warning','error')),
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists user_notifications_user_id_idx on public.user_notifications(user_id);
create index if not exists user_notifications_team_id_idx on public.user_notifications(team_id);
create index if not exists user_notifications_created_at_idx on public.user_notifications(created_at desc);
create index if not exists user_notifications_read_at_idx on public.user_notifications(read_at);

alter table public.user_notifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_notifications' and policyname='user_notifications_select_own'
  ) then
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name='team_members') then
      create policy user_notifications_select_own
        on public.user_notifications
        for select
        using (
          auth.uid() = user_id
          or (
            team_id is not null and exists (
              select 1 from public.team_members
              where team_members.team_id = user_notifications.team_id
                and team_members.user_id = auth.uid()
                and team_members.status = 'active'
            )
          )
        );
    else
      create policy user_notifications_select_own
        on public.user_notifications
        for select
        using (auth.uid() = user_id);
    end if;
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_notifications' and policyname='user_notifications_update_own'
  ) then
    create policy user_notifications_update_own
      on public.user_notifications
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;
