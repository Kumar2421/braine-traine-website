import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type ConsumeExchangeRequest = {
    token?: string
}

function jsonResponse(body: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'POST, OPTIONS',
            'access-control-allow-headers': 'content-type, authorization',
            ...(init?.headers || {}),
        },
    })
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'access-control-allow-origin': '*',
                'access-control-allow-methods': 'POST, OPTIONS',
                'access-control-allow-headers': 'content-type, authorization',
            },
        })
    }

    if (req.method !== 'POST') {
        return jsonResponse({ error: 'method_not_allowed' }, { status: 405 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const bridgeSecret = Deno.env.get('BRAINTRAIN_BRIDGE_SECRET')

    if (!supabaseUrl || !serviceKey) {
        return jsonResponse({ error: 'server_not_configured' }, { status: 500 })
    }

    if (!bridgeSecret) {
        return jsonResponse({ error: 'bridge_secret_not_configured' }, { status: 500 })
    }

    const authHeader = req.headers.get('authorization') || ''
    const expected = `Bearer ${bridgeSecret}`
    if (authHeader !== expected) {
        return jsonResponse({ error: 'unauthorized' }, { status: 401 })
    }

    let payload: ConsumeExchangeRequest
    try {
        payload = await req.json()
    } catch {
        return jsonResponse({ error: 'invalid_json' }, { status: 400 })
    }

    const token = (payload?.token || '').trim()
    if (!token || !token.startsWith('bt_ex_')) {
        return jsonResponse({ error: 'invalid_token' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    })

    const nowIso = new Date().toISOString()

    // Atomically consume: update only if not used and not expired.
    const { data: consumedRow, error: consumeErr } = await supabase
        .from('auth_exchanges')
        .update({ used: true })
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', nowIso)
        .select('user_id')
        .maybeSingle()

    if (consumeErr) {
        return jsonResponse({ error: 'consume_failed', details: consumeErr.message }, { status: 500 })
    }

    if (!consumedRow?.user_id) {
        return jsonResponse({ error: 'token_invalid_or_expired' }, { status: 401 })
    }

    // License metadata only.
    let licenseType = 'free'
    const { data: lic, error: licErr } = await supabase
        .from('licenses')
        .select('license_type,issued_at,is_active,expires_at')
        .eq('user_id', consumedRow.user_id)
        .eq('is_active', true)
        .order('issued_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (!licErr && lic?.license_type) {
        licenseType = lic.license_type
    }

    return jsonResponse({
        user_id: consumedRow.user_id,
        license_type: licenseType,
    })
})
