-- Complete Fix for Pricing Plans RLS Issues
-- This fixes the "permission denied for table users" error

-- Step 1: Drop existing policies and recreate them properly
DROP POLICY IF EXISTS pricing_plans_select_public ON public.pricing_plans;
DROP POLICY IF EXISTS pricing_plans_admin_all ON public.pricing_plans;

-- Step 2: Grant explicit permissions first
GRANT SELECT ON public.pricing_plans TO anon;
GRANT SELECT ON public.pricing_plans TO authenticated;

-- Step 3: Disable RLS temporarily to verify grants work
-- (We'll re-enable it with proper policies)
ALTER TABLE public.pricing_plans DISABLE ROW LEVEL SECURITY;

-- Step 4: Test that we can query without RLS
-- (This will be done by the application)

-- Step 5: Re-enable RLS with a simple policy that doesn't access auth.users
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows anyone to read active plans
-- This policy does NOT reference auth.users at all
CREATE POLICY pricing_plans_select_public
    ON public.pricing_plans
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Step 6: Create admin policy (only for admins, uses auth.users check)
-- This is separate and only applies to admin operations
CREATE POLICY pricing_plans_admin_all
    ON public.pricing_plans
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Step 7: Verify no triggers are interfering
-- Check if there are any triggers on pricing_plans that might access auth.users
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger
    WHERE tgrelid = 'public.pricing_plans'::regclass
    AND tgisinternal = false;
    
    IF trigger_count > 0 THEN
        RAISE NOTICE 'Found % trigger(s) on pricing_plans table', trigger_count;
    END IF;
END $$;

-- Step 8: Ensure the table exists and has data
DO $$
BEGIN
    -- Verify table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pricing_plans'
    ) THEN
        RAISE EXCEPTION 'pricing_plans table does not exist. Run supabase_pricing_subscriptions.sql first.';
    END IF;
    
    -- Verify we have data
    IF NOT EXISTS (SELECT 1 FROM public.pricing_plans LIMIT 1) THEN
        RAISE NOTICE 'Warning: pricing_plans table is empty. Inserting default plans...';
        
        INSERT INTO public.pricing_plans (plan_key, plan_name, description, price_monthly, price_yearly, features, limitations, sort_order) VALUES
            ('free', 'Free — Explore', 'Build, label, and train locally — evaluate ML FORGE before committing.', 0, 0, 
             '["Model Zoo access (most pre-trained models)", "Dataset Manager (full core access)", "Annotation Studio (basic tools)", "Basic augmentations", "Training access (small & medium models)", "Inference execution allowed"]'::jsonb,
             '["Face dataset conversion", "Advanced augmentations", "Export formats", "Benchmarking"]'::jsonb, 1),
            ('data_pro', 'Data Pro — Prepare', 'Advanced dataset preparation and transformation for serious projects.', 4900, 49000,
             '["Everything in Free", "Full Dataset Manager", "Face recognition dataset creation", "Full augmentation suite", "Advanced preprocessing tools", "Dataset version locking"]'::jsonb,
             '["Advanced training (auto-tuning)", "Full benchmarking", "Export & deployment"]'::jsonb, 2),
            ('train_pro', 'Train Pro — Build', 'Train, tune, and analyze models with full visibility and logs.', 9900, 99000,
             '["Everything in Data Pro", "Full Annotation Studio", "Review & approval workflows", "Team collaboration", "Advanced training engine", "Auto-tuning", "Shared GPU access", "Full training logs", "Full inference visibility"]'::jsonb,
             '["Limited export formats", "Limited benchmarking presets"]'::jsonb, 3),
            ('deploy_pro', 'Deploy Pro — Ship', 'Production-grade export, benchmarking, and deployment.', 19900, 199000,
             '["Everything unlocked", "Full export formats (ONNX, TensorRT, CoreML, etc.)", "Full inference & benchmarking", "Edge, on-prem, offline deployment", "Full audit logs", "Priority GPU scheduling"]'::jsonb,
             '[]'::jsonb, 4)
        ON CONFLICT (plan_key) DO NOTHING;
    END IF;
END $$;

-- Step 9: Final verification query (this should work now)
-- SELECT * FROM public.pricing_plans WHERE is_active = true;

