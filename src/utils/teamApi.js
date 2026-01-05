/**
 * Team Management API
 * Handles team operations, member invitations, and role management
 */

import { supabase } from '../supabaseClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Get user's teams
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getUserTeams() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error('Not authenticated') }

        const { data, error } = await supabase
            .from('team_members')
            .select(`
                *,
                teams (*)
            `)
            .eq('user_id', user.id)
            .eq('status', 'active')

        if (error) throw error

        const teams = data?.map(tm => tm.teams).filter(Boolean) || []
        return { data: teams, error: null }
    } catch (error) {
        console.error('Error fetching teams:', error)
        return { data: null, error }
    }
}

/**
 * Create a new team
 * @param {string} teamName - Team name
 * @param {string} planType - Plan type (default: 'data_pro')
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createTeam(teamName, planType = 'data_pro') {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: new Error('Not authenticated') }

        const slug = teamName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

        const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert({
                name: teamName,
                slug: slug,
                owner_id: user.id,
                plan_type: planType,
            })
            .select()
            .single()

        if (teamError) throw teamError

        // Add owner as team member
        const { error: memberError } = await supabase.from('team_members').insert({
            team_id: team.team_id,
            user_id: user.id,
            role: 'owner',
            status: 'active',
            joined_at: new Date().toISOString(),
        })

        if (memberError) throw memberError

        return { data: team, error: null }
    } catch (error) {
        console.error('Error creating team:', error)
        return { data: null, error }
    }
}

/**
 * Get team members
 * @param {string} teamId - Team ID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getTeamMembers(teamId) {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .select(`
                *,
                user:auth.users!team_members_user_id_fkey (
                    id,
                    email
                )
            `)
            .eq('team_id', teamId)
            .order('role', { ascending: false })
            .order('joined_at', { ascending: false })

        if (error) throw error
        return { data: data || [], error: null }
    } catch (error) {
        console.error('Error fetching team members:', error)
        return { data: null, error }
    }
}

/**
 * Invite team member by email
 * @param {string} teamId - Team ID
 * @param {string} email - Email address
 * @param {string} role - Role (owner, admin, member, viewer)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function inviteTeamMember(teamId, email, role = 'member') {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('You must be logged in')
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/team-invite-member`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
                team_id: teamId,
                email: email,
                role: role,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to invite member')
        }

        return { success: true }
    } catch (error) {
        console.error('Error inviting team member:', error)
        return { success: false, error: error.message || 'Failed to invite member' }
    }
}

/**
 * Update team member role
 * @param {string} memberId - Member ID
 * @param {string} newRole - New role
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateTeamMemberRole(memberId, newRole) {
    try {
        const { error } = await supabase
            .from('team_members')
            .update({ role: newRole })
            .eq('member_id', memberId)

        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('Error updating member role:', error)
        return { success: false, error: error.message || 'Failed to update role' }
    }
}

/**
 * Remove team member
 * @param {string} memberId - Member ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function removeTeamMember(memberId) {
    try {
        const { error } = await supabase
            .from('team_members')
            .update({ status: 'inactive' })
            .eq('member_id', memberId)

        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('Error removing member:', error)
        return { success: false, error: error.message || 'Failed to remove member' }
    }
}

/**
 * Get team by ID
 * @param {string} teamId - Team ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getTeam(teamId) {
    try {
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .eq('team_id', teamId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching team:', error)
        return { data: null, error }
    }
}

