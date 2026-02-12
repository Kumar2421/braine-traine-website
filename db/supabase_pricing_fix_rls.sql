-- Fix RLS Policies for Pricing & Subscription System
-- Run this after supabase_pricing_subscriptions.sql to fix permission issues

-- 1. Fix pricing_plans - Grant SELECT to anon role
GRANT SELECT ON public.pricing_plans TO anon;
GRANT SELECT ON public.pricing_plans TO authenticated;

-- Ensure the policy allows anonymous access
DROP POLICY IF EXISTS pricing_plans_select_public ON public.pricing_plans;

CREATE POLICY pricing_plans_select_public
    ON public.pricing_plans
    FOR SELECT
    USING (is_active = true);

-- 2. Fix user_subscription_summary view
-- The view tries to access auth.users which requires special permissions
-- We'll create a function with SECURITY DEFINER instead

DROP VIEW IF EXISTS public.user_subscription_summary CASCADE;

-- Create a function that can access auth.users with proper permissions
CREATE OR REPLACE FUNCTION public.get_user_subscription_summary()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    subscription_id UUID,
    plan_type TEXT,
    subscription_status TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN,
    license_type TEXT,
    license_active BOOLEAN,
    license_expires_at TIMESTAMPTZ,
    total_payments BIGINT,
    total_paid_amount BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.email::TEXT,
        s.subscription_id,
        s.plan_type,
        s.status::TEXT as subscription_status,
        s.current_period_start,
        s.current_period_end,
        s.cancel_at_period_end,
        l.license_type,
        l.is_active as license_active,
        l.expires_at as license_expires_at,
        (SELECT COUNT(*) FROM public.billing_history WHERE billing_history.user_id = current_user_id AND status = 'paid')::BIGINT as total_payments,
        COALESCE((SELECT SUM(amount) FROM public.billing_history WHERE billing_history.user_id = current_user_id AND status = 'paid'), 0)::BIGINT as total_paid_amount
    FROM auth.users u
    LEFT JOIN LATERAL (
        SELECT * FROM public.subscriptions
        WHERE subscriptions.user_id = u.id
        AND subscriptions.status IN ('active', 'trialing', 'past_due')
        ORDER BY subscriptions.created_at DESC
        LIMIT 1
    ) s ON true
    LEFT JOIN LATERAL (
        SELECT * FROM public.licenses
        WHERE licenses.user_id = u.id
        ORDER BY licenses.issued_at DESC
        LIMIT 1
    ) l ON true
    WHERE u.id = current_user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_subscription_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_subscription_summary() TO anon;

-- Note: The view user_subscription_summary is removed because it requires auth.users access
-- Use the function get_user_subscription_summary() instead, or query subscriptions/licenses directly
