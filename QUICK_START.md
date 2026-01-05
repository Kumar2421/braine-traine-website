# Quick Start Guide - Pricing & Subscription System

## 🚀 Quick Setup (5 Steps)

### Step 1: Run Database Migration
```sql
-- In Supabase Dashboard > SQL Editor
-- Run: supabase_pricing_subscriptions.sql
```

### Step 2: Create Stripe Products
1. Go to Stripe Dashboard > Products
2. Create products: Data Pro, Train Pro, Deploy Pro
3. Create prices (monthly and yearly) for each
4. Copy Price IDs

### Step 3: Update Database with Stripe Price IDs
```sql
UPDATE public.pricing_plans
SET stripe_price_id_monthly = 'price_xxxxx',
    stripe_price_id_yearly = 'price_yyyyy'
WHERE plan_key = 'data_pro';
-- Repeat for train_pro and deploy_pro
```

### Step 4: Deploy Edge Functions
```bash
# Deploy each function
supabase functions deploy stripe-create-checkout
supabase functions deploy stripe-customer-portal
supabase functions deploy stripe-cancel-subscription
supabase functions deploy stripe-resume-subscription
supabase functions deploy stripe-webhook
```

### Step 5: Configure Environment Variables
In Supabase Dashboard > Settings > Edge Functions:
- `STRIPE_SECRET_KEY=sk_test_xxxxx`
- `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

## 📁 Files Created/Modified

### New Files Created
- `supabase_pricing_subscriptions.sql` - Database migration
- `src/utils/stripeApi.js` - Stripe API utilities
- `src/utils/featureGating.js` - Feature access control
- `src/SubscriptionPage.jsx` - Subscription management page
- `supabase/functions/stripe-create-checkout/index.ts` - Checkout function
- `supabase/functions/stripe-webhook/index.ts` - Webhook handler
- `PRICING_SUBSCRIPTION_SETUP.md` - Detailed setup guide
- `IMPLEMENTATION_SUMMARY.md` - Implementation summary

### Modified Files
- `src/App.jsx` - Added subscription route
- `src/PricingPage.jsx` - Added purchase functionality
- `src/DashboardPage.jsx` - Added subscription status
- `src/AdminPage.jsx` - Added subscriptions tab
- `src/utils/adminApi.js` - Updated license types

## 🧪 Testing Checklist

- [ ] Database migration runs successfully
- [ ] Pricing plans appear on `/pricing` page
- [ ] Purchase button creates checkout session
- [ ] Stripe checkout redirects correctly
- [ ] Webhook receives events
- [ ] Subscription creates in database
- [ ] License syncs from subscription
- [ ] Subscription page shows current plan
- [ ] Customer portal opens correctly
- [ ] Billing history displays
- [ ] Admin panel shows subscriptions
- [ ] Feature gating works correctly

## 🔗 Key Routes

- `/pricing` - Pricing page with purchase buttons
- `/subscription` - Subscription management (requires auth)
- `/dashboard` - Dashboard with subscription status
- `/admin` - Admin panel with subscriptions tab

## 💡 Usage Examples

### Check Feature Access
```javascript
import { hasFeatureAccess } from './utils/featureGating'

const canUseFaceRecognition = await hasFeatureAccess('face_dataset_conversion')
```

### Get User Tier
```javascript
import { getUserTier } from './utils/featureGating'

const tier = await getUserTier() // 'free', 'data_pro', etc.
```

### Create Checkout
```javascript
import { createCheckoutSession } from './utils/stripeApi'

const result = await createCheckoutSession('data_pro', 'monthly')
if (result.success) {
    window.location.href = result.checkoutUrl
}
```

## 📞 Support

For detailed information, see:
- `PRICING_SUBSCRIPTION_SETUP.md` - Complete setup guide
- `IMPLEMENTATION_SUMMARY.md` - Implementation details

---

**Status**: ✅ Ready for deployment
**Next**: Deploy Edge Functions and configure Stripe

