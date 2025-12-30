-- Admin Panel Database Schema
-- Run this migration to set up admin functionality

-- Feature flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    flag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key TEXT NOT NULL UNIQUE,
    flag_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'dataset_manager',
        'annotation_studio',
        'training_engine',
        'evaluation',
        'export_deployment',
        'governance',
        'team_collaboration',
        'advanced_models',
        'enterprise_features'
    )),
    enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feature_flags_category_idx ON public.feature_flags(category);
CREATE INDEX IF NOT EXISTS feature_flags_enabled_idx ON public.feature_flags(enabled);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS admin_feature_flags_all ON public.feature_flags;
DROP POLICY IF EXISTS users_read_feature_flags ON public.feature_flags;

-- Admin-only policy for feature flags
CREATE POLICY admin_feature_flags_all
    ON public.feature_flags
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Users can read their own feature flags (for IDE)
CREATE POLICY users_read_feature_flags
    ON public.feature_flags
    FOR SELECT
    USING (enabled = true);

-- Admin actions audit log
CREATE TABLE IF NOT EXISTS public.admin_actions (
    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES auth.users(id),
    action_type TEXT NOT NULL CHECK (action_type IN (
        'user_activate',
        'user_deactivate',
        'license_assign',
        'license_expiry_update',
        'license_offline_toggle',
        'token_regenerate',
        'feature_flag_toggle',
        'force_logout'
    )),
    target_user_id UUID REFERENCES auth.users(id),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_actions_admin_user_id_idx ON public.admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_actions_target_user_id_idx ON public.admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS admin_actions_action_type_idx ON public.admin_actions(action_type);
CREATE INDEX IF NOT EXISTS admin_actions_created_at_idx ON public.admin_actions(created_at DESC);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS admin_read_own_actions ON public.admin_actions;

CREATE POLICY admin_read_own_actions
    ON public.admin_actions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Allow admins to insert actions
DROP POLICY IF EXISTS admin_insert_actions ON public.admin_actions;

CREATE POLICY admin_insert_actions
    ON public.admin_actions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Add offline_enabled column to licenses if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'licenses' 
        AND column_name = 'offline_enabled'
    ) THEN
        ALTER TABLE public.licenses ADD COLUMN offline_enabled BOOLEAN NOT NULL DEFAULT false;
    END IF;
END$$;

-- Insert default feature flags
INSERT INTO public.feature_flags (flag_key, flag_name, category, enabled, description) VALUES
    ('dataset_manager', 'Dataset Manager', 'dataset_manager', true, 'Import, curate, and version image & video datasets'),
    ('annotation_studio', 'Annotation Studio', 'annotation_studio', true, 'Reviewable labeling with audit-ready change history'),
    ('training_engine', 'Training Engine', 'training_engine', true, 'Reproducible YOLO and CV pipelines'),
    ('evaluation', 'Evaluation & Benchmarks', 'evaluation', true, 'Compare runs, metrics, and artifacts'),
    ('export_deployment', 'Export & Deployment', 'export_deployment', true, 'Export models with full lineage'),
    ('governance', 'Governance & Observability', 'governance', true, 'Training logs, traceability, and audit trails'),
    ('team_collaboration', 'Team Collaboration', 'team_collaboration', false, 'Workspace metadata sync and team templates'),
    ('advanced_models', 'Advanced Models', 'advanced_models', false, 'Access to model zoo and advanced architectures'),
    ('enterprise_features', 'Enterprise Features', 'enterprise_features', false, 'Offline licensing, air-gapped installs, compliance')
ON CONFLICT (flag_key) DO NOTHING;

-- Function to set admin user
CREATE OR REPLACE FUNCTION public.set_admin_user(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{is_admin}',
        'true'::jsonb
    )
    WHERE email = user_email;
END;
$$;

-- Set admin user (replace with your email)
-- SELECT public.set_admin_user('senthil210520012421@gmail.com');

-- Create view for user management (combines users and licenses)
CREATE OR REPLACE VIEW public.admin_users_view
WITH (security_invoker = on) AS
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created_at,
    u.raw_user_meta_data,
    l.license_id,
    l.license_type,
    l.is_active,
    l.expires_at,
    l.issued_at,
    l.offline_enabled,
    (u.raw_user_meta_data->>'is_admin')::boolean as is_admin
FROM auth.users u
LEFT JOIN LATERAL (
    SELECT * FROM public.licenses
    WHERE licenses.user_id = u.id
    ORDER BY licenses.issued_at DESC
    LIMIT 1
) l ON true;

-- Grant access to admin users view
GRANT SELECT ON public.admin_users_view TO authenticated;

