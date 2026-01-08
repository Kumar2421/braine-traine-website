-- Pricing & Subscription System Migration
-- This migration adds support for subscription tiers, Stripe integration, and billing management

-- Update licenses table to support new pricing tiers
ALTER TABLE public.licenses 
DROP CONSTRAINT IF EXISTS licenses_license_type_check;

ALTER TABLE public.licenses
ADD CONSTRAINT licenses_license_type_check 
CHECK (license_type IN ('free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'));

-- Update ide_auth_tokens to support new tiers
ALTER TABLE public.ide_auth_tokens 
DROP CONSTRAINT IF EXISTS ide_auth_tokens_license_type_check;

ALTER TABLE public.ide_auth_tokens
ADD CONSTRAINT ide_auth_tokens_license_type_check 
CHECK (license_type IN ('free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'));

-- Subscriptions table: tracks active subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('data_pro', 'train_pro', 'deploy_pro', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'paused')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    canceled_at TIMESTAMPTZ NULL,
    trial_start TIMESTAMPTZ NULL,
    trial_end TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'subscriptions'
          AND column_name = 'stripe_subscription_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON public.subscriptions(stripe_subscription_id);
    END IF;
END$$;
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_plan_type_idx ON public.subscriptions(plan_type);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
DROP POLICY IF EXISTS subscriptions_select_own ON public.subscriptions;
CREATE POLICY subscriptions_select_own
    ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own subscriptions (via Stripe webhook)
DROP POLICY IF EXISTS subscriptions_insert_own ON public.subscriptions;
CREATE POLICY subscriptions_insert_own
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions (via Stripe webhook)
DROP POLICY IF EXISTS subscriptions_update_own ON public.subscriptions;
CREATE POLICY subscriptions_update_own
    ON public.subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Billing history table: tracks invoices and payments
CREATE TABLE IF NOT EXISTS public.billing_history (
    billing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(subscription_id) ON DELETE SET NULL,
    stripe_invoice_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'failed', 'refunded', 'void')),
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,
    description TEXT,
    period_start TIMESTAMPTZ NULL,
    period_end TIMESTAMPTZ NULL,
    paid_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS billing_history_user_id_idx ON public.billing_history(user_id);
CREATE INDEX IF NOT EXISTS billing_history_subscription_id_idx ON public.billing_history(subscription_id);
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'billing_history'
          AND column_name = 'stripe_invoice_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS billing_history_stripe_invoice_id_idx ON public.billing_history(stripe_invoice_id);
    END IF;
END$$;
CREATE INDEX IF NOT EXISTS billing_history_status_idx ON public.billing_history(status);
CREATE INDEX IF NOT EXISTS billing_history_created_at_idx ON public.billing_history(created_at DESC);

ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own billing history
DROP POLICY IF EXISTS billing_history_select_own ON public.billing_history;
CREATE POLICY billing_history_select_own
    ON public.billing_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Payment methods table: stores Stripe payment methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
    payment_method_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('card', 'bank_account')),
    is_default BOOLEAN NOT NULL DEFAULT false,
    card_brand TEXT NULL,
    card_last4 TEXT NULL,
    card_exp_month INTEGER NULL,
    card_exp_year INTEGER NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON public.payment_methods(user_id);
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payment_methods'
          AND column_name = 'stripe_payment_method_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS payment_methods_stripe_payment_method_id_idx ON public.payment_methods(stripe_payment_method_id);
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payment_methods'
          AND column_name = 'stripe_customer_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS payment_methods_stripe_customer_id_idx ON public.payment_methods(stripe_customer_id);
    END IF;
END$$;

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Users can read their own payment methods
DROP POLICY IF EXISTS payment_methods_select_own ON public.payment_methods;
CREATE POLICY payment_methods_select_own
    ON public.payment_methods
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own payment methods
DROP POLICY IF EXISTS payment_methods_insert_own ON public.payment_methods;
CREATE POLICY payment_methods_insert_own
    ON public.payment_methods
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment methods
DROP POLICY IF EXISTS payment_methods_update_own ON public.payment_methods;
CREATE POLICY payment_methods_update_own
    ON public.payment_methods
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own payment methods
DROP POLICY IF EXISTS payment_methods_delete_own ON public.payment_methods;
CREATE POLICY payment_methods_delete_own
    ON public.payment_methods
    FOR DELETE
    USING (auth.uid() = user_id);

-- Pricing plans configuration table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
    plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_key TEXT UNIQUE NOT NULL CHECK (plan_key IN ('free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise')),
    plan_name TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NULL, -- Price in cents, NULL for free/enterprise
    price_yearly INTEGER NULL, -- Price in cents, NULL for free/enterprise
    stripe_price_id_monthly TEXT NULL,
    stripe_price_id_yearly TEXT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pricing_plans_plan_key_idx ON public.pricing_plans(plan_key);
CREATE INDEX IF NOT EXISTS pricing_plans_is_active_idx ON public.pricing_plans(is_active);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can read active pricing plans
DROP POLICY IF EXISTS pricing_plans_select_public ON public.pricing_plans;
CREATE POLICY pricing_plans_select_public
    ON public.pricing_plans
    FOR SELECT
    USING (is_active = true);

-- Insert default pricing plans
INSERT INTO public.pricing_plans (plan_key, plan_name, description, price_monthly, price_yearly, features, limitations, sort_order) VALUES
    ('free', 'Free — Explore', 'Build, label, and train locally — evaluate ML FORGE before committing.', 0, 0, 
     '["Model Zoo access (most pre-trained models)", "Dataset Manager (full core access)", "Annotation Studio (basic tools)", "Basic augmentations", "Training access (small & medium models)", "Inference execution allowed"]'::jsonb,
     '["Face dataset conversion", "Advanced augmentations", "Export formats", "Benchmarking"]'::jsonb, 1),
    ('data_pro', 'Data Pro — Prepare', 'Advanced dataset preparation and transformation for serious projects.', 4900, 49000, -- $49/month, $490/year
     '["Everything in Free", "Full Dataset Manager", "Face recognition dataset creation", "Full augmentation suite", "Advanced preprocessing tools", "Dataset version locking"]'::jsonb,
     '["Advanced training (auto-tuning)", "Full benchmarking", "Export & deployment"]'::jsonb, 2),
    ('train_pro', 'Train Pro — Build', 'Train, tune, and analyze models with full visibility and logs.', 9900, 99000, -- $99/month, $990/year
     '["Everything in Data Pro", "Full Annotation Studio", "Review & approval workflows", "Team collaboration", "Advanced training engine", "Auto-tuning", "Shared GPU access", "Full training logs", "Full inference visibility"]'::jsonb,
     '["Limited export formats", "Limited benchmarking presets"]'::jsonb, 3),
    ('deploy_pro', 'Deploy Pro — Ship', 'Production-grade export, benchmarking, and deployment.', 19900, 199000, -- $199/month, $1990/year
     '["Everything unlocked", "Full export formats (ONNX, TensorRT, CoreML, etc.)", "Full inference & benchmarking", "Edge, on-prem, offline deployment", "Full audit logs", "Priority GPU scheduling"]'::jsonb,
     '[]'::jsonb, 4),
    ('enterprise', 'Enterprise', 'Custom pricing for large teams and organizations.', NULL, NULL,
     '["Everything in Deploy Pro", "Custom SLAs", "Dedicated support", "On-premise deployment", "Custom integrations", "Volume discounts"]'::jsonb,
     '[]'::jsonb, 5)
ON CONFLICT (plan_key) DO UPDATE SET
    plan_name = EXCLUDED.plan_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limitations = EXCLUDED.limitations,
    updated_at = now();

-- Function to sync subscription to license
CREATE OR REPLACE FUNCTION sync_subscription_to_license()
RETURNS TRIGGER AS $$
BEGIN
    -- When subscription is created or updated, sync to licenses table
    IF NEW.status = 'active' OR NEW.status = 'trialing' THEN
        -- Insert or update license
        INSERT INTO public.licenses (user_id, license_type, is_active, expires_at, issued_at)
        VALUES (NEW.user_id, NEW.plan_type, true, NEW.current_period_end, now())
        ON CONFLICT DO NOTHING;
        
        -- Update existing license if it exists
        UPDATE public.licenses
        SET 
            license_type = NEW.plan_type,
            is_active = true,
            expires_at = NEW.current_period_end,
            updated_at = now()
        WHERE user_id = NEW.user_id
        AND license_id = (
            SELECT license_id FROM public.licenses
            WHERE user_id = NEW.user_id
            ORDER BY issued_at DESC
            LIMIT 1
        );
    ELSIF NEW.status IN ('canceled', 'past_due', 'unpaid') THEN
        -- Deactivate license when subscription is canceled
        UPDATE public.licenses
        SET 
            is_active = false,
            updated_at = now()
        WHERE user_id = NEW.user_id
        AND license_type = NEW.plan_type;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync subscription to license
DROP TRIGGER IF EXISTS sync_subscription_license_trigger ON public.subscriptions;
CREATE TRIGGER sync_subscription_license_trigger
    AFTER INSERT OR UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_subscription_to_license();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscriptions updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at_trigger ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at_trigger
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Trigger for payment_methods updated_at
DROP TRIGGER IF EXISTS update_payment_methods_updated_at_trigger ON public.payment_methods;
CREATE TRIGGER update_payment_methods_updated_at_trigger
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Admin policies for subscriptions (admins can view all)
DROP POLICY IF EXISTS subscriptions_admin_all ON public.subscriptions;
CREATE POLICY subscriptions_admin_all
    ON public.subscriptions
    FOR ALL
    USING (
        public.can_access_admin_panel()
    );

-- Admin policies for billing_history
DROP POLICY IF EXISTS billing_history_admin_all ON public.billing_history;
CREATE POLICY billing_history_admin_all
    ON public.billing_history
    FOR ALL
    USING (
        public.can_access_admin_panel()
    );

-- Admin policies for payment_methods
DROP POLICY IF EXISTS payment_methods_admin_all ON public.payment_methods;
CREATE POLICY payment_methods_admin_all
    ON public.payment_methods
    FOR ALL
    USING (
        public.can_access_admin_panel()
    );

-- Admin policies for pricing_plans
DROP POLICY IF EXISTS pricing_plans_admin_all ON public.pricing_plans;
CREATE POLICY pricing_plans_admin_all
    ON public.pricing_plans
    FOR ALL
    USING (
        public.can_access_admin_panel()
    );

-- View for user subscription summary
CREATE OR REPLACE VIEW public.user_subscription_summary
WITH (security_invoker = on) AS
SELECT 
    u.id as user_id,
    u.email,
    s.subscription_id,
    s.plan_type,
    s.status as subscription_status,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    l.license_type,
    l.is_active as license_active,
    l.expires_at as license_expires_at,
    (SELECT COUNT(*) FROM public.billing_history WHERE user_id = u.id AND status = 'paid') as total_payments,
    (SELECT SUM(amount) FROM public.billing_history WHERE user_id = u.id AND status = 'paid') as total_paid_amount
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
) l ON true;

GRANT SELECT ON public.user_subscription_summary TO authenticated;

