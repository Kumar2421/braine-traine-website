-- Phase 10: User Dashboard - Run details + artifacts/metrics (Option 1: extend existing tables)

-- Extend training_runs to support richer run details (metrics, artifacts, logs)
alter table public.training_runs
  add column if not exists model_name text,
  add column if not exists base_model text,
  add column if not exists dataset_ref jsonb default '{}'::jsonb,
  add column if not exists metrics jsonb default '{}'::jsonb,
  add column if not exists metrics_timeseries jsonb default '{}'::jsonb,
  add column if not exists artifacts jsonb default '[]'::jsonb,
  add column if not exists logs_excerpt text,
  add column if not exists logs_meta jsonb default '{}'::jsonb,
  add column if not exists git_commit text,
  add column if not exists git_branch text,
  add column if not exists config_hash text,
  add column if not exists ide_platform text,
  add column if not exists ide_build text,
  add column if not exists last_heartbeat_at timestamptz,
  add column if not exists finished_reason text;

create index if not exists training_runs_project_run_id_idx
  on public.training_runs(project_id, run_id);

create index if not exists training_runs_user_start_time_idx
  on public.training_runs(user_id, start_time desc);

create index if not exists training_runs_config_hash_idx
  on public.training_runs(config_hash);

-- Keep updated_at fresh
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_training_runs_updated_at on public.training_runs;
create trigger update_training_runs_updated_at
  before update on public.training_runs
  for each row
  execute function public.update_updated_at_column();
