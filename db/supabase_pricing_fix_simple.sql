-- Simple Fix for Pricing Plans - Disable RLS since it's public data
-- The error "permission denied for table users" happens because RLS policies
-- are trying to access auth.users even for anonymous queries

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS pricing_plans_select_public ON public.pricing_plans;
DROP POLICY IF EXISTS pricing_plans_admin_all ON public.pricing_plans;

-- Step 2: Grant explicit SELECT permissions to anon and authenticated roles
GRANT SELECT ON public.pricing_plans TO anon;
GRANT SELECT ON public.pricing_plans TO authenticated;

-- Step 3: Disable RLS entirely for pricing_plans
-- This is safe because pricing plans are public data that everyone should see
ALTER TABLE public.pricing_plans DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify the table has data
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.pricing_plans LIMIT 1) THEN
        RAISE NOTICE 'pricing_plans table is empty. Inserting default plans...';
        
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

-- Note: If you need admin-only write access later, you can:
-- 1. Re-enable RLS
-- 2. Create a policy that allows SELECT for everyone
-- 3. Create a policy that allows INSERT/UPDATE/DELETE only for admins
-- But for now, since pricing plans are public read-only data, disabling RLS is the simplest solution

