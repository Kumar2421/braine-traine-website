/**
 * Validation Schemas for Edge Functions
 * Reusable validation schemas for request validation
 */

export const planKeySchema = {
  type: 'string' as const,
  required: true,
  enum: ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
}

export const billingIntervalSchema = {
  type: 'string' as const,
  required: true,
  enum: ['monthly', 'yearly'],
}

export const subscriptionIdSchema = {
  type: 'string' as const,
  required: true,
  pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
}

export const couponCodeSchema = {
  type: 'string' as const,
  required: false,
  min: 3,
  max: 50,
  pattern: /^[A-Z0-9_-]+$/i,
}

export const trialDaysSchema = {
  type: 'number' as const,
  required: false,
  min: 0,
  max: 365,
}

export const emailSchema = {
  type: 'string' as const,
  required: true,
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  max: 255,
}

export const createOrderSchema = {
  plan_key: planKeySchema,
  billing_interval: billingIntervalSchema,
}

export const createSubscriptionSchema = {
  plan_key: planKeySchema,
  billing_interval: billingIntervalSchema,
  coupon_code: couponCodeSchema,
  trial_days: trialDaysSchema,
}

export const verifyPaymentSchema = {
  razorpay_order_id: {
    type: 'string' as const,
    required: true,
    min: 1,
    max: 100,
  },
  razorpay_payment_id: {
    type: 'string' as const,
    required: true,
    min: 1,
    max: 100,
  },
  razorpay_signature: {
    type: 'string' as const,
    required: true,
    min: 1,
    max: 200,
  },
  plan_key: planKeySchema,
  billing_interval: billingIntervalSchema,
}

export const upgradeSubscriptionSchema = {
  subscription_id: subscriptionIdSchema,
  new_plan_key: planKeySchema,
}

export const downgradeSubscriptionSchema = {
  subscription_id: subscriptionIdSchema,
  new_plan_key: planKeySchema,
  immediate: {
    type: 'boolean' as const,
    required: false,
  },
}

export const startTrialSchema = {
  plan_key: planKeySchema,
  trial_days: {
    ...trialDaysSchema,
    required: true,
  },
}

export const calculateProrationSchema = {
  subscription_id: subscriptionIdSchema,
  new_plan_key: planKeySchema,
}

