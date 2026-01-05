/**
 * Team Management Component
 * Handles team creation, member management, and role-based access
 */

import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { getUserTeams, createTeam, getTeamMembers, inviteTeamMember, updateTeamMemberRole, removeTeamMember } from '../utils/teamApi'
import { useToast } from '../utils/toast'
import { LoadingSpinner } from './LoadingSpinner'

export function TeamManagement({ session, navigate }) {
    const toast = useToast()
    const [teams, setTeams] = useState([])
    const [currentTeam, setCurrentTeam] = useState(null)
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('member')

    useEffect(() => {
        loadTeams()
    }, [session])

    const loadTeams = async () => {
        if (!session?.user) return

        setLoading(true)
        try {
            const result = await getUserTeams()
            if (result.error) throw result.error

            setTeams(result.data || [])

            if (result.data && result.data.length > 0 && !currentTeam) {
                setCurrentTeam(result.data[0])
                loadTeamMembers(result.data[0].team_id)
            }
        } catch (error) {
            console.error('Error loading teams:', error)
            toast.error('Failed to load teams')
        } finally {
            setLoading(false)
        }
    }

    const loadTeamMembers = async (teamId) => {
        try {
            const result = await getTeamMembers(teamId)
            if (result.error) throw result.error
            setMembers(result.data || [])
        } catch (error) {
            console.error('Error loading team members:', error)
            toast.error('Failed to load team members')
        }
    }

    const handleCreateTeam = async (teamName) => {
        if (!teamName) return

        try {
            const result = await createTeam(teamName)
            if (result.error) throw result.error

            toast.success('Team created successfully')
            loadTeams()
            if (result.data) {
                setCurrentTeam(result.data)
                loadTeamMembers(result.data.team_id)
            }
        } catch (error) {
            console.error('Error creating team:', error)
            toast.error('Failed to create team')
        }
    }

    const handleInviteMember = async () => {
        if (!currentTeam || !inviteEmail) return

        try {
            const result = await inviteTeamMember(currentTeam.team_id, inviteEmail, inviteRole)
            if (!result.success) {
                throw new Error(result.error || 'Failed to invite member')
            }

            toast.success(`Invitation sent to ${inviteEmail}`)
            setShowInviteModal(false)
            setInviteEmail('')
            loadTeamMembers(currentTeam.team_id)
        } catch (error) {
            console.error('Error inviting member:', error)
            toast.error(error.message || 'Failed to send invitation')
        }
    }

    const handleUpdateRole = async (memberId, newRole) => {
        try {
            const result = await updateTeamMemberRole(memberId, newRole)
            if (!result.success) {
                throw new Error(result.error || 'Failed to update role')
            }

            toast.success('Role updated')
            loadTeamMembers(currentTeam.team_id)
        } catch (error) {
            console.error('Error updating role:', error)
            toast.error(error.message || 'Failed to update role')
        }
    }

    const handleRemoveMember = async (memberId) => {
        if (!confirm('Are you sure you want to remove this member?')) return

        try {
            const result = await removeTeamMember(memberId)
            if (!result.success) {
                throw new Error(result.error || 'Failed to remove member')
            }

            toast.success('Member removed')
            loadTeamMembers(currentTeam.team_id)
        } catch (error) {
            console.error('Error removing member:', error)
            toast.error(error.message || 'Failed to remove member')
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="team-management">
            <div className="dashHero">
                <div className="container dashHero__inner">
                    <p className="dashHero__kicker">Teams</p>
                    <h1 className="dashHero__title">Team Management</h1>
                    <p className="dashHero__subtitle">
                        Manage your teams, invite members, and control access.
                    </p>
                </div>
            </div>

            <section className="dashSection">
                <div className="container">
                    {/* Team Selection */}
                    <div className="dashCard" style={{ marginBottom: '24px' }}>
                        <h2 className="dashCard__title">Your Teams</h2>
                        {teams.length === 0 ? (
                            <div>
                                <p style={{ marginBottom: '16px', color: 'var(--dr-muted)' }}>
                                    You don't have any teams yet. Create one to get started.
                                </p>
                                <button
                                    className="button button--primary"
                                    onClick={() => {
                                        const name = prompt('Enter team name:')
                                        if (name) handleCreateTeam(name)
                                    }}
                                >
                                    Create Team
                                </button>
                            </div>
                        ) : (
                            <div className="adminTabs">
                                {teams.map((team) => (
                                    <button
                                        key={team.team_id}
                                        className={`adminTab ${currentTeam?.team_id === team.team_id ? 'adminTab--active' : ''}`}
                                        onClick={() => {
                                            setCurrentTeam(team)
                                            loadTeamMembers(team.team_id)
                                        }}
                                    >
                                        {team.name}
                                    </button>
                                ))}
                                <button
                                    className="button button--outline"
                                    onClick={() => {
                                        const name = prompt('Enter team name:')
                                        if (name) handleCreateTeam(name)
                                    }}
                                    style={{ marginLeft: 'auto' }}
                                >
                                    + New Team
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Team Members */}
                    {currentTeam && (
                        <div className="dashCard">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 className="dashCard__title">Team Members</h2>
                                <button
                                    className="button button--primary"
                                    onClick={() => setShowInviteModal(true)}
                                >
                                    Invite Member
                                </button>
                            </div>

                            {members.length === 0 ? (
                                <div className="dashMuted" style={{ padding: '24px', textAlign: 'center' }}>
                                    No members yet. Invite team members to get started.
                                </div>
                            ) : (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Member</div>
                                        <div>Role</div>
                                        <div>Status</div>
                                        <div>Joined</div>
                                        <div>Actions</div>
                                    </div>
                                    {members.map((member) => {
                                        const isOwner = member.role === 'owner'
                                        const isCurrentUser = member.user_id === session?.user?.id
                                        const canEdit = currentTeam.owner_id === session?.user?.id || member.role === 'admin'

                                        return (
                                            <div key={member.member_id} className="dashTable__row">
                                                <div>
                                                    {member.user?.email || member.user_id?.substring(0, 8) + '...' || 'Unknown User'}
                                                </div>
                                                <div>
                                                    <select
                                                        value={member.role}
                                                        onChange={(e) => handleUpdateRole(member.member_id, e.target.value)}
                                                        disabled={isOwner || !canEdit || isCurrentUser}
                                                        style={{
                                                            padding: '4px 8px',
                                                            border: '1px solid var(--dr-border)',
                                                            borderRadius: '4px',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        <option value="owner">Owner</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="member">Member</option>
                                                        <option value="viewer">Viewer</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <span className={`dashStatus dashStatus--${member.status === 'active' ? 'active' : 'archived'}`}>
                                                        {member.status}
                                                    </span>
                                                </div>
                                                <div>
                                                    {member.joined_at
                                                        ? new Date(member.joined_at).toLocaleDateString()
                                                        : member.invited_at
                                                        ? `Invited ${new Date(member.invited_at).toLocaleDateString()}`
                                                        : '—'}
                                                </div>
                                                <div>
                                                    {!isOwner && canEdit && !isCurrentUser && (
                                                        <button
                                                            className="button button--outline"
                                                            onClick={() => handleRemoveMember(member.member_id)}
                                                            style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Team Settings */}
                    {currentTeam && (
                        <div className="dashCard" style={{ marginTop: '24px' }}>
                            <h2 className="dashCard__title">Team Settings</h2>
                            <div className="dashRows">
                                <div className="dashRow">
                                    <div className="dashRow__label">Team Name</div>
                                    <div className="dashRow__value">{currentTeam.name}</div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Plan</div>
                                    <div className="dashRow__value">
                                        {currentTeam.plan_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Free'}
                                    </div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Max Members</div>
                                    <div className="dashRow__value">{currentTeam.max_members || 'Unlimited'}</div>
                                </div>
                            </div>
                            {currentTeam.owner_id === session?.user?.id && (
                                <div className="dashActions" style={{ marginTop: '24px' }}>
                                    <a
                                        className="button button--primary"
                                        href="/pricing"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            navigate('/pricing')
                                        }}
                                    >
                                        Upgrade Team Plan
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Invite Team Member</h2>
                            <button className="modal-close" onClick={() => setShowInviteModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--dr-border)',
                                        borderRadius: '8px',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Role
                                </label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--dr-border)',
                                        borderRadius: '8px',
                                        fontSize: '16px'
                                    }}
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="button button--outline" onClick={() => setShowInviteModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="button button--primary"
                                onClick={handleInviteMember}
                                disabled={!inviteEmail}
                            >
                                Send Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

