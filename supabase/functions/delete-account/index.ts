import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import {
  corsHeaders,
  errorResponse,
  getUserIdForRateLimit,
  rateLimit,
  sanitizeObject,
  successResponse,
  validateRequest,
} from './_shared/security.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const userIdForRateLimit = await getUserIdForRateLimit(req, supabase)
    const rl = await rateLimit(`delete-account:${userIdForRateLimit}`, 3, 60_000)
    if (!rl.allowed) {
      return errorResponse(rl.error || 'Rate limit exceeded', 429)
    }

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    body = sanitizeObject(body)

    const { valid, error } = validateRequest(body, {
      confirm: { type: 'string', required: true, min: 4, max: 16 },
    })

    if (!valid) {
      return errorResponse(error || 'Invalid request', 400)
    }

    if (String(body.confirm || '').trim() !== 'DELETE') {
      return errorResponse('Confirmation text mismatch', 400)
    }

    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : ''

    if (!token) {
      return errorResponse('Missing Authorization header', 401)
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) {
      return errorResponse('Invalid session', 401)
    }

    const user = userData.user

    await supabase.from('account_deletion_audit').insert({
      user_id: user.id,
      email: user.email,
      metadata: {
        source: 'self_service',
      },
    })

    const { error: delErr } = await supabase.auth.admin.deleteUser(user.id)
    if (delErr) {
      return errorResponse(delErr.message || 'Failed to delete user', 500)
    }

    return successResponse({ success: true })
  } catch (e) {
    console.error('Error in delete-account:', e)
    return errorResponse(e?.message || 'Internal error', 500)
  }
})
