-- Phase 2B: Projects, Downloads, and Exports tracking (metadata-only)

-- Projects table: tracks IDE projects synced to website
create table if not exists public.projects (
  project_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  ide_project_id text null, -- Optional: ID from IDE for sync
  task_type text null check (task_type in ('detection', 'classification', 'segmentation', 'face_recognition', null)),
  dataset_count integer not null default 0,
  last_trained_at timestamptz null,
  status text not null default 'active' check (status in ('active', 'archived', 'deleted')),
  ide_version text null, -- IDE version that last synced this project
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_ide_project_id_idx on public.projects(ide_project_id);
create index if not exists projects_status_idx on public.projects(user_id, status);

alter table public.projects enable row level security;

-- Users can read their own projects
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='projects' and policyname='projects_select_own'
  ) then
    create policy projects_select_own
      on public.projects
      for select
      using (auth.uid() = user_id);
  end if;
end$$;

-- Users can insert their own projects
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='projects' and policyname='projects_insert_own'
  ) then
    create policy projects_insert_own
      on public.projects
      for insert
      with check (auth.uid() = user_id);
  end if;
end$$;

-- Users can update their own projects
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='projects' and policyname='projects_update_own'
  ) then
    create policy projects_update_own
      on public.projects
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

-- Users can delete their own projects
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='projects' and policyname='projects_delete_own'
  ) then
    create policy projects_delete_own
      on public.projects
      for delete
      using (auth.uid() = user_id);
  end if;
end$$;

-- Downloads table: tracks IDE downloads
create table if not exists public.downloads (
  download_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  version text not null,
  os text not null check (os in ('windows', 'macos', 'linux')),
  ide_version text null,
  downloaded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists downloads_user_id_idx on public.downloads(user_id);
create index if not exists downloads_downloaded_at_idx on public.downloads(downloaded_at);

alter table public.downloads enable row level security;

-- Users can read their own downloads
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='downloads' and policyname='downloads_select_own'
  ) then
    create policy downloads_select_own
      on public.downloads
      for select
      using (auth.uid() = user_id);
  end if;
end$$;

-- Users can insert their own downloads
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='downloads' and policyname='downloads_insert_own'
  ) then
    create policy downloads_insert_own
      on public.downloads
      for insert
      with check (auth.uid() = user_id);
  end if;
end$$;

-- Exports table: tracks model exports from IDE
create table if not exists public.exports (
  export_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid null references public.projects(project_id) on delete set null,
  model_name text not null,
  format text not null check (format in ('onnx', 'torchscript', 'tensorrt', 'tflite', 'coreml', 'ncnn', 'openvino', 'safetensors')),
  exported_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists exports_user_id_idx on public.exports(user_id);
create index if not exists exports_project_id_idx on public.exports(project_id);
create index if not exists exports_exported_at_idx on public.exports(exported_at);

alter table public.exports enable row level security;

-- Users can read their own exports
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='exports' and policyname='exports_select_own'
  ) then
    create policy exports_select_own
      on public.exports
      for select
      using (auth.uid() = user_id);
  end if;
end$$;

-- Users can insert their own exports
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='exports' and policyname='exports_insert_own'
  ) then
    create policy exports_insert_own
      on public.exports
      for insert
      with check (auth.uid() = user_id);
  end if;
end$$;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for projects table
drop trigger if exists update_projects_updated_at on public.projects;
create trigger update_projects_updated_at
  before update on public.projects
  for each row
  execute function update_updated_at_column();

