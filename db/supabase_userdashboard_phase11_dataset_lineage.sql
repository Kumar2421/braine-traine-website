-- Phase 11: User Dashboard - Dataset & data lineage

-- Minimal datasets table to support dataset versions + lineage from runs
create table if not exists public.datasets (
  dataset_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(project_id) on delete cascade,
  team_id uuid null,
  name text not null,
  version text null,
  status text not null default 'active' check (status in ('active', 'archived')),
  ide_dataset_id text null,
  stats jsonb default '{}'::jsonb,
  validation jsonb default '{}'::jsonb,
  source_meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists datasets_user_id_idx on public.datasets(user_id);
create index if not exists datasets_project_id_idx on public.datasets(project_id);
create index if not exists datasets_team_id_idx on public.datasets(team_id);
create index if not exists datasets_ide_dataset_id_idx on public.datasets(ide_dataset_id);

alter table public.datasets enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='datasets' and policyname='datasets_select_own'
  ) then
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name='team_members') then
      create policy datasets_select_own
        on public.datasets
        for select
        using (
          auth.uid() = user_id
          or (
            team_id is not null and exists (
              select 1 from public.team_members
              where team_members.team_id = datasets.team_id
                and team_members.user_id = auth.uid()
                and team_members.status = 'active'
            )
          )
        );
    else
      create policy datasets_select_own
        on public.datasets
        for select
        using (auth.uid() = user_id);
    end if;
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='datasets' and policyname='datasets_insert_own'
  ) then
    create policy datasets_insert_own
      on public.datasets
      for insert
      with check (auth.uid() = user_id);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='datasets' and policyname='datasets_update_own'
  ) then
    create policy datasets_update_own
      on public.datasets
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

-- Link datasets to training runs (lineage)
alter table public.training_runs
  add column if not exists dataset_id uuid null references public.datasets(dataset_id) on delete set null,
  add column if not exists dataset_version text null;

create index if not exists training_runs_dataset_id_idx on public.training_runs(dataset_id);

-- Keep updated_at fresh
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_datasets_updated_at on public.datasets;
create trigger update_datasets_updated_at
  before update on public.datasets
  for each row
  execute function public.update_updated_at_column();
