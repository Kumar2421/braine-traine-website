-- Phase 6: Role-based admin permissions
-- Adds server-side role helpers based on auth.users.raw_user_meta_data.admin_role
-- Roles: support, billing, super

create or replace function public.get_admin_role()
returns text
language plpgsql
security definer
as $$
declare
  user_id_val uuid;
  is_admin_val boolean;
  role_val text;
begin
  user_id_val := auth.uid();
  if user_id_val is null then
    return null;
  end if;

  select coalesce((u.raw_user_meta_data->>'is_admin')::boolean, false),
         nullif(trim(u.raw_user_meta_data->>'admin_role'), '')
    into is_admin_val, role_val
  from auth.users u
  where u.id = user_id_val;

  if not is_admin_val then
    return null;
  end if;

  if role_val is null then
    return 'super';
  end if;

  role_val := lower(role_val);

  if role_val not in ('support', 'billing', 'super') then
    return 'super';
  end if;

  return role_val;
end;
$$;

grant execute on function public.get_admin_role() to authenticated;

create or replace function public.can_access_admin_role(required_role text)
returns boolean
language plpgsql
security definer
as $$
declare
  role_val text;
  req text;
begin
  role_val := public.get_admin_role();
  if role_val is null then
    return false;
  end if;

  req := lower(coalesce(required_role, ''));

  -- super can access everything
  if role_val = 'super' then
    return true;
  end if;

  -- billing can access billing + support areas
  if role_val = 'billing' then
    return req in ('billing', 'support', '');
  end if;

  -- support can access support areas only
  if role_val = 'support' then
    return req in ('support', '');
  end if;

  return false;
end;
$$;

grant execute on function public.can_access_admin_role(text) to authenticated;
