// IDE Authenticate Edge Function
// Provides IDE with subscription info, features, and limits

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  rateLimit, 
  validateRequest, 
  sanitizeObject, 
  getUserIdForRateLimit,
  errorResponse,
  successResponse,
  corsHeaders 
} from '../_shared/security.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    // Parse request
    let body
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid JSON in request body', 400)
    }

    body = sanitizeObject(body)

    const { token, ide_version, platform } = body

    if (!token) {
      return errorResponse('Missing token', 400)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate token and get user
    const { data: tokenData, error: tokenError } = await supabase
      .from('ide_auth_tokens')
      .select('user_id, expires_at, license_type')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return errorResponse('Invalid or expired token', 401)
    }

    // Check token expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return errorResponse('Token expired', 401)
    }

    const userId = tokenData.user_id

    // Rate limiting
    const userIdForRateLimit = `user:${userId}`
    const rateLimitResult = await rateLimit(userIdForRateLimit, 20, 60000) // 20 requests per minute
    if (!rateLimitResult.allowed) {
      return errorResponse(rateLimitResult.error || 'Rate limit exceeded', 429)
    }

    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !user) {
      return errorResponse('User not found', 404)
    }

    // Get active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status, current_period_end, billing_interval')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Get subscription tier (fallback to license)
    let subscriptionTier = subscription?.plan_type || 'free'
    if (subscriptionTier === 'free') {
      const { data: license } = await supabase
        .from('licenses')
        .select('license_type')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('issued_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (license) {
        // Map old license types
        if (license.license_type === 'pro') subscriptionTier = 'train_pro'
        else if (license.license_type === 'enterprise') subscriptionTier = 'enterprise'
        else subscriptionTier = license.license_type
      }
    }

    // Get usage limits for tier
    const { data: limits } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('plan_type', subscriptionTier)
      .single()

    // Get current usage
    const periodStart = new Date()
    periodStart.setDate(1)
    periodStart.setHours(0, 0, 0, 0)

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('period_start', periodStart.toISOString())
      .maybeSingle()

    // Get enabled features based on tier
    const features = getFeaturesForTier(subscriptionTier, limits)

    // Update token with subscription info
    await supabase
      .from('ide_auth_tokens')
      .update({
        subscription_tier: subscriptionTier,
        features_enabled: features,
        usage_limits: limits || {},
        last_sync_at: new Date().toISOString(),
      })
      .eq('token', token)

    // Log sync event
    await supabase.from('ide_sync_events').insert({
      user_id: userId,
      event_type: 'ide_authenticate',
      event_data: {
        ide_version,
        platform,
        subscription_tier: subscriptionTier,
      },
      ide_version,
      ide_platform: platform,
      sync_status: 'success',
    })

    return successResponse({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      subscription: {
        tier: subscriptionTier,
        status: subscription?.status || 'active',
        current_period_end: subscription?.current_period_end || null,
        billing_interval: subscription?.billing_interval || 'monthly',
      },
      features: features,
      limits: limits || {},
      usage: usage ? {
        projects_count: usage.projects_count,
        exports_count: usage.exports_count,
        gpu_hours_used: parseFloat(usage.gpu_hours_used.toString()),
        gpu_hours_remaining: limits?.max_gpu_hours_per_month === -1 
          ? -1 
          : Math.max(0, (limits?.max_gpu_hours_per_month || 0) - parseFloat(usage.gpu_hours_used.toString())),
        training_runs_count: usage.training_runs_count,
        period_start: usage.period_start,
        period_end: usage.period_end,
      } : {
        projects_count: 0,
        exports_count: 0,
        gpu_hours_used: 0,
        gpu_hours_remaining: limits?.max_gpu_hours_per_month || 0,
        training_runs_count: 0,
        period_start: periodStart.toISOString(),
        period_end: new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      sync_token: token, // Reuse same token for subsequent syncs
    })
  } catch (error) {
    console.error('Error in ide-authenticate:', error)
    return errorResponse('Failed to authenticate IDE', 500)
  }
})

/**
 * Get enabled features for subscription tier
 */
function getFeaturesForTier(tier: string, limits: any): Record<string, boolean> {
  const features: Record<string, boolean> = {}

  // Model Zoo access
  features.model_zoo_basic = ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.model_zoo_premium = ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.model_zoo_all = ['deploy_pro', 'enterprise'].includes(tier)

  // Dataset Manager
  features.dataset_manager_core = ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.dataset_manager_full = ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.face_dataset_conversion = ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.dataset_version_locking = ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)

  // Annotation Studio
  features.annotation_studio_basic = ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.annotation_studio_standard = ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.annotation_studio_full = ['train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.review_approval_workflows = ['train_pro', 'deploy_pro', 'enterprise'].includes(tier)

  // Training
  features.training_small_medium = ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.advanced_training_engine = ['train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.auto_tuning = ['train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.shared_gpu_access = ['train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.full_training_logs = ['train_pro', 'deploy_pro', 'enterprise'].includes(tier)

  // Export
  features.export_onnx = ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.export_tensorflow = ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.export_pytorch = ['train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.export_tensorrt = ['deploy_pro', 'enterprise'].includes(tier)
  features.export_coreml = ['deploy_pro', 'enterprise'].includes(tier)
  features.export_openvino = ['deploy_pro', 'enterprise'].includes(tier)

  // Deployment
  features.edge_deployment = ['deploy_pro', 'enterprise'].includes(tier)
  features.on_prem_deployment = ['deploy_pro', 'enterprise'].includes(tier)
  features.offline_deployment = ['deploy_pro', 'enterprise'].includes(tier)

  // Other features
  features.basic_augmentations = ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.advanced_augmentations = ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.advanced_preprocessing = ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.inference_execution = ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.full_inference_visibility = ['train_pro', 'deploy_pro', 'enterprise'].includes(tier)
  features.full_benchmarking = ['deploy_pro', 'enterprise'].includes(tier)
  features.full_audit_logs = ['deploy_pro', 'enterprise'].includes(tier)
  features.priority_gpu_scheduling = ['deploy_pro', 'enterprise'].includes(tier)
  features.team_collaboration = ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'].includes(tier)

  return features
}

