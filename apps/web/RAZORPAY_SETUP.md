# Razorpay Payment Integration Setup

This document explains how to set up Razorpay payment integration for ML FORGE subscriptions.

## Overview

ML FORGE uses Razorpay for payment processing, which is ideal for the Indian market. The integration includes:
- Order creation for subscriptions
- Payment verification
- Subscription management (cancel/resume)
- Webhook handling for payment events

## Prerequisites

1. Razorpay account (https://razorpay.com)
2. Razorpay API keys (Key ID and Key Secret)
3. Supabase project with Edge Functions enabled

## Step 1: Get Razorpay API Keys

1. Log in to your Razorpay Dashboard
2. Go to Settings → API Keys
3. Generate Test/Live API keys
4. Copy your **Key ID** and **Key Secret**

## Step 2: Configure Supabase Environment Variables

Add the following environment variables to your Supabase project:

1. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Add these secrets:

```
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

## Step 3: Deploy Edge Functions

Deploy the Razorpay Edge Functions to Supabase:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy Edge Functions
supabase functions deploy razorpay-create-order
supabase functions deploy razorpay-verify-payment
supabase functions deploy razorpay-webhook
supabase functions deploy razorpay-cancel-subscription
supabase functions deploy razorpay-resume-subscription
```

## Step 4: Run Database Migration

Run the Razorpay migration SQL file to update your database schema:

1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase_razorpay_migration.sql`
3. This will:
   - Replace Stripe columns with Razorpay columns
   - Add Razorpay-specific fields
   - Create webhook events table

## Step 5: Configure Razorpay Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add a new webhook with URL:
   ```
   https://your-project-ref.supabase.co/functions/v1/razorpay-webhook
   ```
3. Select the following events:
   - `payment.captured`
   - `payment.authorized`
   - `payment.failed`
   - `subscription.cancelled`
   - `subscription.activated`
   - `subscription.resumed`
   - `subscription.paused`
4. Save the webhook

## Step 6: Update Pricing Plans

Update your `pricing_plans` table with Razorpay plan IDs (optional, for recurring subscriptions):

```sql
UPDATE pricing_plans 
SET razorpay_plan_id_monthly = 'plan_monthly_id',
    razorpay_plan_id_yearly = 'plan_yearly_id'
WHERE plan_key = 'data_pro';
```

**Note:** For one-time payments (current implementation), you don't need Razorpay plan IDs. The system creates orders directly.

## Step 7: Test the Integration

### Test Order Creation

1. Navigate to `/pricing` page
2. Select a plan
3. Click "Select Pricing"
4. You should be redirected to `/checkout` with Razorpay checkout modal

### Test Payment Flow

1. Use Razorpay test cards:
   - **Card Number:** 4111 1111 1111 1111
   - **CVV:** Any 3 digits
   - **Expiry:** Any future date
   - **Name:** Any name

2. Complete the payment
3. Verify subscription is created in database

## Payment Flow

1. **User selects plan** → `/pricing` page
2. **User clicks "Select Pricing"** → Navigates to `/checkout`
3. **CheckoutPage creates order** → Calls `razorpay-create-order` Edge Function
4. **Razorpay checkout opens** → User enters payment details
5. **Payment successful** → Razorpay returns payment details
6. **Payment verified** → Calls `razorpay-verify-payment` Edge Function
7. **Subscription created** → Database updated with subscription
8. **User redirected** → `/subscription` page

## Database Schema

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
    subscription_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    razorpay_subscription_id TEXT,
    razorpay_customer_id TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    plan_type TEXT NOT NULL,
    status TEXT NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    ...
);
```

### Billing History Table

```sql
CREATE TABLE billing_history (
    billing_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
    amount INTEGER, -- in paise
    currency TEXT,
    status TEXT,
    ...
);
```

## Edge Functions

### razorpay-create-order

Creates a Razorpay order for subscription purchase.

**Request:**
```json
{
  "plan_key": "data_pro",
  "billing_interval": "monthly"
}
```

**Response:**
```json
{
  "order_id": "order_xxx",
  "amount": 99900,
  "currency": "INR",
  "key": "rzp_test_xxx",
  "name": "ML FORGE",
  "description": "Data Pro - Monthly subscription"
}
```

### razorpay-verify-payment

Verifies payment and creates subscription.

**Request:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "plan_key": "data_pro",
  "billing_interval": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": { ... }
}
```

### razorpay-webhook

Handles Razorpay webhook events.

**Events handled:**
- `payment.captured` - Updates billing history
- `payment.failed` - Marks payment as failed
- `subscription.cancelled` - Updates subscription status
- `subscription.activated` - Activates subscription

## Troubleshooting

### Payment not processing

1. Check Razorpay API keys are correct
2. Verify Edge Functions are deployed
3. Check browser console for errors
4. Verify Razorpay checkout script is loaded

### Subscription not created

1. Check `razorpay-verify-payment` logs in Supabase
2. Verify payment signature is correct
3. Check database permissions
4. Verify user is authenticated

### Webhook not working

1. Check webhook URL is correct
2. Verify webhook events are selected
3. Check Edge Function logs
4. Verify webhook signature verification

## Security Notes

1. **Never expose API keys** in client-side code
2. **Always verify payment signatures** on the server
3. **Use HTTPS** for all webhook endpoints
4. **Validate webhook signatures** before processing
5. **Store sensitive data** in Supabase secrets

## Support

For issues or questions:
- Razorpay Documentation: https://razorpay.com/docs/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
