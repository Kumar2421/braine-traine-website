-- Razorpay Migration - Replace Stripe with Razorpay
-- Run this after supabase_pricing_subscriptions.sql

-- Step 1: Update subscriptions table - Replace Stripe fields with Razorpay
ALTER TABLE public.subscriptions 
DROP COLUMN IF EXISTS stripe_subscription_id,
DROP COLUMN IF EXISTS stripe_customer_id;

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT;

-- Update indexes
DROP INDEX IF EXISTS subscriptions_stripe_subscription_id_idx;
CREATE INDEX IF NOT EXISTS subscriptions_razorpay_subscription_id_idx ON public.subscriptions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_razorpay_customer_id_idx ON public.subscriptions(razorpay_customer_id);

-- Step 2: Update billing_history table - Replace Stripe fields with Razorpay
ALTER TABLE public.billing_history
DROP COLUMN IF EXISTS stripe_invoice_id,
DROP COLUMN IF EXISTS stripe_payment_intent_id;

ALTER TABLE public.billing_history
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_invoice_id TEXT;

-- Update indexes
DROP INDEX IF EXISTS billing_history_stripe_invoice_id_idx;
CREATE INDEX IF NOT EXISTS billing_history_razorpay_payment_id_idx ON public.billing_history(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS billing_history_razorpay_order_id_idx ON public.billing_history(razorpay_order_id);

-- Step 3: Update payment_methods table - Replace Stripe fields with Razorpay
ALTER TABLE public.payment_methods
DROP COLUMN IF EXISTS stripe_payment_method_id,
DROP COLUMN IF EXISTS stripe_customer_id;

ALTER TABLE public.payment_methods
ADD COLUMN IF NOT EXISTS razorpay_token_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT;

-- Update indexes
DROP INDEX IF EXISTS payment_methods_stripe_payment_method_id_idx;
DROP INDEX IF EXISTS payment_methods_stripe_customer_id_idx;
CREATE INDEX IF NOT EXISTS payment_methods_razorpay_token_id_idx ON public.payment_methods(razorpay_token_id);
CREATE INDEX IF NOT EXISTS payment_methods_razorpay_customer_id_idx ON public.payment_methods(razorpay_customer_id);

-- Step 4: Update pricing_plans table - Replace Stripe Price IDs with Razorpay Plan IDs
ALTER TABLE public.pricing_plans
DROP COLUMN IF EXISTS stripe_price_id_monthly,
DROP COLUMN IF EXISTS stripe_price_id_yearly;

ALTER TABLE public.pricing_plans
ADD COLUMN IF NOT EXISTS razorpay_plan_id_monthly TEXT,
ADD COLUMN IF NOT EXISTS razorpay_plan_id_yearly TEXT;

-- Step 5: Update comments in policies
COMMENT ON COLUMN public.subscriptions.razorpay_subscription_id IS 'Razorpay subscription ID';
COMMENT ON COLUMN public.subscriptions.razorpay_customer_id IS 'Razorpay customer ID';
COMMENT ON COLUMN public.billing_history.razorpay_payment_id IS 'Razorpay payment ID';
COMMENT ON COLUMN public.payment_methods.razorpay_token_id IS 'Razorpay token ID for saved payment methods';
