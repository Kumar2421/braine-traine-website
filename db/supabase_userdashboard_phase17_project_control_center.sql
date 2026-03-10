-- Phase 17: User Dashboard - Project control center helpers

-- Summary RPC for dashboard (avoids complex client joins)
create or replace function public.get_project_control_center(p_project_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_proj record;
  v_runs_count int;
  v_models_count int;
  v_exports_count int;
  v_datasets_count int;
begin
  v_user_id := auth.uid();

  select * into v_proj
  from public.projects
  where project_id = p_project_id
    and user_id = v_user_id;

  if not found then
    return jsonb_build_object('error', 'not_found');
  end if;

  select count(*) into v_runs_count from public.training_runs where project_id = p_project_id;
  select count(*) into v_models_count from public.models where project_id = p_project_id;
  select count(*) into v_exports_count from public.exports where project_id = p_project_id;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='datasets') then
    select count(*) into v_datasets_count from public.datasets where project_id = p_project_id;
  else
    v_datasets_count := 0;
  end if;

  return jsonb_build_object(
    'project', row_to_json(v_proj),
    'counts', jsonb_build_object(
      'runs', v_runs_count,
      'models', v_models_count,
      'exports', v_exports_count,
      'datasets', v_datasets_count
    )
  );
end;
$$;

revoke all on function public.get_project_control_center(uuid) from public;
grant execute on function public.get_project_control_center(uuid) to authenticated;
