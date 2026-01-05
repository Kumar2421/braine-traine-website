// IDE Track Usage Edge Function
// Tracks usage (GPU hours, exports, training runs, etc.) from IDE

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
    const rateLimitResult = await rateLimit(userId, 200, 60000) // 200 updates per minute
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

    const { usage_type, amount = 1.0, details = {} } = body

    if (!usage_type) {
      return errorResponse('Missing usage_type', 400)
    }

    // Validate usage type
    const validUsageTypes = ['gpu_hours', 'export', 'training_run', 'project_created', 'dataset_created', 'model_created']
    if (!validUsageTypes.includes(usage_type)) {
      return errorResponse(`Invalid usage_type. Must be one of: ${validUsageTypes.join(', ')}`, 400)
    }

    // Get or create usage tracking for current period
    const periodStart = new Date()
    periodStart.setDate(1)
    periodStart.setHours(0, 0, 0, 0)

    let { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('period_start', periodStart.toISOString())
      .maybeSingle()

    if (usageError && usageError.code !== 'PGRST116') {
      throw usageError
    }

    // Create if doesn't exist
    if (!usage) {
      const { data: newUsage, error: createError } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          period_start: periodStart.toISOString(),
          period_end: new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (createError) throw createError
      usage = newUsage
    }

    // Get user's limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let tier = subscription?.plan_type || 'free'
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

    const { data: limits } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('plan_type', tier)
      .single()

    // Update usage based on type
    let updateData: any = { updated_at: new Date().toISOString() }
    let limitReached = false
    let limitValue: number | null = null

    switch (usage_type) {
      case 'gpu_hours':
        const newGpuHours = parseFloat(usage.gpu_hours_used.toString()) + parseFloat(amount.toString())
        updateData.gpu_hours_used = newGpuHours
        limitValue = limits?.max_gpu_hours_per_month
        if (limitValue !== null && limitValue !== -1 && newGpuHours >= limitValue) {
          limitReached = true
        }
        break

      case 'export':
        updateData.exports_count = usage.exports_count + 1
        limitValue = limits?.max_exports_per_month
        if (limitValue !== null && limitValue !== -1 && updateData.exports_count >= limitValue) {
          limitReached = true
        }
        // Track export format if provided
        if (details.export_format) {
          const formats = usage.export_formats_used || []
          if (!formats.includes(details.export_format)) {
            updateData.export_formats_used = [...formats, details.export_format]
          }
        }
        break

      case 'training_run':
        updateData.training_runs_count = usage.training_runs_count + 1
        limitValue = limits?.max_training_runs_per_month
        if (limitValue !== null && limitValue !== -1 && updateData.training_runs_count >= limitValue) {
          limitReached = true
        }
        break

      case 'project_created':
        updateData.projects_count = usage.projects_count + 1
        limitValue = limits?.max_projects
        if (limitValue !== null && limitValue !== -1 && updateData.projects_count >= limitValue) {
          limitReached = true
        }
        break

      case 'dataset_created':
        updateData.datasets_count = usage.datasets_count + 1
        break

      case 'model_created':
        // Models are tracked separately, but we can log here
        break
    }

    // Update usage tracking
    const { error: updateError } = await supabase
      .from('usage_tracking')
      .update(updateData)
      .eq('usage_id', usage.usage_id)

    if (updateError) throw updateError

    // Log sync event
    await supabase.from('ide_sync_events').insert({
      user_id: user.id,
      event_type: 'usage_tracked',
      event_data: {
        usage_type,
        amount,
        details,
      },
      sync_status: 'success',
    })

    // Calculate remaining
    let remaining: number | null = null
    if (limitValue !== null && limitValue !== -1) {
      switch (usage_type) {
        case 'gpu_hours':
          remaining = Math.max(0, limitValue - parseFloat(updateData.gpu_hours_used.toString()))
          break
        case 'export':
          remaining = Math.max(0, limitValue - updateData.exports_count)
          break
        case 'training_run':
          remaining = Math.max(0, limitValue - updateData.training_runs_count)
          break
        case 'project_created':
          remaining = Math.max(0, limitValue - updateData.projects_count)
          break
      }
    }

    return successResponse({
      success: true,
      usage_updated: {
        [usage_type]: updateData[usage_type === 'gpu_hours' ? 'gpu_hours_used' : 
                                 usage_type === 'export' ? 'exports_count' :
                                 usage_type === 'training_run' ? 'training_runs_count' :
                                 usage_type === 'project_created' ? 'projects_count' : 'count'],
        remaining: remaining,
        limit: limitValue === -1 ? null : limitValue,
        limit_reached: limitReached,
      },
    })
  } catch (error) {
    console.error('Error in ide-track-usage:', error)
    return errorResponse('Failed to track usage', 500)
  }
})

