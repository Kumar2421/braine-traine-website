// IDE Sync Project Edge Function
// Syncs project metadata from IDE to web

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
    const rateLimitResult = await rateLimit(userId, 60, 60000) // 60 syncs per minute
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

    const { 
      ide_project_id, 
      name, 
      task_type, 
      dataset_count, 
      last_trained_at, 
      status = 'active',
      models = [],
      ide_version,
      ide_platform
    } = body

    if (!ide_project_id || !name) {
      return errorResponse('Missing required fields: ide_project_id, name', 400)
    }

    // Check if project exists
    const { data: existingProject } = await supabase
      .from('projects')
      .select('project_id')
      .eq('user_id', user.id)
      .eq('ide_project_id', ide_project_id)
      .maybeSingle()

    let projectId: string

    if (existingProject) {
      // Update existing project
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({
          name,
          task_type,
          dataset_count: dataset_count || 0,
          last_trained_at: last_trained_at || null,
          status,
          ide_version,
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', existingProject.project_id)
        .select()
        .single()

      if (updateError) throw updateError
      projectId = updatedProject.project_id
    } else {
      // Create new project
      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name,
          ide_project_id,
          task_type,
          dataset_count: dataset_count || 0,
          last_trained_at: last_trained_at || null,
          status,
          ide_version,
        })
        .select()
        .single()

      if (createError) throw createError
      projectId = newProject.project_id

      // Increment projects count
      await supabase.rpc('increment_usage', {
        p_user_id: user.id,
        p_usage_type: 'projects',
        p_amount: 1.0,
      })
    }

    // Sync models if provided
    const syncedModels = []
    if (Array.isArray(models) && models.length > 0) {
      for (const model of models) {
        const { ide_model_id, name: modelName, status: modelStatus, accuracy, ...modelData } = model

        if (!ide_model_id || !modelName) continue

        // Check if model exists
        const { data: existingModel } = await supabase
          .from('models')
          .select('model_id')
          .eq('project_id', projectId)
          .eq('ide_model_id', ide_model_id)
          .maybeSingle()

        if (existingModel) {
          // Update existing model
          const { error: updateError } = await supabase
            .from('models')
            .update({
              name: modelName,
              status: modelStatus || 'completed',
              accuracy: accuracy || null,
              updated_at: new Date().toISOString(),
              ...modelData,
            })
            .eq('model_id', existingModel.model_id)

          if (!updateError) syncedModels.push(existingModel.model_id)
        } else {
          // Create new model
          const { data: newModel, error: createError } = await supabase
            .from('models')
            .insert({
              user_id: user.id,
              project_id: projectId,
              name: modelName,
              ide_model_id,
              status: modelStatus || 'completed',
              accuracy: accuracy || null,
              ide_version,
              ...modelData,
            })
            .select('model_id')
            .single()

          if (!createError && newModel) {
            syncedModels.push(newModel.model_id)
          }
        }
      }
    }

    // Log sync event
    await supabase.from('ide_sync_events').insert({
      user_id: user.id,
      event_type: existingProject ? 'project_updated' : 'project_created',
      event_data: {
        project_id: projectId,
        ide_project_id,
        models_synced: syncedModels.length,
      },
      ide_version,
      ide_platform,
      sync_status: 'success',
    })

    return successResponse({
      success: true,
      project: {
        project_id: projectId,
        ide_project_id,
        name,
        models_synced: syncedModels.length,
      },
    })
  } catch (error) {
    console.error('Error in ide-sync-project:', error)
    return errorResponse('Failed to sync project', 500)
  }
})

