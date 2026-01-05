-- Enterprise Features Database Migration
-- Adds support for recurring subscriptions, trials, coupons, teams, analytics, and more

-- ============================================
-- 1. RECURRING SUBSCRIPTIONS ENHANCEMENTS
-- ============================================

-- Add fields to subscriptions table for recurring subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT,
ADD COLUMN IF NOT EXISTS billing_interval TEXT CHECK (billing_interval IN ('monthly', 'yearly')) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_billing_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_cycle_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS prorated_amount INTEGER, -- Amount in paise for prorated billing
ADD COLUMN IF NOT EXISTS upgrade_from_plan TEXT,
ADD COLUMN IF NOT EXISTS downgrade_to_plan TEXT,
ADD COLUMN IF NOT EXISTS change_scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS change_type TEXT CHECK (change_type IN ('upgrade', 'downgrade', 'none')) DEFAULT 'none';

-- Add indexes for recurring subscriptions
CREATE INDEX IF NOT EXISTS subscriptions_billing_interval_idx ON public.subscriptions(billing_interval);
CREATE INDEX IF NOT EXISTS subscriptions_next_billing_at_idx ON public.subscriptions(next_billing_at);
CREATE INDEX IF NOT EXISTS subscriptions_change_scheduled_at_idx ON public.subscriptions(change_scheduled_at);

-- ============================================
-- 2. TRIAL PERIODS
-- ============================================

-- Trials table for tracking trial subscriptions
CREATE TABLE IF NOT EXISTS public.trials (
    trial_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(subscription_id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL,
    trial_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    trial_end TIMESTAMPTZ NOT NULL,
    trial_days INTEGER NOT NULL DEFAULT 14,
    converted BOOLEAN NOT NULL DEFAULT false,
    converted_at TIMESTAMPTZ NULL,
    canceled BOOLEAN NOT NULL DEFAULT false,
    canceled_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trials_user_id_idx ON public.trials(user_id);
CREATE INDEX IF NOT EXISTS trials_subscription_id_idx ON public.trials(subscription_id);
CREATE INDEX IF NOT EXISTS trials_trial_end_idx ON public.trials(trial_end);

ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY trials_select_own
    ON public.trials
    FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- 3. COUPONS & DISCOUNTS
-- ============================================

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    coupon_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value INTEGER NOT NULL, -- Percentage (0-100) or amount in paise
    currency TEXT DEFAULT 'INR',
    max_uses INTEGER NULL, -- NULL = unlimited
    used_count INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ NULL,
    applicable_plans TEXT[], -- Array of plan keys, empty = all plans
    minimum_amount INTEGER NULL, -- Minimum order amount in paise
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coupons_code_idx ON public.coupons(code);
CREATE INDEX IF NOT EXISTS coupons_is_active_idx ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS coupons_valid_until_idx ON public.coupons(valid_until);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Everyone can read active coupons
CREATE POLICY coupons_select_active
    ON public.coupons
    FOR SELECT
    USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Admin can manage coupons
CREATE POLICY coupons_admin_all
    ON public.coupons
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS public.coupon_usage (
    usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(coupon_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(subscription_id) ON DELETE SET NULL,
    billing_id UUID REFERENCES public.billing_history(billing_id) ON DELETE SET NULL,
    discount_amount INTEGER NOT NULL, -- Amount saved in paise
    used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coupon_usage_coupon_id_idx ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS coupon_usage_user_id_idx ON public.coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS coupon_usage_subscription_id_idx ON public.coupon_usage(subscription_id);

ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY coupon_usage_select_own
    ON public.coupon_usage
    FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- 4. TEAMS & COLLABORATION
-- ============================================

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(subscription_id) ON DELETE SET NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('data_pro', 'train_pro', 'deploy_pro', 'enterprise')),
    max_members INTEGER DEFAULT 5,
    billing_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS teams_owner_id_idx ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS teams_subscription_id_idx ON public.teams(subscription_id);
CREATE INDEX IF NOT EXISTS teams_slug_idx ON public.teams(slug);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    joined_at TIMESTAMPTZ NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS team_members_status_idx ON public.team_members(status);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_members_select_own
    ON public.team_members
    FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.teams
            WHERE teams.team_id = team_members.team_id
            AND teams.owner_id = auth.uid()
        )
    );

-- ============================================
-- 5. ANALYTICS & TRACKING
-- ============================================

-- User activity tracking
CREATE TABLE IF NOT EXISTS public.user_activity (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'login', 'feature_used', 'project_created', etc.
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_activity_user_id_idx ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS user_activity_type_idx ON public.user_activity(activity_type);
CREATE INDEX IF NOT EXISTS user_activity_created_at_idx ON public.user_activity(created_at DESC);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_activity_select_own
    ON public.user_activity
    FOR SELECT
    USING (auth.uid() = user_id);

-- GPU usage tracking
CREATE TABLE IF NOT EXISTS public.gpu_usage (
    usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(team_id) ON DELETE SET NULL,
    project_id UUID,
    gpu_type TEXT NOT NULL, -- 'A100', 'V100', 'T4', etc.
    gpu_count INTEGER NOT NULL DEFAULT 1,
    hours_used DECIMAL(10, 2) NOT NULL,
    cost_per_hour DECIMAL(10, 2) NOT NULL, -- Cost in INR
    total_cost DECIMAL(10, 2) NOT NULL, -- Total cost in INR
    usage_start TIMESTAMPTZ NOT NULL,
    usage_end TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'canceled')) DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gpu_usage_user_id_idx ON public.gpu_usage(user_id);
CREATE INDEX IF NOT EXISTS gpu_usage_team_id_idx ON public.gpu_usage(team_id);
CREATE INDEX IF NOT EXISTS gpu_usage_usage_start_idx ON public.gpu_usage(usage_start);
CREATE INDEX IF NOT EXISTS gpu_usage_status_idx ON public.gpu_usage(status);

ALTER TABLE public.gpu_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY gpu_usage_select_own
    ON public.gpu_usage
    FOR SELECT
    USING (auth.uid() = user_id);

-- Subscription analytics view
CREATE OR REPLACE VIEW public.subscription_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    plan_type,
    billing_interval,
    COUNT(*) as new_subscriptions,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as canceled_count,
    SUM(CASE WHEN status = 'trialing' THEN 1 ELSE 0 END) as trialing_count
FROM public.subscriptions
GROUP BY DATE_TRUNC('day', created_at), plan_type, billing_interval;

-- Revenue analytics view
CREATE OR REPLACE VIEW public.revenue_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    DATE_TRUNC('month', created_at) as month,
    plan_type,
    COUNT(*) as transactions,
    SUM(amount) as total_revenue_paise,
    AVG(amount) as avg_transaction_paise,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_revenue_paise,
    SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END) as failed_amount_paise
FROM public.billing_history
GROUP BY DATE_TRUNC('day', created_at), DATE_TRUNC('month', created_at), plan_type;

-- ============================================
-- 6. SUBSCRIPTION CHANGE HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscription_changes (
    change_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(subscription_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'cancel', 'resume', 'trial_start', 'trial_end', 'plan_change')),
    from_plan TEXT,
    to_plan TEXT,
    from_amount INTEGER, -- Amount in paise
    to_amount INTEGER, -- Amount in paise
    prorated_amount INTEGER, -- Prorated amount in paise
    effective_date TIMESTAMPTZ NOT NULL,
    reason TEXT,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscription_changes_subscription_id_idx ON public.subscription_changes(subscription_id);
CREATE INDEX IF NOT EXISTS subscription_changes_user_id_idx ON public.subscription_changes(user_id);
CREATE INDEX IF NOT EXISTS subscription_changes_change_type_idx ON public.subscription_changes(change_type);
CREATE INDEX IF NOT EXISTS subscription_changes_effective_date_idx ON public.subscription_changes(effective_date DESC);

ALTER TABLE public.subscription_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscription_changes_select_own
    ON public.subscription_changes
    FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- 7. INVOICES
-- ============================================

-- Add invoice fields to billing_history
ALTER TABLE public.billing_history
ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS invoice_html_url TEXT,
ADD COLUMN IF NOT EXISTS tax_amount INTEGER DEFAULT 0, -- Tax in paise
ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0, -- Discount in paise
ADD COLUMN IF NOT EXISTS subtotal_amount INTEGER, -- Subtotal before tax/discount in paise
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS line_items JSONB; -- Array of line items

CREATE INDEX IF NOT EXISTS billing_history_invoice_number_idx ON public.billing_history(invoice_number);

-- ============================================
-- 8. NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(team_id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'subscription', 'billing', 'team', 'system', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- 9. ENTERPRISE FEATURES
-- ============================================

-- Enterprise contracts
CREATE TABLE IF NOT EXISTS public.enterprise_contracts (
    contract_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
    contract_number TEXT UNIQUE NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    annual_value INTEGER NOT NULL, -- Annual contract value in paise
    payment_terms TEXT, -- 'net_30', 'net_60', 'annual', etc.
    sla_level TEXT CHECK (sla_level IN ('standard', 'premium', 'enterprise')) DEFAULT 'standard',
    support_tier TEXT CHECK (support_tier IN ('standard', 'priority', 'dedicated')) DEFAULT 'standard',
    custom_features JSONB, -- Custom features enabled
    status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'expired', 'terminated')) DEFAULT 'draft',
    signed_at TIMESTAMPTZ NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enterprise_contracts_team_id_idx ON public.enterprise_contracts(team_id);
CREATE INDEX IF NOT EXISTS enterprise_contracts_status_idx ON public.enterprise_contracts(status);
CREATE INDEX IF NOT EXISTS enterprise_contracts_end_date_idx ON public.enterprise_contracts(end_date);

ALTER TABLE public.enterprise_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY enterprise_contracts_select_team
    ON public.enterprise_contracts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = enterprise_contracts.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.status = 'active'
        )
    );

-- ============================================
-- 10. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update subscription change history
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.plan_type IS DISTINCT FROM NEW.plan_type THEN
        INSERT INTO public.subscription_changes (
            subscription_id,
            user_id,
            change_type,
            from_plan,
            to_plan,
            effective_date
        ) VALUES (
            NEW.subscription_id,
            NEW.user_id,
            CASE 
                WHEN NEW.plan_type > OLD.plan_type THEN 'upgrade'
                WHEN NEW.plan_type < OLD.plan_type THEN 'downgrade'
                ELSE 'plan_change'
            END,
            OLD.plan_type,
            NEW.plan_type,
            now()
        );
    END IF;
    
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status = 'canceled' THEN
            INSERT INTO public.subscription_changes (
                subscription_id,
                user_id,
                change_type,
                from_plan,
                to_plan,
                effective_date
            ) VALUES (
                NEW.subscription_id,
                NEW.user_id,
                'cancel',
                OLD.plan_type,
                NEW.plan_type,
                now()
            );
        ELSIF NEW.status = 'active' AND OLD.status = 'canceled' THEN
            INSERT INTO public.subscription_changes (
                subscription_id,
                user_id,
                change_type,
                from_plan,
                to_plan,
                effective_date
            ) VALUES (
                NEW.subscription_id,
                NEW.user_id,
                'resume',
                OLD.plan_type,
                NEW.plan_type,
                now()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for subscription changes
DROP TRIGGER IF EXISTS subscription_change_trigger ON public.subscriptions;
CREATE TRIGGER subscription_change_trigger
    AFTER UPDATE ON public.subscriptions
    FOR EACH ROW
    WHEN (
        OLD.plan_type IS DISTINCT FROM NEW.plan_type OR
        OLD.status IS DISTINCT FROM NEW.status
    )
    EXECUTE FUNCTION log_subscription_change();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_contracts_updated_at
    BEFORE UPDATE ON public.enterprise_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check coupon validity
CREATE OR REPLACE FUNCTION is_coupon_valid(coupon_code TEXT, user_id UUID, plan_key TEXT, amount_paise INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    coupon_record RECORD;
    usage_count INTEGER;
BEGIN
    SELECT * INTO coupon_record
    FROM public.coupons
    WHERE code = coupon_code
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > now())
    AND valid_from <= now();

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Check max uses
    IF coupon_record.max_uses IS NOT NULL THEN
        IF coupon_record.used_count >= coupon_record.max_uses THEN
            RETURN false;
        END IF;
    END IF;

    -- Check per-user limit
    SELECT COUNT(*) INTO usage_count
    FROM public.coupon_usage
    WHERE coupon_id = coupon_record.coupon_id
    AND user_id = is_coupon_valid.user_id;

    IF usage_count >= coupon_record.max_uses_per_user THEN
        RETURN false;
    END IF;

    -- Check applicable plans
    IF array_length(coupon_record.applicable_plans, 1) > 0 THEN
        IF NOT (plan_key = ANY(coupon_record.applicable_plans)) THEN
            RETURN false;
        END IF;
    END IF;

    -- Check minimum amount
    IF coupon_record.minimum_amount IS NOT NULL THEN
        IF amount_paise < coupon_record.minimum_amount THEN
            RETURN false;
        END IF;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.coupons
    SET used_count = used_count + 1,
        updated_at = now()
    WHERE coupons.coupon_id = increment_coupon_usage.coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. GRANTS & PERMISSIONS
-- ============================================

-- Grant access to analytics views for admins
GRANT SELECT ON public.subscription_analytics TO authenticated;
GRANT SELECT ON public.revenue_analytics TO authenticated;

-- Admin policies for analytics tables
CREATE POLICY user_activity_admin_all
    ON public.user_activity
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

CREATE POLICY gpu_usage_admin_all
    ON public.gpu_usage
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );

COMMENT ON TABLE public.subscriptions IS 'Stores user subscriptions with support for recurring billing, upgrades, downgrades, and trials';
COMMENT ON TABLE public.trials IS 'Tracks trial periods for subscriptions';
COMMENT ON TABLE public.coupons IS 'Coupon codes for discounts';
COMMENT ON TABLE public.teams IS 'Team/organization accounts';
COMMENT ON TABLE public.team_members IS 'Team member relationships';
COMMENT ON TABLE public.user_activity IS 'User activity tracking for analytics';
COMMENT ON TABLE public.gpu_usage IS 'GPU usage tracking for billing and analytics';
COMMENT ON TABLE public.subscription_changes IS 'History of subscription changes (upgrades, downgrades, cancellations)';
COMMENT ON TABLE public.notifications IS 'In-app notifications for users';
COMMENT ON TABLE public.enterprise_contracts IS 'Enterprise contract management';

