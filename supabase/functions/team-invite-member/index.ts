// Team Invite Member Edge Function
// Handles team member invitations with email lookup and validation

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
    const rateLimitResult = await rateLimit(userId, 20, 60000) // 20 invites per minute
    if (!rateLimitResult.allowed) {
      return errorResponse(rateLimitResult.error || 'Rate limit exceeded', 429)
    }

    // Parse and validate request
    let body
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid JSON in request body', 400)
    }

    body = sanitizeObject(body)

    const { team_id, email, role } = body

    if (!team_id || !email || !role) {
      return errorResponse('Missing required fields: team_id, email, role', 400)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', 400)
    }

    // Validate role
    const validRoles = ['owner', 'admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
      return errorResponse('Invalid role', 400)
    }

    // Check if user has permission to invite (must be owner or admin)
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role, teams!inner(team_id, owner_id)')
      .eq('user_id', user.id)
      .eq('team_id', team_id)
      .eq('status', 'active')
      .single()

    if (!teamMember) {
      return errorResponse('Team not found or access denied', 403)
    }

    const canInvite = teamMember.role === 'owner' || teamMember.role === 'admin'
    if (!canInvite) {
      return errorResponse('Only team owners and admins can invite members', 403)
    }

    // Look up user by email (requires admin access or RPC function)
    // For now, we'll use a service role to query auth.users
    const { data: invitedUsers } = await supabase.auth.admin.listUsers()
    const invitedUser = invitedUsers?.users.find(u => u.email === email)

    if (!invitedUser) {
      // User doesn't exist yet - create pending invitation
      // In production, you'd want to:
      // 1. Create an invitation record in a separate table
      // 2. Send email invitation
      // 3. Allow user to accept when they sign up
      return errorResponse('User not found. They need to sign up first. Email invitations coming soon.', 404)
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', team_id)
      .eq('user_id', invitedUser.id)
      .maybeSingle()

    if (existing) {
      return errorResponse('User is already a team member', 400)
    }

    // Create team member
    const { data: newMember, error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team_id,
        user_id: invitedUser.id,
        role: role,
        status: 'active',
        invited_by: user.id,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (memberError) {
      throw memberError
    }

    return successResponse({
      success: true,
      member: newMember,
    })
  } catch (error) {
    console.error('Error inviting team member:', error)
    return errorResponse('Failed to invite team member', 500)
  }
})

