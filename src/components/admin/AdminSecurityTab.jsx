import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/LoadingSpinner'

function AdminSecurityTab({
    inboxMessages,
    inboxLoading,
    auditLog,
    securityActiveOnly,
    setSecurityActiveOnly,
    securityNewEmail,
    setSecurityNewEmail,
    securityNewIp,
    setSecurityNewIp,
    securityNewUserId,
    setSecurityNewUserId,
    securityNewReason,
    setSecurityNewReason,
    securityLoading,
    securityBlocklist,
    securityEvents,
    addBlocklistEntry,
    deactivateBlocklistEntry,
    formatDateTime,
    getUserEmailById,
    navigateToUserDetail,
}) {
    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Open inbox</CardDescription>
                        <CardTitle className="text-2xl">
                            {(inboxMessages || []).filter((m) => ['new', 'investigating'].includes(String(m?.status || 'new'))).length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">new + investigating</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Unassigned inbox</CardDescription>
                        <CardTitle className="text-2xl">
                            {(inboxMessages || []).filter((m) => !m?.assigned_to && ['new', 'investigating'].includes(String(m?.status || 'new'))).length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">needs triage</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Recent admin actions</CardDescription>
                        <CardTitle className="text-2xl">{(auditLog || []).length}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">last 50</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Resends queued</CardDescription>
                        <CardTitle className="text-2xl">
                            {(inboxMessages || []).filter((m) => (m?.resend_count || 0) > 0 && ['new', 'investigating'].includes(String(m?.status || 'new'))).length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">potential abuse / stuck deliveries</CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>High-risk admin actions</CardTitle>
                        <CardDescription>Quick review of potentially sensitive operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const risky = (auditLog || []).filter((a) => {
                                const t = String(a?.action_type || '').toLowerCase()
                                return (
                                    t.includes('token') ||
                                    t.includes('license') ||
                                    t.includes('assign') ||
                                    t.includes('deactiv') ||
                                    t.includes('disable') ||
                                    t.includes('role') ||
                                    t.includes('admin')
                                )
                            })

                            if (risky.length === 0) {
                                return <div className="text-sm text-muted-foreground">No high-risk actions found in the last 50.</div>
                            }

                            return (
                                <div className="overflow-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/30 text-xs text-muted-foreground">
                                            <tr className="border-b">
                                                <th className="px-3 py-2 text-left font-medium">Time</th>
                                                <th className="px-3 py-2 text-left font-medium">Admin</th>
                                                <th className="px-3 py-2 text-left font-medium">Action</th>
                                                <th className="px-3 py-2 text-left font-medium">Target</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {risky.slice(0, 15).map((action) => (
                                                <tr key={String(action.action_id)} className="border-b last:border-b-0">
                                                    <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(action.created_at)}</td>
                                                    <td className="px-3 py-2">{getUserEmailById(action.admin_user_id) || 'N/A'}</td>
                                                    <td className="px-3 py-2">{String(action.action_type || '').replace(/_/g, ' ')}</td>
                                                    <td className="px-3 py-2">{getUserEmailById(action.target_user_id) || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        })()}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Inbox anomalies</CardTitle>
                        <CardDescription>Requests that may indicate abuse or delivery problems</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {inboxLoading ? (
                            <div className="py-10 text-center">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            (() => {
                                const anomalies = (inboxMessages || []).filter((m) => {
                                    const status = String(m?.status || 'new')
                                    const resend = Number(m?.resend_count || 0)
                                    return ['new', 'investigating'].includes(status) && (resend >= 2 || !m?.linked_user_id)
                                })

                                if (anomalies.length === 0) {
                                    return <div className="text-sm text-muted-foreground">No anomalies detected in current inbox results.</div>
                                }

                                return (
                                    <div className="divide-y rounded-md border">
                                        {anomalies.slice(0, 12).map((m) => (
                                            <div key={String(m.request_id)} className="flex items-start justify-between gap-3 px-3 py-3 text-sm">
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">{m.email || '—'}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        status: {String(m.status || 'new')} · tag: {String(m.tag || '—')} · resends: {m.resend_count || 0}
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 gap-2">
                                                    {m.linked_user_id && (
                                                        <Button variant="outline" size="sm" onClick={() => navigateToUserDetail(m.linked_user_id)}>
                                                            User
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Blocklist</CardTitle>
                                <CardDescription>Block email, IP, or user_id (super only)</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSecurityActiveOnly((p) => !p)}>
                                {securityActiveOnly ? 'Showing active' : 'Showing all'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                            <input
                                type="text"
                                value={securityNewEmail}
                                onChange={(e) => setSecurityNewEmail(e.target.value)}
                                placeholder="Email (optional)"
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                            />
                            <input
                                type="text"
                                value={securityNewIp}
                                onChange={(e) => setSecurityNewIp(e.target.value)}
                                placeholder="IP address (optional)"
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                            />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <input
                                type="text"
                                value={securityNewUserId}
                                onChange={(e) => setSecurityNewUserId(e.target.value)}
                                placeholder="User ID (optional)"
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                            />
                            <input
                                type="text"
                                value={securityNewReason}
                                onChange={(e) => setSecurityNewReason(e.target.value)}
                                placeholder="Reason"
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={addBlocklistEntry} disabled={securityLoading}>
                                Add
                            </Button>
                        </div>

                        {securityLoading ? (
                            <div className="py-6 text-center">
                                <LoadingSpinner />
                            </div>
                        ) : securityBlocklist.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No blocklist entries.</div>
                        ) : (
                            <div className="overflow-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/30 text-xs text-muted-foreground">
                                        <tr className="border-b">
                                            <th className="px-3 py-2 text-left font-medium">Target</th>
                                            <th className="px-3 py-2 text-left font-medium">Reason</th>
                                            <th className="px-3 py-2 text-left font-medium">Active</th>
                                            <th className="px-3 py-2 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {securityBlocklist.slice(0, 30).map((row) => {
                                            const target = row.email || row.ip_address || row.user_id || '—'
                                            return (
                                                <tr key={String(row.block_id)} className="border-b last:border-b-0">
                                                    <td className="px-3 py-2">{String(target)}</td>
                                                    <td className="px-3 py-2 max-w-[360px] truncate">{row.reason || '—'}</td>
                                                    <td className="px-3 py-2">{row.is_active ? 'yes' : 'no'}</td>
                                                    <td className="px-3 py-2 text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!row.is_active || securityLoading}
                                                            onClick={() => deactivateBlocklistEntry(row.block_id)}
                                                        >
                                                            Deactivate
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security events</CardTitle>
                        <CardDescription>Latest admin security events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {securityLoading ? (
                            <div className="py-6 text-center">
                                <LoadingSpinner />
                            </div>
                        ) : securityEvents.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No events.</div>
                        ) : (
                            <div className="overflow-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/30 text-xs text-muted-foreground">
                                        <tr className="border-b">
                                            <th className="px-3 py-2 text-left font-medium">Time</th>
                                            <th className="px-3 py-2 text-left font-medium">Type</th>
                                            <th className="px-3 py-2 text-left font-medium">Severity</th>
                                            <th className="px-3 py-2 text-left font-medium">Target</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {securityEvents.slice(0, 30).map((evt) => {
                                            const target = evt.email || evt.ip_address || evt.user_id || '—'
                                            return (
                                                <tr key={String(evt.event_id)} className="border-b last:border-b-0">
                                                    <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(evt.created_at)}</td>
                                                    <td className="px-3 py-2">{evt.event_type || '—'}</td>
                                                    <td className="px-3 py-2">{evt.severity || 'info'}</td>
                                                    <td className="px-3 py-2">{String(target)}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default AdminSecurityTab
