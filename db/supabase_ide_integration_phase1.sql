-- ============================================
-- WEB-TO-IDE INTEGRATION - PHASE 1
-- Database Schema Extensions for IDE Integration
-- ============================================

-- ============================================
-- 1. USAGE LIMITS & QUOTAS TABLE
-- ============================================

-- Usage limits per subscription tier
CREATE TABLE IF NOT EXISTS public.usage_limits (
    limit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT NOT NULL UNIQUE CHECK (plan_type IN ('free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise')),
    
    -- Project & Dataset Limits
    max_projects INTEGER DEFAULT 10, -- -1 = unlimited
    max_datasets_per_project INTEGER DEFAULT 50,
    
    -- Export Limits
    max_exports_per_month INTEGER DEFAULT 20,
    export_formats_allowed TEXT[] DEFAULT ARRAY['onnx'],
    
    -- GPU & Training Limits
    max_gpu_hours_per_month DECIMAL(10, 2) DEFAULT 100.0, -- -1 = unlimited
    max_training_runs_per_month INTEGER DEFAULT 50,
    max_concurrent_training_jobs INTEGER DEFAULT 2,
    
    -- Model Limits
    max_model_size_mb INTEGER DEFAULT 500, -- -1 = unlimited
    
    -- Team & Storage Limits
    max_team_members INTEGER DEFAULT 5,
    max_storage_gb INTEGER DEFAULT 10, -- -1 = unlimited
    
    -- Feature Access Levels
    model_zoo_access_level TEXT DEFAULT 'basic' CHECK (model_zoo_access_level IN ('basic', 'premium', 'all')),
    annotation_tools_level TEXT DEFAULT 'basic' CHECK (annotation_tools_level IN ('basic', 'standard', 'full')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default limits for each plan
INSERT INTO public.usage_limits (
    plan_type, 
    max_projects, 
    max_datasets_per_project, 
    max_exports_per_month, 
    max_gpu_hours_per_month, 
    max_training_runs_per_month, 
    max_model_size_mb, 
    max_team_members, 
    max_storage_gb, 
    max_concurrent_training_jobs, 
    export_formats_allowed, 
    model_zoo_access_level, 
    annotation_tools_level
) VALUES
    -- Free Plan
    ('free', 5, 10, 5, 10.0, 10, 100, 1, 2, 1, ARRAY['onnx'], 'basic', 'basic'),
    
    -- Data Pro Plan
    ('data_pro', 20, 100, 20, 50.0, 50, 500, 3, 10, 2, ARRAY['onnx', 'tensorflow'], 'premium', 'standard'),
    
    -- Train Pro Plan
    ('train_pro', 100, 500, 100, 200.0, 200, 2000, 10, 50, 5, ARRAY['onnx', 'tensorflow', 'pytorch'], 'premium', 'full'),
    
    -- Deploy Pro Plan (Unlimited)
    ('deploy_pro', -1, -1, -1, -1, -1, -1, -1, -1, -1, ARRAY['onnx', 'tensorflow', 'pytorch', 'tensorrt', 'coreml', 'openvino'], 'all', 'full'),
    
    -- Enterprise Plan (Unlimited + Custom)
    ('enterprise', -1, -1, -1, -1, -1, -1, -1, -1, -1, ARRAY[]::TEXT[], 'all', 'full')
ON CONFLICT (plan_type) DO UPDATE SET
    updated_at = now();

CREATE INDEX IF NOT EXISTS usage_limits_plan_type_idx ON public.usage_limits(plan_type);

-- ============================================
-- 2. CURRENT USAGE TRACKING TABLE
-- ============================================

-- Track current usage period (resets monthly)
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID, -- Will add FK constraint later if teams table exists
    
    -- Period tracking
    period_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),
    period_end TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
    
    -- Usage counters
    projects_count INTEGER DEFAULT 0,
    datasets_count INTEGER DEFAULT 0,
    exports_count INTEGER DEFAULT 0,
    gpu_hours_used DECIMAL(10, 2) DEFAULT 0.0,
    training_runs_count INTEGER DEFAULT 0,
    storage_used_gb DECIMAL(10, 2) DEFAULT 0.0,
    concurrent_jobs_count INTEGER DEFAULT 0,
    
    -- Feature usage
    model_zoo_downloads INTEGER DEFAULT 0,
    annotation_sessions INTEGER DEFAULT 0,
    export_formats_used TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(user_id, period_start)
);

CREATE INDEX IF NOT EXISTS usage_tracking_user_id_idx ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS usage_tracking_team_id_idx ON public.usage_tracking(team_id);
CREATE INDEX IF NOT EXISTS usage_tracking_period_start_idx ON public.usage_tracking(period_start);
CREATE INDEX IF NOT EXISTS usage_tracking_period_end_idx ON public.usage_tracking(period_end);

-- RLS Policies for usage_tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS usage_tracking_select_own ON public.usage_tracking;
CREATE POLICY usage_tracking_select_own
    ON public.usage_tracking
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS usage_tracking_admin_all ON public.usage_tracking;
CREATE POLICY usage_tracking_admin_all
    ON public.usage_tracking
    FOR ALL
    USING (
        coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
    );

-- ============================================
-- 3. MODELS TABLE (Trained Models from IDE)
-- ============================================

CREATE TABLE IF NOT EXISTS public.models (
    model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(project_id) ON DELETE CASCADE,
    team_id UUID, -- Will add FK constraint later if teams table exists
    
    -- Model Info
    name TEXT NOT NULL,
    model_type TEXT NOT NULL CHECK (model_type IN ('yolo', 'classification', 'segmentation', 'face_recognition', 'other')),
    architecture TEXT, -- 'yolov8', 'resnet50', 'efficientnet', etc.
    version TEXT DEFAULT '1.0.0',
    
    -- Model Metrics
    accuracy DECIMAL(5, 4),
    precision DECIMAL(5, 4),
    recall DECIMAL(5, 4),
    f1_score DECIMAL(5, 4),
    model_size_mb DECIMAL(10, 2),
    
    -- Training Info
    training_epochs INTEGER,
    training_duration_minutes INTEGER,
    gpu_hours_used DECIMAL(10, 2) DEFAULT 0.0,
    dataset_size INTEGER,
    gpu_type TEXT, -- 'A100', 'V100', 'T4', 'RTX3090', etc.
    
    -- Status
    status TEXT NOT NULL DEFAULT 'training' CHECK (status IN ('training', 'completed', 'failed', 'deployed', 'archived')),
    
    -- Metadata
    ide_model_id TEXT, -- ID from IDE for sync
    ide_version TEXT, -- IDE version that created this model
    config JSONB DEFAULT '{}'::jsonb, -- Training configuration
    metrics JSONB DEFAULT '{}'::jsonb, -- Additional metrics
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    trained_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS models_user_id_idx ON public.models(user_id);
CREATE INDEX IF NOT EXISTS models_project_id_idx ON public.models(project_id);
CREATE INDEX IF NOT EXISTS models_team_id_idx ON public.models(team_id);
CREATE INDEX IF NOT EXISTS models_status_idx ON public.models(status);
CREATE INDEX IF NOT EXISTS models_ide_model_id_idx ON public.models(ide_model_id);
CREATE INDEX IF NOT EXISTS models_model_type_idx ON public.models(model_type);

-- RLS Policies for models
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS models_select_own ON public.models;
CREATE POLICY models_select_own
    ON public.models
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS models_insert_own ON public.models;
CREATE POLICY models_insert_own
    ON public.models
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS models_update_own ON public.models;
CREATE POLICY models_update_own
    ON public.models
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS models_admin_all ON public.models;
CREATE POLICY models_admin_all
    ON public.models
    FOR ALL
    USING (
        coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
    );

-- ============================================
-- 4. TRAINING RUNS TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.training_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(project_id) ON DELETE CASCADE,
    model_id UUID REFERENCES public.models(model_id) ON DELETE SET NULL,
    team_id UUID, -- Will add FK constraint later if teams table exists
    
    -- Run Info
    run_name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Training configuration
    
    -- Timing
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    -- GPU Usage
    gpu_hours_used DECIMAL(10, 2) DEFAULT 0.0,
    gpu_type TEXT, -- 'A100', 'V100', 'T4', 'RTX3090', etc.
    gpu_count INTEGER DEFAULT 1,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'canceled')),
    error_message TEXT,
    progress_percentage INTEGER DEFAULT 0,
    
    -- Results
    final_metrics JSONB DEFAULT '{}'::jsonb, -- Loss, accuracy, etc.
    checkpoint_path TEXT,
    logs_url TEXT, -- URL to training logs
    
    -- IDE Metadata
    ide_run_id TEXT, -- ID from IDE
    ide_version TEXT, -- IDE version
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS training_runs_user_id_idx ON public.training_runs(user_id);
CREATE INDEX IF NOT EXISTS training_runs_project_id_idx ON public.training_runs(project_id);
CREATE INDEX IF NOT EXISTS training_runs_model_id_idx ON public.training_runs(model_id);
CREATE INDEX IF NOT EXISTS training_runs_status_idx ON public.training_runs(status);
CREATE INDEX IF NOT EXISTS training_runs_start_time_idx ON public.training_runs(start_time DESC);
CREATE INDEX IF NOT EXISTS training_runs_ide_run_id_idx ON public.training_runs(ide_run_id);

-- RLS Policies for training_runs
ALTER TABLE public.training_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS training_runs_select_own ON public.training_runs;
CREATE POLICY training_runs_select_own
    ON public.training_runs
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS training_runs_insert_own ON public.training_runs;
CREATE POLICY training_runs_insert_own
    ON public.training_runs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS training_runs_update_own ON public.training_runs;
CREATE POLICY training_runs_update_own
    ON public.training_runs
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS training_runs_admin_all ON public.training_runs;
CREATE POLICY training_runs_admin_all
    ON public.training_runs
    FOR ALL
    USING (
        coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
    );

-- ============================================
-- 5. FEATURE ACCESS LOG TABLE
-- ============================================

-- Track feature access attempts (for analytics and debugging)
CREATE TABLE IF NOT EXISTS public.feature_access_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    access_granted BOOLEAN NOT NULL,
    reason TEXT, -- Why access was denied
    subscription_tier TEXT,
    usage_context JSONB DEFAULT '{}'::jsonb, -- Additional context (export format, model size, etc.)
    ide_version TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feature_access_log_user_id_idx ON public.feature_access_log(user_id);
CREATE INDEX IF NOT EXISTS feature_access_log_feature_key_idx ON public.feature_access_log(feature_key);
CREATE INDEX IF NOT EXISTS feature_access_log_access_granted_idx ON public.feature_access_log(access_granted);
CREATE INDEX IF NOT EXISTS feature_access_log_created_at_idx ON public.feature_access_log(created_at DESC);
CREATE INDEX IF NOT EXISTS feature_access_log_subscription_tier_idx ON public.feature_access_log(subscription_tier);

-- RLS Policies for feature_access_log
ALTER TABLE public.feature_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feature_access_log_select_own ON public.feature_access_log;
CREATE POLICY feature_access_log_select_own
    ON public.feature_access_log
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS feature_access_log_admin_all ON public.feature_access_log;
CREATE POLICY feature_access_log_admin_all
    ON public.feature_access_log
    FOR ALL
    USING (
        coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
    );

-- ============================================
-- 6. IDE SYNC EVENTS TABLE
-- ============================================

-- IDE sync events log
CREATE TABLE IF NOT EXISTS public.ide_sync_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT REFERENCES public.ide_auth_tokens(token) ON DELETE SET NULL, -- References token (TEXT) not token_id
    
    -- Event Info
    event_type TEXT NOT NULL, -- 'project_created', 'project_updated', 'training_started', 'training_completed', 'export_completed', 'gpu_usage', 'feature_check', 'model_created', 'model_updated'
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- IDE Info
    ide_version TEXT,
    ide_platform TEXT, -- 'windows', 'macos', 'linux'
    ide_build TEXT,
    
    -- Sync Status
    sync_status TEXT DEFAULT 'success' CHECK (sync_status IN ('success', 'failed', 'partial')),
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ide_sync_events_user_id_idx ON public.ide_sync_events(user_id);
CREATE INDEX IF NOT EXISTS ide_sync_events_token_idx ON public.ide_sync_events(token);
CREATE INDEX IF NOT EXISTS ide_sync_events_event_type_idx ON public.ide_sync_events(event_type);
CREATE INDEX IF NOT EXISTS ide_sync_events_created_at_idx ON public.ide_sync_events(created_at DESC);
CREATE INDEX IF NOT EXISTS ide_sync_events_sync_status_idx ON public.ide_sync_events(sync_status);

-- RLS Policies for ide_sync_events
ALTER TABLE public.ide_sync_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ide_sync_events_select_own ON public.ide_sync_events;
CREATE POLICY ide_sync_events_select_own
    ON public.ide_sync_events
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS ide_sync_events_admin_all ON public.ide_sync_events;
CREATE POLICY ide_sync_events_admin_all
    ON public.ide_sync_events
    FOR ALL
    USING (
        coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
    );

-- ============================================
-- 7. ENHANCE IDE_AUTH_TOKENS TABLE
-- ============================================

-- Add subscription info to IDE auth tokens
ALTER TABLE public.ide_auth_tokens 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT,
ADD COLUMN IF NOT EXISTS features_enabled JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS usage_limits JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sync_interval_seconds INTEGER DEFAULT 300; -- 5 minutes default

CREATE INDEX IF NOT EXISTS ide_auth_tokens_subscription_tier_idx ON public.ide_auth_tokens(subscription_tier);
CREATE INDEX IF NOT EXISTS ide_auth_tokens_last_sync_at_idx ON public.ide_auth_tokens(last_sync_at);

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to get or create usage tracking for current period
CREATE OR REPLACE FUNCTION public.get_or_create_usage_tracking(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_usage_id UUID;
    v_period_start TIMESTAMPTZ;
BEGIN
    v_period_start := date_trunc('month', now());
    
    -- Try to get existing tracking
    SELECT usage_id INTO v_usage_id
    FROM public.usage_tracking
    WHERE user_id = p_user_id
    AND period_start = v_period_start;
    
    -- Create if doesn't exist
    IF v_usage_id IS NULL THEN
        INSERT INTO public.usage_tracking (user_id, period_start, period_end)
        VALUES (p_user_id, v_period_start, v_period_start + interval '1 month')
        RETURNING usage_id INTO v_usage_id;
    END IF;
    
    RETURN v_usage_id;
END;
$$;

-- Function to get user's usage limits based on subscription
CREATE OR REPLACE FUNCTION public.get_user_usage_limits(p_user_id UUID)
RETURNS TABLE (
    plan_type TEXT,
    max_projects INTEGER,
    max_exports_per_month INTEGER,
    max_gpu_hours_per_month DECIMAL,
    max_training_runs_per_month INTEGER,
    export_formats_allowed TEXT[],
    model_zoo_access_level TEXT,
    annotation_tools_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plan_type TEXT := 'free';
BEGIN
    -- Get user's subscription plan
    SELECT COALESCE(s.plan_type, 'free') INTO v_plan_type
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- Fallback to license if no subscription
    IF v_plan_type = 'free' THEN
        SELECT COALESCE(l.license_type, 'free') INTO v_plan_type
        FROM public.licenses l
        WHERE l.user_id = p_user_id
        AND l.is_active = true
        ORDER BY l.issued_at DESC
        LIMIT 1;
    END IF;
    
    -- Return limits for the plan
    RETURN QUERY
    SELECT 
        ul.plan_type,
        ul.max_projects,
        ul.max_exports_per_month,
        ul.max_gpu_hours_per_month,
        ul.max_training_runs_per_month,
        ul.export_formats_allowed,
        ul.model_zoo_access_level,
        ul.annotation_tools_level
    FROM public.usage_limits ul
    WHERE ul.plan_type = v_plan_type;
END;
$$;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION public.increment_usage(
    p_user_id UUID,
    p_usage_type TEXT,
    p_amount DECIMAL DEFAULT 1.0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_usage_id UUID;
BEGIN
    -- Get or create usage tracking
    v_usage_id := public.get_or_create_usage_tracking(p_user_id);
    
    -- Update appropriate counter
    CASE p_usage_type
        WHEN 'projects' THEN
            UPDATE public.usage_tracking
            SET projects_count = projects_count + 1,
                updated_at = now()
            WHERE usage_id = v_usage_id;
        WHEN 'exports' THEN
            UPDATE public.usage_tracking
            SET exports_count = exports_count + 1,
                updated_at = now()
            WHERE usage_id = v_usage_id;
        WHEN 'gpu_hours' THEN
            UPDATE public.usage_tracking
            SET gpu_hours_used = gpu_hours_used + p_amount,
                updated_at = now()
            WHERE usage_id = v_usage_id;
        WHEN 'training_runs' THEN
            UPDATE public.usage_tracking
            SET training_runs_count = training_runs_count + 1,
                updated_at = now()
            WHERE usage_id = v_usage_id;
        WHEN 'datasets' THEN
            UPDATE public.usage_tracking
            SET datasets_count = datasets_count + 1,
                updated_at = now()
            WHERE usage_id = v_usage_id;
        ELSE
            RAISE EXCEPTION 'Unknown usage type: %', p_usage_type;
    END CASE;
    
    RETURN TRUE;
END;
$$;

-- ============================================
-- 9. COMMENTS
-- ============================================

COMMENT ON TABLE public.usage_limits IS 'Usage limits per subscription tier';
COMMENT ON TABLE public.usage_tracking IS 'Current usage tracking per user per month';
COMMENT ON TABLE public.models IS 'Trained models from IDE';
COMMENT ON TABLE public.training_runs IS 'Training run tracking from IDE';
COMMENT ON TABLE public.feature_access_log IS 'Feature access attempts log for analytics';
COMMENT ON TABLE public.ide_sync_events IS 'IDE sync events log';

COMMENT ON FUNCTION public.get_or_create_usage_tracking IS 'Get or create usage tracking for current period';
COMMENT ON FUNCTION public.get_user_usage_limits IS 'Get user usage limits based on subscription';
COMMENT ON FUNCTION public.increment_usage IS 'Increment usage counter for user';

-- ============================================
-- 10. ADD TEAM FOREIGN KEY CONSTRAINTS (IF TEAMS TABLE EXISTS)
-- ============================================

-- Add foreign key constraints to teams table if it exists
DO $$
BEGIN
    -- Add FK constraint to usage_tracking.team_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'usage_tracking_team_id_fkey'
            AND table_name = 'usage_tracking'
        ) THEN
            ALTER TABLE public.usage_tracking
            ADD CONSTRAINT usage_tracking_team_id_fkey
            FOREIGN KEY (team_id) REFERENCES public.teams(team_id) ON DELETE SET NULL;
        END IF;

        -- Add FK constraint to models.team_id
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'models_team_id_fkey'
            AND table_name = 'models'
        ) THEN
            ALTER TABLE public.models
            ADD CONSTRAINT models_team_id_fkey
            FOREIGN KEY (team_id) REFERENCES public.teams(team_id) ON DELETE SET NULL;
        END IF;

        -- Add FK constraint to training_runs.team_id
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'training_runs_team_id_fkey'
            AND table_name = 'training_runs'
        ) THEN
            ALTER TABLE public.training_runs
            ADD CONSTRAINT training_runs_team_id_fkey
            FOREIGN KEY (team_id) REFERENCES public.teams(team_id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- ============================================
-- 11. UPDATE RLS POLICIES FOR TEAM ACCESS (IF TEAM_MEMBERS EXISTS)
-- ============================================

-- Update RLS policies to include team member access if team_members table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_members') THEN
        -- Drop and recreate models_select_own policy with team access
        DROP POLICY IF EXISTS models_select_own ON public.models;
        CREATE POLICY models_select_own
            ON public.models
            FOR SELECT
            USING (
                auth.uid() = user_id OR
                EXISTS (
                    SELECT 1 FROM public.team_members
                    WHERE team_members.team_id = models.team_id
                    AND team_members.user_id = auth.uid()
                    AND team_members.status = 'active'
                )
            );

        -- Drop and recreate training_runs_select_own policy with team access
        DROP POLICY IF EXISTS training_runs_select_own ON public.training_runs;
        CREATE POLICY training_runs_select_own
            ON public.training_runs
            FOR SELECT
            USING (
                auth.uid() = user_id OR
                EXISTS (
                    SELECT 1 FROM public.team_members
                    WHERE team_members.team_id = training_runs.team_id
                    AND team_members.user_id = auth.uid()
                    AND team_members.status = 'active'
                )
            );
    END IF;
END $$;

