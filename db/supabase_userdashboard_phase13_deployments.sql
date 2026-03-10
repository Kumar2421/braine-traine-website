-- Phase 13: User Dashboard - Deployments

create table if not exists public.deployments (
  deployment_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid null,
  project_id uuid null references public.projects(project_id) on delete set null,
  model_id uuid null references public.models(model_id) on delete set null,
  environment text not null default 'dev' check (environment in ('dev','staging','prod')),
  status text not null default 'creating' check (status in ('creating','active','paused','failed','rolled_back')),
  endpoint_url text,
  traffic_split jsonb default '{}'::jsonb,
  config jsonb default '{}'::jsonb,
  health jsonb default '{}'::jsonb,
  last_deployed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deployments_user_id_idx on public.deployments(user_id);
create index if not exists deployments_team_id_idx on public.deployments(team_id);
create index if not exists deployments_project_id_idx on public.deployments(project_id);
create index if not exists deployments_model_id_idx on public.deployments(model_id);
create index if not exists deployments_environment_idx on public.deployments(environment);

alter table public.deployments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='deployments' and policyname='deployments_select_own'
  ) then
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name='team_members') then
      create policy deployments_select_own
        on public.deployments
        for select
        using (
          auth.uid() = user_id
          or (
            team_id is not null and exists (
              select 1 from public.team_members
              where team_members.team_id = deployments.team_id
                and team_members.user_id = auth.uid()
                and team_members.status = 'active'
            )
          )
        );
    else
      create policy deployments_select_own
        on public.deployments
        for select
        using (auth.uid() = user_id);
    end if;
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='deployments' and policyname='deployments_insert_own'
  ) then
    create policy deployments_insert_own
      on public.deployments
      for insert
      with check (auth.uid() = user_id);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='deployments' and policyname='deployments_update_own'
  ) then
    create policy deployments_update_own
      on public.deployments
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_deployments_updated_at on public.deployments;
create trigger update_deployments_updated_at
  before update on public.deployments
  for each row
  execute function public.update_updated_at_column();
