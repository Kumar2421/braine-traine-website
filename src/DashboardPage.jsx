import './App.css'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from './supabaseClient'
import { projectsApi, downloadsApi, exportsApi, handleApiError } from './utils/api.js'
import { useToast } from './utils/toast.jsx'
import { LoadingSpinner, TableSkeleton } from './components/LoadingSpinner.jsx'

function DashboardPage({ session, navigate }) {
    const toast = useToast()

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            toast.success('Logged out successfully')
            navigate('/')
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout. Please try again.')
        }
    }
    const user = session?.user
    const meta = user?.user_metadata || {}
    const name = [meta.first_name, meta.last_name].filter(Boolean).join(' ') || user?.email || 'Account'

    const userId = user?.id
    const [license, setLicense] = useState(null)
    const [licenseError, setLicenseError] = useState('')
    const [projects, setProjects] = useState([])
    const [downloads, setDownloads] = useState([])
    const [exports, setExports] = useState([])
    const [loading, setLoading] = useState({
        license: true,
        projects: true,
        downloads: true,
        exports: true,
    })

    const licenseStatus = useMemo(() => {
        if (!license) return 'Unknown'
        if (!license.is_active) return 'Inactive'
        if (license.expires_at && new Date(license.expires_at).getTime() < Date.now()) return 'Expired'
        return 'Active'
    }, [license])

    const formatDate = (dateString) => {
        if (!dateString) return 'Never'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        } catch {
            return 'Invalid date'
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Never'
        try {
            const date = new Date(dateString)
            return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        } catch {
            return 'Invalid date'
        }
    }

    // Fetch license
    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId) return
            setLicenseError('')
            setLoading((prev) => ({ ...prev, license: true }))

            try {
                const { data, error } = await supabase
                    .from('licenses')
                    .select('license_type,is_active,expires_at,issued_at')
                    .eq('user_id', userId)
                    .order('issued_at', { ascending: false })
                    .limit(1)

                if (error) throw error
                if (!mounted) return
                setLicense(data?.[0] || null)
            } catch (e) {
                if (!mounted) return
                setLicenseError(e?.message || 'Unable to load license.')
            } finally {
                if (mounted) {
                    setLoading((prev) => ({ ...prev, license: false }))
                }
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId])

    // Fetch projects
    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId) return
            setLoading((prev) => ({ ...prev, projects: true }))

            try {
                const { data, error } = await projectsApi.getProjects(userId)
                if (error) throw error
                if (!mounted) return
                setProjects(data || [])
            } catch (e) {
                if (!mounted) return
                console.error('Error loading projects:', e)
                toast.error(handleApiError(e, 'Unable to load projects'))
            } finally {
                if (mounted) {
                    setLoading((prev) => ({ ...prev, projects: false }))
                }
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId, toast])

    // Fetch downloads
    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId) return
            setLoading((prev) => ({ ...prev, downloads: true }))

            try {
                const { data, error } = await downloadsApi.getDownloads(userId)
                if (error) throw error
                if (!mounted) return
                setDownloads(data || [])
            } catch (e) {
                if (!mounted) return
                console.error('Error loading downloads:', e)
                toast.error(handleApiError(e, 'Unable to load downloads'))
            } finally {
                if (mounted) {
                    setLoading((prev) => ({ ...prev, downloads: false }))
                }
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId, toast])

    // Fetch exports
    useEffect(() => {
        let mounted = true
        const run = async () => {
            if (!userId) return
            setLoading((prev) => ({ ...prev, exports: true }))

            try {
                const { data, error } = await exportsApi.getExports(userId)
                if (error) throw error
                if (!mounted) return
                setExports(data || [])
            } catch (e) {
                if (!mounted) return
                console.error('Error loading exports:', e)
                toast.error(handleApiError(e, 'Unable to load exports'))
            } finally {
                if (mounted) {
                    setLoading((prev) => ({ ...prev, exports: false }))
                }
            }
        }

        run()
        return () => {
            mounted = false
        }
    }, [userId, toast])

    return (
        <>
            <section className="dashHero">
                <div className="container dashHero__inner">
                    <p className="dashHero__kicker">Workspace</p>
                    <h1 className="dashHero__title">{name}</h1>
                    <p className="dashHero__subtitle">Metadata-only dashboard. No datasets, images, or models are uploaded.</p>
                </div>
            </section>

            <section className="dashSection">
                <div className="container">
                    <div className="dashGrid">
                        <article className="dashCard">
                            <h2 className="dashCard__title">Overview</h2>
                            <div className="dashRows">
                                <div className="dashRow">
                                    <div className="dashRow__label">License tier</div>
                                    <div className="dashRow__value">
                                        {loading.license ? (
                                            <LoadingSpinner size="small" />
                                        ) : (
                                            license?.license_type || 'free'
                                        )}
                                    </div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">IDE version</div>
                                    <div className="dashRow__value">
                                        {projects.length > 0 && projects[0]?.ide_version
                                            ? projects[0].ide_version
                                            : 'Not reported'}
                                    </div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Last IDE activity</div>
                                    <div className="dashRow__value">
                                        {projects.length > 0 && projects[0]?.last_trained_at
                                            ? formatDate(projects[0].last_trained_at)
                                            : 'Not reported'}
                                    </div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Total projects</div>
                                    <div className="dashRow__value">{projects.length}</div>
                                </div>
                            </div>
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">License</h2>
                            <div className="dashRows">
                                <div className="dashRow">
                                    <div className="dashRow__label">Tier</div>
                                    <div className="dashRow__value">{license?.license_type || 'free'}</div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Status</div>
                                    <div className="dashRow__value">{licenseError ? 'Unavailable' : licenseStatus}</div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Last sync</div>
                                    <div className="dashRow__value">Not reported</div>
                                </div>
                                <div className="dashRow">
                                    <div className="dashRow__label">Hint</div>
                                    <div className="dashRow__value">Manage activation inside the IDE.</div>
                                </div>
                            </div>

                            <div className="dashActions">
                                <a
                                    className="button button--outline"
                                    href="/dashboard/license"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/dashboard/license')
                                    }}
                                >
                                    View license details
                                </a>
                            </div>
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">Projects (metadata only)</h2>
                            {loading.projects ? (
                                <TableSkeleton rows={3} columns={5} />
                            ) : (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Project</div>
                                        <div>Task</div>
                                        <div>Datasets</div>
                                        <div>Last trained</div>
                                        <div>Status</div>
                                    </div>
                                    {projects.length === 0 ? (
                                        <div className="dashTable__row dashTable__row--empty">
                                            <div className="dashMuted">No projects yet.</div>
                                            <div />
                                            <div />
                                            <div />
                                            <div />
                                        </div>
                                    ) : (
                                        projects.map((project) => (
                                            <div key={project.project_id} className="dashTable__row">
                                                <div>{project.name}</div>
                                                <div>{project.task_type || '—'}</div>
                                                <div>{project.dataset_count}</div>
                                                <div>{formatDate(project.last_trained_at)}</div>
                                                <div>
                                                    <span
                                                        className={`dashStatus dashStatus--${project.status}`}
                                                    >
                                                        {project.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">Downloads</h2>
                            {loading.downloads ? (
                                <TableSkeleton rows={3} columns={3} />
                            ) : (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Version</div>
                                        <div>OS</div>
                                        <div>Date</div>
                                    </div>
                                    {downloads.length === 0 ? (
                                        <div className="dashTable__row dashTable__row--empty">
                                            <div className="dashMuted">No downloads recorded yet.</div>
                                            <div />
                                            <div />
                                        </div>
                                    ) : (
                                        downloads.map((download) => (
                                            <div key={download.download_id} className="dashTable__row">
                                                <div>{download.version}</div>
                                                <div>{download.os}</div>
                                                <div>{formatDate(download.downloaded_at)}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </article>

                        <article className="dashCard">
                            <h2 className="dashCard__title">Exports (metadata)</h2>
                            {loading.exports ? (
                                <TableSkeleton rows={3} columns={4} />
                            ) : (
                                <div className="dashTable">
                                    <div className="dashTable__head">
                                        <div>Model</div>
                                        <div>Format</div>
                                        <div>Date</div>
                                        <div>Project</div>
                                    </div>
                                    {exports.length === 0 ? (
                                        <div className="dashTable__row dashTable__row--empty">
                                            <div className="dashMuted">No exports recorded yet.</div>
                                            <div />
                                            <div />
                                            <div />
                                        </div>
                                    ) : (
                                        exports.map((exportItem) => {
                                            const project = projects.find(
                                                (p) => p.project_id === exportItem.project_id
                                            )
                                            return (
                                                <div key={exportItem.export_id} className="dashTable__row">
                                                    <div>{exportItem.model_name}</div>
                                                    <div>{exportItem.format.toUpperCase()}</div>
                                                    <div>{formatDate(exportItem.exported_at)}</div>
                                                    <div>{project?.name || '—'}</div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            )}
                        </article>
                    </div>

                    <div className="dashActions" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <a
                                className="button button--primary"
                                href="/download"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/download')
                                }}
                            >
                                Go to Download Hub
                            </a>
                            <a
                                className="button button--outline"
                                href="/docs"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/docs')
                                }}
                            >
                                View Docs
                            </a>
                        </div>
                        <button
                            className="button button--outline-dark"
                            onClick={(e) => {
                                e.preventDefault()
                                handleLogout()
                            }}
                            type="button"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </section>
        </>
    )
}

export default DashboardPage
