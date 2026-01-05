# Pricing & Subscription System Setup Guide

## Overview

ML FORGE now includes a complete subscription and billing system with Stripe integration. This document outlines the setup process and architecture.

## 🎯 Features Implemented

### 1. Database Schema
- **Subscriptions Table**: Tracks active Stripe subscriptions
- **Billing History Table**: Records all invoices and payments
- **Payment Methods Table**: Stores customer payment methods
- **Pricing Plans Table**: Configuration for all pricing tiers
- **Updated Licenses Table**: Supports new pricing tiers (free, data_pro, train_pro, deploy_pro, enterprise)

### 2. Pricing Tiers

- **Free — Explore**: $0/month
  - Model Zoo access (most models)
  - Dataset Manager (core)
  - Basic annotation tools
  - Small/medium model training
  - Inference execution

- **Data Pro — Prepare**: $49/month or $490/year
  - Everything in Free
  - Face recognition dataset creation
  - Full augmentation suite
  - Advanced preprocessing tools
  - Dataset version locking

- **Train Pro — Build**: $99/month or $990/year
  - Everything in Data Pro
  - Full Annotation Studio
  - Review & approval workflows
  - Team collaboration
  - Advanced training engine
  - Auto-tuning
  - Full training logs

- **Deploy Pro — Ship**: $199/month or $1,990/year
  - Everything unlocked
  - Full export formats (ONNX, TensorRT, CoreML, etc.)
  - Full benchmarking
  - Edge/on-prem deployment
  - Priority GPU scheduling

- **Enterprise**: Custom pricing
  - Everything in Deploy Pro
  - Custom SLAs
  - Dedicated support
  - On-premise deployment

### 3. User Features

#### Subscription Management Page (`/subscription`)
- View current subscription status
- Manage subscription (via Stripe Customer Portal)
- Cancel/resume subscription
- View billing history
- Manage payment methods

#### Dashboard Integration
- Subscription status display
- Upgrade prompts for free users
- Quick access to subscription management

#### Pricing Page (`/pricing`)
- Dynamic pricing display from database
- Monthly/yearly billing toggle
- Purchase buttons with Stripe checkout
- Current plan highlighting

### 4. Admin Features

#### Admin Panel Enhancements
- **Subscriptions Tab**: View all active subscriptions
- **License Management**: Updated to support new tiers
- **Billing Overview**: Track subscription revenue

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Execute the SQL migration file in your Supabase SQL Editor:

```sql
-- Run this file in Supabase Dashboard > SQL Editor
supabase_pricing_subscriptions.sql
```

This creates:
- `subscriptions` table
- `billing_history` table
- `payment_methods` table
- `pricing_plans` table
- Updates `licenses` table constraints
- Creates views and triggers

### Step 2: Configure Stripe

1. **Create Stripe Account**
   - Sign up at https://stripe.com
   - Get your API keys (test and live)

2. **Create Products and Prices in Stripe**
   - Create products for each tier:
     - Data Pro (monthly and yearly)
     - Train Pro (monthly and yearly)
     - Deploy Pro (monthly and yearly)
   - Copy the Price IDs (e.g., `price_xxxxx`)

3. **Update Pricing Plans Table**
   ```sql
   UPDATE public.pricing_plans
   SET stripe_price_id_monthly = 'price_xxxxx',
       stripe_price_id_yearly = 'price_yyyyy'
   WHERE plan_key = 'data_pro';
   -- Repeat for train_pro and deploy_pro
   ```

### Step 3: Create Stripe Edge Functions

You need to create the following Supabase Edge Functions:

#### 1. `stripe-create-checkout`
Creates a Stripe Checkout Session for subscription purchase.

**Location**: `supabase/functions/stripe-create-checkout/index.ts`

**Required Environment Variables**:
- `STRIPE_SECRET_KEY`: Your Stripe secret key

**Functionality**:
- Creates Stripe customer if doesn't exist
- Creates checkout session
- Returns checkout URL

#### 2. `stripe-customer-portal`
Creates a Stripe Customer Portal session for subscription management.

**Location**: `supabase/functions/stripe-customer-portal/index.ts`

**Functionality**:
- Creates customer portal session
- Returns portal URL

#### 3. `stripe-cancel-subscription`
Cancels a subscription (at period end or immediately).

**Location**: `supabase/functions/stripe-cancel-subscription/index.ts`

**Functionality**:
- Cancels Stripe subscription
- Updates database subscription status

#### 4. `stripe-resume-subscription`
Resumes a canceled subscription.

**Location**: `supabase/functions/stripe-resume-subscription/index.ts`

**Functionality**:
- Resumes Stripe subscription
- Updates database subscription status

#### 5. `stripe-webhook`
Handles Stripe webhook events (subscription updates, payments, etc.).

**Location**: `supabase/functions/stripe-webhook/index.ts`

**Required Environment Variables**:
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret

**Handles Events**:
- `checkout.session.completed`: Create subscription
- `customer.subscription.updated`: Update subscription
- `customer.subscription.deleted`: Cancel subscription
- `invoice.paid`: Record billing history
- `invoice.payment_failed`: Update subscription status

### Step 4: Configure Stripe Webhook

1. **Create Webhook Endpoint in Stripe Dashboard**
   - URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.updated`

2. **Copy Webhook Signing Secret**
   - Add to Edge Function environment variables

### Step 5: Set Environment Variables

Add to your Supabase project settings:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxx  # or sk_live_xxxxx for production
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## 📋 API Reference

### Stripe API (`src/utils/stripeApi.js`)

#### `createCheckoutSession(planKey, billingInterval)`
Creates a Stripe checkout session.

```javascript
const result = await createCheckoutSession('data_pro', 'monthly')
if (result.success) {
    window.location.href = result.checkoutUrl
}
```

#### `createCustomerPortalSession()`
Opens Stripe Customer Portal.

```javascript
const result = await createCustomerPortalSession()
if (result.success) {
    window.location.href = result.portalUrl
}
```

#### `getActiveSubscription()`
Gets user's active subscription.

```javascript
const { data, error } = await getActiveSubscription()
```

#### `getBillingHistory(limit)`
Gets billing history.

```javascript
const { data, error } = await getBillingHistory(20)
```

#### `cancelSubscription(subscriptionId, cancelImmediately)`
Cancels a subscription.

```javascript
const result = await cancelSubscription(subscriptionId, false)
```

### Feature Gating (`src/utils/featureGating.js`)

#### `hasFeatureAccess(featureKey)`
Checks if user has access to a feature.

```javascript
const hasAccess = await hasFeatureAccess('face_dataset_conversion')
```

#### `getUserTier()`
Gets user's current subscription tier.

```javascript
const tier = await getUserTier() // 'free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'
```

## 🔒 Security

### Row Level Security (RLS)
All tables have RLS policies:
- Users can only access their own subscriptions/billing data
- Admins can access all data
- Public can view active pricing plans

### Stripe Security
- All Stripe API calls go through Edge Functions (server-side)
- Never expose Stripe secret keys to client
- Webhook signature verification
- Customer portal handles payment method management securely

## 🎨 UI Components

### SubscriptionPage
- Location: `src/SubscriptionPage.jsx`
- Route: `/subscription`
- Features:
  - Current plan display
  - Subscription management
  - Billing history
  - Payment methods

### PricingPage Updates
- Dynamic pricing from database
- Purchase buttons
- Billing interval toggle
- Current plan highlighting

### DashboardPage Updates
- Subscription status card
- Upgrade prompts
- Quick access to subscription management

## 📊 Database Schema

### Subscriptions Table
```sql
subscriptions (
    subscription_id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    plan_type TEXT CHECK (plan_type IN ('data_pro', 'train_pro', 'deploy_pro', 'enterprise')),
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'paused')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN,
    ...
)
```

### Billing History Table
```sql
billing_history (
    billing_id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    subscription_id UUID REFERENCES subscriptions,
    stripe_invoice_id TEXT UNIQUE,
    amount INTEGER, -- in cents
    currency TEXT,
    status TEXT,
    ...
)
```

## 🔄 Subscription Flow

1. **User clicks "Subscribe" on Pricing Page**
2. **Frontend calls `createCheckoutSession()`**
3. **Edge Function creates Stripe Checkout Session**
4. **User redirected to Stripe Checkout**
5. **User completes payment**
6. **Stripe webhook fires `checkout.session.completed`**
7. **Edge Function creates subscription record**
8. **Trigger syncs subscription to licenses table**
9. **User gains access to features**

## 🛠️ Troubleshooting

### Subscription not syncing to license
- Check trigger `sync_subscription_license_trigger` exists
- Verify subscription status is 'active' or 'trialing'
- Check database logs for trigger errors

### Checkout not working
- Verify Stripe API keys are correct
- Check Edge Function logs
- Ensure pricing plans have Stripe Price IDs set

### Webhook not receiving events
- Verify webhook URL is correct
- Check webhook signing secret matches
- Verify webhook is enabled in Stripe Dashboard

## 📝 Next Steps

1. **Implement Edge Functions** (see Step 3)
2. **Set up Stripe Products and Prices**
3. **Configure Webhook**
4. **Test checkout flow**
5. **Test subscription management**
6. **Test webhook events**

## 📚 Resources

- [Stripe Subscriptions Documentation](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

**Last Updated**: 2024
**Version**: 1.0.0

