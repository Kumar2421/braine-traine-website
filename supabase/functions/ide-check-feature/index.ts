// IDE Check Feature Edge Function
// Checks if user can access a specific feature

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

// Feature tier mapping
const FEATURE_TIERS: Record<string, string[]> = {
  // Model Zoo
  'model_zoo_basic': ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'model_zoo_premium': ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'model_zoo_all': ['deploy_pro', 'enterprise'],
  
  // Dataset Manager
  'dataset_manager_core': ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'dataset_manager_full': ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'face_dataset_conversion': ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'dataset_version_locking': ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  
  // Annotation
  'annotation_studio_basic': ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'annotation_studio_standard': ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'annotation_studio_full': ['train_pro', 'deploy_pro', 'enterprise'],
  'review_approval_workflows': ['train_pro', 'deploy_pro', 'enterprise'],
  
  // Training
  'training_small_medium': ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'advanced_training_engine': ['train_pro', 'deploy_pro', 'enterprise'],
  'auto_tuning': ['train_pro', 'deploy_pro', 'enterprise'],
  'shared_gpu_access': ['train_pro', 'deploy_pro', 'enterprise'],
  'full_training_logs': ['train_pro', 'deploy_pro', 'enterprise'],
  
  // Export
  'export_onnx': ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'export_tensorflow': ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'export_pytorch': ['train_pro', 'deploy_pro', 'enterprise'],
  'export_tensorrt': ['deploy_pro', 'enterprise'],
  'export_coreml': ['deploy_pro', 'enterprise'],
  'export_openvino': ['deploy_pro', 'enterprise'],
  
  // Deployment
  'edge_deployment': ['deploy_pro', 'enterprise'],
  'on_prem_deployment': ['deploy_pro', 'enterprise'],
  'offline_deployment': ['deploy_pro', 'enterprise'],
  
  // Other
  'advanced_augmentations': ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'advanced_preprocessing': ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
  'full_benchmarking': ['deploy_pro', 'enterprise'],
  'full_audit_logs': ['deploy_pro', 'enterprise'],
  'priority_gpu_scheduling': ['deploy_pro', 'enterprise'],
  'team_collaboration': ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
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
    const rateLimitResult = await rateLimit(userId, 100, 60000) // 100 checks per minute
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

    const { feature_key, context = {} } = body

    if (!feature_key) {
      return errorResponse('Missing feature_key', 400)
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

    // Check feature access
    const allowedTiers = FEATURE_TIERS[feature_key]
    const hasAccess = allowedTiers ? allowedTiers.includes(tier) : false

    // Get required tier
    const requiredTier = allowedTiers ? allowedTiers[0] : null

    // Log feature access attempt
    await supabase.from('feature_access_log').insert({
      user_id: user.id,
      feature_key,
      access_granted: hasAccess,
      reason: hasAccess ? null : `Feature requires '${requiredTier}' plan. Current plan: '${tier}'`,
      subscription_tier: tier,
      usage_context: context,
    })

    // Log sync event
    await supabase.from('ide_sync_events').insert({
      user_id: user.id,
      event_type: 'feature_check',
      event_data: {
        feature_key,
        has_access: hasAccess,
        tier,
        required_tier: requiredTier,
      },
      sync_status: 'success',
    })

    return successResponse({
      has_access: hasAccess,
      reason: hasAccess ? null : `Feature requires '${requiredTier}' plan. Current plan: '${tier}'`,
      upgrade_required: !hasAccess && requiredTier !== null,
      required_tier: requiredTier,
      current_tier: tier,
      feature_key,
    })
  } catch (error) {
    console.error('Error in ide-check-feature:', error)
    return errorResponse('Failed to check feature access', 500)
  }
})

