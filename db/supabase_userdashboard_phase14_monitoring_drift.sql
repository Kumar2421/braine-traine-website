-- Phase 14: User Dashboard - Monitoring, drift, alerting (minimal schema)

create table if not exists public.deployment_metrics (
  metric_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid null,
  deployment_id uuid not null references public.deployments(deployment_id) on delete cascade,
  metric_type text not null, -- 'latency', 'throughput', 'errors', 'drift'
  metric_data jsonb not null default '{}'::jsonb,
  window_start timestamptz null,
  window_end timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists deployment_metrics_deployment_id_idx on public.deployment_metrics(deployment_id);
create index if not exists deployment_metrics_user_id_idx on public.deployment_metrics(user_id);
create index if not exists deployment_metrics_created_at_idx on public.deployment_metrics(created_at desc);

alter table public.deployment_metrics enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='deployment_metrics' and policyname='deployment_metrics_select_own'
  ) then
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name='team_members') then
      create policy deployment_metrics_select_own
        on public.deployment_metrics
        for select
        using (
          auth.uid() = user_id
          or (
            team_id is not null and exists (
              select 1 from public.team_members
              where team_members.team_id = deployment_metrics.team_id
                and team_members.user_id = auth.uid()
                and team_members.status = 'active'
            )
          )
        );
    else
      create policy deployment_metrics_select_own
        on public.deployment_metrics
        for select
        using (auth.uid() = user_id);
    end if;
  end if;
end$$;

-- Alerts (minimal)
create table if not exists public.alert_rules (
  rule_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid null,
  deployment_id uuid null references public.deployments(deployment_id) on delete cascade,
  name text not null,
  rule jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists alert_rules_user_id_idx on public.alert_rules(user_id);
create index if not exists alert_rules_deployment_id_idx on public.alert_rules(deployment_id);

alter table public.alert_rules enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='alert_rules' and policyname='alert_rules_select_own'
  ) then
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name='team_members') then
      create policy alert_rules_select_own
        on public.alert_rules
        for select
        using (
          auth.uid() = user_id
          or (
            team_id is not null and exists (
              select 1 from public.team_members
              where team_members.team_id = alert_rules.team_id
                and team_members.user_id = auth.uid()
                and team_members.status = 'active'
            )
          )
        );
    else
      create policy alert_rules_select_own
        on public.alert_rules
        for select
        using (auth.uid() = user_id);
    end if;
  end if;
end$$;

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_alert_rules_updated_at on public.alert_rules;
create trigger update_alert_rules_updated_at
  before update on public.alert_rules
  for each row
  execute function public.update_updated_at_column();
