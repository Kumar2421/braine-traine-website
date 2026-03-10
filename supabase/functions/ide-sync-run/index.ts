// IDE Sync Run Edge Function
// Syncs training run details from IDE to web

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

function errorResponse(message: string, status: number = 400): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

function successResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

function sanitizeString(input: string): string {
    if (typeof input !== 'string') return ''
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim()
}

function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') return sanitizeString(obj)
    if (Array.isArray(obj)) return obj.map(sanitizeObject)
    if (obj && typeof obj === 'object') {
        const sanitized: any = {}
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value)
        }
        return sanitized
    }
    return obj
}

// simple in-memory rate limiting (per function instance)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

async function rateLimit(
    userId: string,
    maxRequests: number,
    windowMs: number
): Promise<{ allowed: boolean; remaining?: number; resetAt?: number; error?: string }> {
    const now = Date.now()
    const key = `ratelimit:${userId}`
    const record = rateLimitStore.get(key)

    if (!record || now > record.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
    }

    if (record.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: record.resetAt,
            error: `Rate limit exceeded. Please try again after ${Math.ceil((record.resetAt - now) / 1000)} seconds.`,
        }
    }

    record.count++
    rateLimitStore.set(key, record)
    return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt }
}

async function getUserIdForRateLimit(req: Request, supabase: ReturnType<typeof createClient>): Promise<string> {
    try {
        const authHeader = req.headers.get('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const { data: { user } } = await supabase.auth.getUser(token)
            if (user) return user.id
        }
    } catch {
        // fall through to ip
    }

    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown'
    return `ip:${ip}`
}

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
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return errorResponse('Unauthorized', 401)
        }

        // Rate limiting
        const userId = await getUserIdForRateLimit(req, supabase)
        const rateLimitResult = await rateLimit(userId, 120, 60000) // 120 run syncs per minute
        if (!rateLimitResult.allowed) {
            return errorResponse(rateLimitResult.error || 'Rate limit exceeded', 429)
        }

        // Parse request
        let body: any
        try {
            body = await req.json()
        } catch {
            return errorResponse('Invalid JSON in request body', 400)
        }

        body = sanitizeObject(body)

        const {
            // Project linkage
            project_id,
            ide_project_id,

            // Run identifiers
            run_id,
            ide_run_id,

            // Required for create
            run_name,
            start_time,

            // Common update fields
            end_time,
            duration_minutes,
            status,
            error_message,
            progress_percentage,

            // Resource usage
            gpu_hours_used,
            gpu_type,
            gpu_count,

            // Existing baseline fields
            config,
            final_metrics,
            checkpoint_path,
            logs_url,
            ide_version,

            // Phase 10 additions
            model_name,
            base_model,
            dataset_ref,
            metrics,
            metrics_timeseries,
            artifacts,
            logs_excerpt,
            logs_meta,
            git_commit,
            git_branch,
            config_hash,
            ide_platform,
            ide_build,
            last_heartbeat_at,
            finished_reason,
        } = body || {}

        if (!project_id && !ide_project_id) {
            return errorResponse('Missing required fields: project_id or ide_project_id', 400)
        }

        // Resolve project id
        let projectId = project_id as string | undefined
        if (!projectId && ide_project_id) {
            const { data: proj, error: projErr } = await supabase
                .from('projects')
                .select('project_id')
                .eq('user_id', user.id)
                .eq('ide_project_id', ide_project_id)
                .maybeSingle()

            if (projErr) throw projErr
            if (!proj) {
                return errorResponse('Project not found for ide_project_id', 404)
            }
            projectId = proj.project_id
        }

        // Find existing run
        let existingRunId: string | null = null

        if (run_id) {
            const { data: existing, error: existingErr } = await supabase
                .from('training_runs')
                .select('run_id')
                .eq('user_id', user.id)
                .eq('project_id', projectId)
                .eq('run_id', run_id)
                .maybeSingle()
            if (existingErr) throw existingErr
            existingRunId = existing?.run_id || null
        } else if (ide_run_id) {
            const { data: existing, error: existingErr } = await supabase
                .from('training_runs')
                .select('run_id')
                .eq('user_id', user.id)
                .eq('project_id', projectId)
                .eq('ide_run_id', ide_run_id)
                .maybeSingle()
            if (existingErr) throw existingErr
            existingRunId = existing?.run_id || null
        }

        const nowIso = new Date().toISOString()

        const updateData: any = {
            updated_at: nowIso,
            end_time: end_time ?? undefined,
            duration_minutes: duration_minutes ?? undefined,
            status: status ?? undefined,
            error_message: error_message ?? undefined,
            progress_percentage: progress_percentage ?? undefined,
            gpu_hours_used: gpu_hours_used ?? undefined,
            gpu_type: gpu_type ?? undefined,
            gpu_count: gpu_count ?? undefined,
            config: config ?? undefined,
            final_metrics: final_metrics ?? undefined,
            checkpoint_path: checkpoint_path ?? undefined,
            logs_url: logs_url ?? undefined,
            ide_run_id: ide_run_id ?? undefined,
            ide_version: ide_version ?? undefined,

            model_name: model_name ?? undefined,
            base_model: base_model ?? undefined,
            dataset_ref: dataset_ref ?? undefined,
            metrics: metrics ?? undefined,
            metrics_timeseries: metrics_timeseries ?? undefined,
            artifacts: artifacts ?? undefined,
            logs_excerpt: logs_excerpt ?? undefined,
            logs_meta: logs_meta ?? undefined,
            git_commit: git_commit ?? undefined,
            git_branch: git_branch ?? undefined,
            config_hash: config_hash ?? undefined,
            ide_platform: ide_platform ?? undefined,
            ide_build: ide_build ?? undefined,
            last_heartbeat_at: last_heartbeat_at ?? nowIso,
            finished_reason: finished_reason ?? undefined,
        }

        // Remove undefined keys so partial updates don't overwrite columns
        for (const k of Object.keys(updateData)) {
            if (updateData[k] === undefined) delete updateData[k]
        }

        let runIdOut: string

        if (existingRunId) {
            const { error: updErr } = await supabase
                .from('training_runs')
                .update(updateData)
                .eq('user_id', user.id)
                .eq('project_id', projectId)
                .eq('run_id', existingRunId)

            if (updErr) throw updErr
            runIdOut = existingRunId

            await supabase.from('ide_sync_events').insert({
                user_id: user.id,
                event_type: 'training_run_updated',
                event_data: {
                    project_id: projectId,
                    run_id: runIdOut,
                    ide_run_id: ide_run_id || null,
                    status: status || null,
                },
                ide_version: ide_version || null,
                ide_platform: ide_platform || null,
                sync_status: 'success',
            })

            return successResponse({
                success: true,
                run: {
                    run_id: runIdOut,
                    project_id: projectId,
                    updated: true,
                },
            })
        }

        // Create new run
        if (!run_name || !start_time) {
            return errorResponse('Missing required fields for new run: run_name, start_time', 400)
        }

        const insertData: any = {
            user_id: user.id,
            project_id: projectId,
            run_id: run_id ?? undefined,
            ide_run_id: ide_run_id ?? undefined,
            run_name,
            start_time,
            end_time: end_time ?? null,
            duration_minutes: duration_minutes ?? null,
            status: status ?? 'running',
            error_message: error_message ?? null,
            progress_percentage: progress_percentage ?? 0,
            gpu_hours_used: gpu_hours_used ?? 0.0,
            gpu_type: gpu_type ?? null,
            gpu_count: gpu_count ?? 1,
            config: config ?? {},
            final_metrics: final_metrics ?? {},
            checkpoint_path: checkpoint_path ?? null,
            logs_url: logs_url ?? null,
            ide_version: ide_version ?? null,

            model_name: model_name ?? null,
            base_model: base_model ?? null,
            dataset_ref: dataset_ref ?? {},
            metrics: metrics ?? {},
            metrics_timeseries: metrics_timeseries ?? {},
            artifacts: artifacts ?? [],
            logs_excerpt: logs_excerpt ?? null,
            logs_meta: logs_meta ?? {},
            git_commit: git_commit ?? null,
            git_branch: git_branch ?? null,
            config_hash: config_hash ?? null,
            ide_platform: ide_platform ?? null,
            ide_build: ide_build ?? null,
            last_heartbeat_at: last_heartbeat_at ?? nowIso,
            finished_reason: finished_reason ?? null,
        }

        for (const k of Object.keys(insertData)) {
            if (insertData[k] === undefined) delete insertData[k]
        }

        const { data: newRun, error: insErr } = await supabase
            .from('training_runs')
            .insert(insertData)
            .select('run_id')
            .single()

        if (insErr) throw insErr
        runIdOut = newRun.run_id

        // Increment training runs usage
        await supabase.rpc('increment_usage', {
            p_user_id: user.id,
            p_usage_type: 'training_runs',
            p_amount: 1.0,
        })

        await supabase.from('ide_sync_events').insert({
            user_id: user.id,
            event_type: 'training_run_created',
            event_data: {
                project_id: projectId,
                run_id: runIdOut,
                ide_run_id: ide_run_id || null,
                status: status || 'running',
            },
            ide_version: ide_version || null,
            ide_platform: ide_platform || null,
            sync_status: 'success',
        })

        return successResponse({
            success: true,
            run: {
                run_id: runIdOut,
                project_id: projectId,
                created: true,
            },
        })
    } catch (error) {
        console.error('Error in ide-sync-run:', error)
        return errorResponse('Failed to sync training run', 500)
    }
})
