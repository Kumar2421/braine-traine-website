-- Phase 12: User Dashboard - Model registry lifecycle (Option 1: extend existing models)

alter table public.models
  add column if not exists stage text not null default 'dev' check (stage in ('dev','staging','prod','archived')),
  add column if not exists tags text[] default array[]::text[],
  add column if not exists description text,
  add column if not exists lineage jsonb default '{}'::jsonb,
  add column if not exists promoted_from_run_id uuid null references public.training_runs(run_id) on delete set null,
  add column if not exists deployed_as jsonb default '{}'::jsonb;

create index if not exists models_stage_idx on public.models(stage);
create index if not exists models_tags_gin_idx on public.models using gin(tags);
create index if not exists models_promoted_from_run_id_idx on public.models(promoted_from_run_id);

-- Optional: enforce updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_models_updated_at on public.models;
create trigger update_models_updated_at
  before update on public.models
  for each row
  execute function public.update_updated_at_column();
