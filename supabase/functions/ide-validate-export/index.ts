// IDE Validate Export Edge Function
// Validates export request before processing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  rateLimit, 
  sanitizeObject, 
  getUserIdForRateLimit,
  errorResponse,
  successResponse,
  corsHeaders 
} from '../_shared/security.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Export format tier mapping
const EXPORT_FORMAT_TIERS: Record<string, string[]> = {
  'onnx': ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'tensorflow': ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'pytorch': ['train_pro', 'deploy_pro', 'enterprise'],
  'tensorrt': ['deploy_pro', 'enterprise'],
  'coreml': ['deploy_pro', 'enterprise'],
  'openvino': ['deploy_pro', 'enterprise'],
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Missing authorization header', 401)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Rate limiting
    const userId = await getUserIdForRateLimit(req, supabase)
    const rateLimitResult = await rateLimit(userId, 50, 60000) // 50 validations per minute
    if (!rateLimitResult.allowed) {
      return errorResponse(rateLimitResult.error || 'Rate limit exceeded', 429)
    }

    // Parse request
    let body
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid JSON in request body', 400)
    }

    body = sanitizeObject(body)

    const { export_format, model_size_mb, project_id } = body

    if (!export_format) {
      return errorResponse('Missing export_format', 400)
    }

    // Get user's subscription tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let tier = subscription?.plan_type || 'free'
    
    // Fallback to license
    if (tier === 'free') {
      const { data: license } = await supabase
        .from('licenses')
        .select('license_type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('issued_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (license) {
        if (license.license_type === 'pro') tier = 'train_pro'
        else if (license.license_type === 'enterprise') tier = 'enterprise'
        else tier = license.license_type
      }
    }

    // Get usage limits
    const { data: limits } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('plan_type', tier)
      .single()

    // Get current usage
    const periodStart = new Date()
    periodStart.setDate(1)
    periodStart.setHours(0, 0, 0, 0)

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('period_start', periodStart.toISOString())
      .maybeSingle()

    // Check export format access
    const allowedTiers = EXPORT_FORMAT_TIERS[export_format.toLowerCase()]
    const formatAllowed = allowedTiers ? allowedTiers.includes(tier) : false

    if (!formatAllowed) {
      const requiredTier = allowedTiers ? allowedTiers[0] : 'deploy_pro'
      
      // Log access denial
      await supabase.from('feature_access_log').insert({
        user_id: user.id,
        feature_key: `export_${export_format}`,
        access_granted: false,
        reason: `Export format '${export_format}' requires '${requiredTier}' plan`,
        subscription_tier: tier,
        usage_context: { export_format, model_size_mb },
      })

      return successResponse({
        allowed: false,
        reason: `Export format '${export_format}' requires '${requiredTier}' plan. Current plan: '${tier}'`,
        upgrade_required: true,
        required_tier: requiredTier,
        current_tier: tier,
        current_usage: {
          exports_count: usage?.exports_count || 0,
          exports_limit: limits?.max_exports_per_month === -1 ? null : limits?.max_exports_per_month || 0,
        },
        upgrade_prompt: `Upgrade to ${requiredTier.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} to unlock ${export_format} exports`,
      })
    }

    // Check export count limit
    const exportsCount = usage?.exports_count || 0
    const exportsLimit = limits?.max_exports_per_month
    const exportsLimitReached = exportsLimit !== null && exportsLimit !== -1 && exportsCount >= exportsLimit

    if (exportsLimitReached) {
      return successResponse({
        allowed: false,
        reason: `Export limit reached. You have used ${exportsCount} of ${exportsLimit} exports this month.`,
        upgrade_required: true,
        current_usage: {
          exports_count: exportsCount,
          exports_limit: exportsLimit,
        },
        upgrade_prompt: 'Upgrade your plan to get more exports per month',
      })
    }

    // Check model size limit if provided
    if (model_size_mb && limits?.max_model_size_mb !== null && limits?.max_model_size_mb !== -1) {
      if (model_size_mb > limits.max_model_size_mb) {
        return successResponse({
          allowed: false,
          reason: `Model size (${model_size_mb}MB) exceeds limit (${limits.max_model_size_mb}MB) for your plan`,
          upgrade_required: true,
          current_usage: {
            model_size_mb,
            model_size_limit: limits.max_model_size_mb,
          },
        })
      }
    }

    // All checks passed
    return successResponse({
      allowed: true,
      current_usage: {
        exports_count: exportsCount,
        exports_limit: exportsLimit === -1 ? null : exportsLimit,
        exports_remaining: exportsLimit === -1 ? null : Math.max(0, exportsLimit - exportsCount),
      },
    })
  } catch (error) {
    console.error('Error in ide-validate-export:', error)
    return errorResponse('Failed to validate export', 500)
  }
})

