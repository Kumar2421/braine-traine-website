import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/LoadingSpinner'

function AdminReleaseTab({ diagnosticsEvents, diagnosticsLoading, featureFlags, handleToggleFeature }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Events loaded</CardDescription>
                        <CardTitle className="text-2xl">{(diagnosticsEvents || []).length}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">latest 200 diagnostics events</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Unique app versions</CardDescription>
                        <CardTitle className="text-2xl">
                            {Array.from(new Set((diagnosticsEvents || []).map((e) => String(e?.app_version || 'unknown')))).length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">observed in recent events</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Crash events</CardDescription>
                        <CardTitle className="text-2xl">{(diagnosticsEvents || []).filter((e) => String(e?.event_type || '') === 'crash').length}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">proxy regression signal</CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Rollout flags</CardDescription>
                        <CardTitle className="text-2xl">
                            {(featureFlags || []).filter((f) => {
                                const k = String(f?.flag_key || '').toLowerCase()
                                const c = String(f?.category || '').toLowerCase()
                                return c.includes('rollout') || k.includes('rollout') || k.includes('release') || k.includes('version')
                            }).length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">feature flag driven</CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Version distribution</CardTitle>
                        <CardDescription>Top app versions by event volume (latest 200)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {diagnosticsLoading ? (
                            <div className="py-10 text-center">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            (() => {
                                const byVersion = (diagnosticsEvents || []).reduce((acc, evt) => {
                                    const v = String(evt?.app_version || 'unknown')
                                    acc[v] = (acc[v] || 0) + 1
                                    return acc
                                }, {})
                                const rows = Object.entries(byVersion)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 12)
                                if (rows.length === 0) {
                                    return <div className="text-sm text-muted-foreground">No events available.</div>
                                }
                                return (
                                    <div className="divide-y rounded-md border">
                                        {rows.map(([v, count]) => (
                                            <div key={v} className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
                                                <div className="font-medium">{v}</div>
                                                <div className="text-muted-foreground">{count}</div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rollout controls</CardTitle>
                        <CardDescription>Commonly used release toggles (feature flags)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(() => {
                            const rows = (featureFlags || [])
                                .filter((f) => {
                                    const k = String(f?.flag_key || '').toLowerCase()
                                    const c = String(f?.category || '').toLowerCase()
                                    return c.includes('rollout') || k.includes('rollout') || k.includes('release') || k.includes('version')
                                })
                                .slice(0, 12)

                            if (rows.length === 0) {
                                return <div className="text-sm text-muted-foreground">No rollout-related flags found.</div>
                            }

                            return (
                                <div className="space-y-2">
                                    {rows.map((flag) => (
                                        <div key={String(flag.flag_key)} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">{flag.flag_key}</div>
                                                <div className="text-xs text-muted-foreground truncate">{String(flag.category || '').replace(/_/g, ' ')}</div>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => handleToggleFeature(flag.flag_key, flag.enabled)}>
                                                {flag.enabled ? 'Enabled' : 'Disabled'}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )
                        })()}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Crash distribution by version</CardTitle>
                    <CardDescription>Quick regression signal: crashes grouped by app_version</CardDescription>
                </CardHeader>
                <CardContent>
                    {diagnosticsLoading ? (
                        <div className="py-10 text-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        (() => {
                            const crashes = (diagnosticsEvents || []).filter((e) => String(e?.event_type || '') === 'crash')
                            const byVersion = crashes.reduce((acc, evt) => {
                                const v = String(evt?.app_version || 'unknown')
                                acc[v] = (acc[v] || 0) + 1
                                return acc
                            }, {})
                            const rows = Object.entries(byVersion)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 12)
                            if (rows.length === 0) {
                                return <div className="text-sm text-muted-foreground">No crash events in the current window.</div>
                            }
                            return (
                                <div className="overflow-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/30 text-xs text-muted-foreground">
                                            <tr className="border-b">
                                                <th className="px-3 py-2 text-left font-medium">Version</th>
                                                <th className="px-3 py-2 text-left font-medium">Crashes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map(([v, count]) => (
                                                <tr key={v} className="border-b last:border-b-0">
                                                    <td className="px-3 py-2">{v}</td>
                                                    <td className="px-3 py-2">{count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        })()
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminReleaseTab
