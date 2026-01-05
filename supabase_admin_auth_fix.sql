-- Enterprise-Grade Admin Authentication Fix
-- This script sets up proper admin authentication and fixes login flow

-- 1. Ensure admin user exists and has correct metadata
-- First, let's create a function to safely set admin user
CREATE OR REPLACE FUNCTION public.set_admin_user_safe(admin_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id_val UUID;
BEGIN
    -- Get user ID from email
    SELECT id INTO user_id_val
    FROM auth.users
    WHERE email = admin_email
    LIMIT 1;

    IF user_id_val IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', admin_email;
    END IF;

    -- Update user metadata to set admin flag
    UPDATE auth.users
    SET 
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('is_admin', true, 'admin_since', now()),
        updated_at = now()
    WHERE id = user_id_val;

    -- Also ensure admin_actions table exists for logging
    CREATE TABLE IF NOT EXISTS public.admin_actions (
        action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        action_type TEXT NOT NULL,
        target_user_id UUID REFERENCES auth.users(id),
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS admin_actions_admin_user_id_idx ON public.admin_actions(admin_user_id);
    CREATE INDEX IF NOT EXISTS admin_actions_created_at_idx ON public.admin_actions(created_at DESC);
    CREATE INDEX IF NOT EXISTS admin_actions_action_type_idx ON public.admin_actions(action_type);

    -- Enable RLS
    ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

    -- Policy: Admins can see all actions
    DROP POLICY IF EXISTS admin_actions_select_admin ON public.admin_actions;
    CREATE POLICY admin_actions_select_admin
        ON public.admin_actions
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM auth.users
                WHERE auth.users.id = auth.uid()
                AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
            )
        );

    -- Log the admin assignment
    INSERT INTO public.admin_actions (
        admin_user_id,
        action_type,
        details
    ) VALUES (
        user_id_val,
        'admin_assigned',
        jsonb_build_object('email', admin_email, 'assigned_at', now())
    );

    RAISE NOTICE 'Admin user % (ID: %) has been set successfully', admin_email, user_id_val;
END;
$$;

-- 2. Create admin login verification function
CREATE OR REPLACE FUNCTION public.verify_admin_access(user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin_val boolean;
BEGIN
    SELECT COALESCE(
        (raw_user_meta_data->>'is_admin')::boolean,
        false
    ) INTO is_admin_val
    FROM auth.users
    WHERE id = user_id;

    RETURN is_admin_val;
END;
$$;

-- 3. Create admin login audit function
CREATE OR REPLACE FUNCTION public.log_admin_login(user_id UUID, ip_address_val INET, user_agent_val TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.admin_actions (
        admin_user_id,
        action_type,
        details,
        ip_address,
        user_agent
    ) VALUES (
        user_id,
        'admin_login',
        jsonb_build_object('login_at', now()),
        ip_address_val,
        user_agent_val
    );
END;
$$;

-- 4. Set the admin user with provided credentials
-- Note: User must already exist with email: senthil210520012421@gmail.com
SELECT public.set_admin_user_safe('senthil210520012421@gmail.com');

-- 5. Create view for admin dashboard stats
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM auth.users WHERE (raw_user_meta_data->>'is_admin')::boolean = true) as total_admins,
    (SELECT COUNT(*) FROM public.licenses WHERE is_active = true) as active_licenses,
    (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT COUNT(*) FROM public.projects) as total_projects,
    (SELECT COUNT(*) FROM public.admin_actions WHERE action_type = 'admin_login' AND created_at > now() - interval '24 hours') as admin_logins_24h;

-- Grant access to authenticated admins
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;

-- 6. Create function to check if user can access admin panel
CREATE OR REPLACE FUNCTION public.can_access_admin_panel()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id_val UUID;
    is_admin_val boolean;
BEGIN
    user_id_val := auth.uid();
    
    IF user_id_val IS NULL THEN
        RETURN false;
    END IF;

    SELECT public.verify_admin_access(user_id_val) INTO is_admin_val;
    
    RETURN is_admin_val;
END;
$$;

COMMENT ON FUNCTION public.set_admin_user_safe IS 'Safely sets a user as admin with proper metadata and logging';
COMMENT ON FUNCTION public.verify_admin_access IS 'Verifies if a user has admin access';
COMMENT ON FUNCTION public.log_admin_login IS 'Logs admin login attempts for security auditing';
COMMENT ON FUNCTION public.can_access_admin_panel IS 'Checks if current user can access admin panel';

