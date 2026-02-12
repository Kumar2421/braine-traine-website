-- Phase 16: User Dashboard - Team / collaboration (invites + project membership)

-- Project members (share projects with team members / collaborators)
create table if not exists public.project_members (
  project_member_id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(project_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  unique(project_id, user_id)
);

create index if not exists project_members_project_id_idx on public.project_members(project_id);
create index if not exists project_members_user_id_idx on public.project_members(user_id);

alter table public.project_members enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='project_members' and policyname='project_members_select'
  ) then
    create policy project_members_select
      on public.project_members
      for select
      using (
        auth.uid() = user_id
        or exists (
          select 1 from public.projects p
          where p.project_id = project_members.project_id
            and p.user_id = auth.uid()
        )
      );
  end if;
end$$;

-- Add optional team/project linkage on projects
alter table public.projects
  add column if not exists team_id uuid null;

create index if not exists projects_team_id_idx on public.projects(team_id);

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='teams') then
    if not exists (
      select 1 from information_schema.table_constraints
      where constraint_schema='public'
        and table_name='projects'
        and constraint_name='projects_team_id_fkey'
    ) then
      alter table public.projects
        add constraint projects_team_id_fkey
        foreign key (team_id) references public.teams(team_id) on delete set null;
    end if;
  end if;
end$$;
