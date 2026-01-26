import { useState, useEffect, useMemo } from 'react'
import './App.css'

function DownloadHubPage({ navigate }) {
    const [activeOS, setActiveOS] = useState('windows')

    const updateBaseUrl = import.meta.env.VITE_BRAINTRAIN_UPDATE_BASE_URL

    const manifestPathByOs = useMemo(
        () => ({
            windows: 'windows/latest.json',
            linux: 'linux/latest.json',
        }),
        []
    )

    const [manifestByOs, setManifestByOs] = useState({})
    const [manifestLoading, setManifestLoading] = useState(false)
    const [manifestError, setManifestError] = useState(null)

    useEffect(() => {
        const manifestPath = manifestPathByOs[activeOS]
        if (!manifestPath) return

        if (!updateBaseUrl) {
            setManifestError('Download server is not configured.')
            return
        }

        let cancelled = false

        async function fetchManifest() {
            try {
                setManifestLoading(true)
                setManifestError(null)
                const normalizedBase = String(updateBaseUrl).replace(/\/+$/, '')
                const url = `${normalizedBase}/${manifestPath}`
                const response = await fetch(url, { cache: 'no-store' })
                const json = await response.json()

                if (!response.ok) {
                    throw new Error(json?.error || json?.message || `Failed to fetch ${url}`)
                }

                if (!cancelled) {
                    setManifestByOs((prev) => ({ ...prev, [activeOS]: json }))
                }
            } catch (error) {
                if (!cancelled) {
                    setManifestError(error?.message || String(error))
                }
            } finally {
                if (!cancelled) {
                    setManifestLoading(false)
                }
            }
        }

        fetchManifest()

        return () => {
            cancelled = true
        }
    }, [activeOS, manifestPathByOs, updateBaseUrl])

    const osData = {
        windows: {
            name: 'Windows',
            icon: '🪟',
            version: '—',
            file: 'Installer',
            requirements: [
                { label: 'OS', value: 'Windows 10 (64-bit) or Windows 11' },
                { label: 'RAM', value: '8GB minimum, 16GB recommended' },
                { label: 'Storage', value: '5GB free space' },
                { label: 'GPU', value: 'Optional (NVIDIA recommended for training)' },
                { label: 'Internet', value: 'Required for initial setup only' }
            ]
        },
        macos: {
            name: 'macOS',
            icon: '🍎',
            version: 'Coming Soon',
            file: 'ML FORGE-Setup-0.1.0.dmg',
            requirements: [
                { label: 'OS', value: 'macOS 12.0 (Monterey) or later' },
                { label: 'RAM', value: '8GB minimum, 16GB recommended' },
                { label: 'Storage', value: '5GB free space' },
                { label: 'GPU', value: 'Apple Silicon (M1/M2) or Intel with Metal support' },
                { label: 'Internet', value: 'Required for initial setup only' }
            ]
        },
        linux: {
            name: 'Linux',
            icon: '🐧',
            version: '—',
            file: 'Installer',
            requirements: [
                { label: 'OS', value: 'Ubuntu 20.04+ or compatible Linux distribution' },
                { label: 'RAM', value: '8GB minimum, 16GB recommended' },
                { label: 'Storage', value: '5GB free space' },
                { label: 'GPU', value: 'Optional (NVIDIA with CUDA 11.8+ recommended)' },
                { label: 'Internet', value: 'Required for initial setup only' }
            ]
        }
    }

    const currentOS = osData[activeOS]
    const manifest = manifestByOs[activeOS]

    const installers = useMemo(() => {
        if (!manifest) return []
        if (Array.isArray(manifest.installers)) return manifest.installers
        if (manifest.installer) return [manifest.installer]
        return []
    }, [manifest])

    const primaryInstaller = installers[0] || null
    const releaseNotes = Array.isArray(manifest?.notes) ? manifest.notes : []
    const latestVersion = manifest?.version || currentOS.version
    const releaseDate = manifest?.releaseDate || null

    const badgeText =
        activeOS === 'macos'
            ? 'Coming Soon'
            : manifestLoading
                ? 'Checking…'
                : primaryInstaller?.url
                    ? 'Available'
                    : 'Coming Soon'

    return (
        <>
            <section className="downloadHero">
                <div className="container downloadHero__inner">
                    <p className="downloadHero__kicker">Download</p>
                    <div className="downloadHero__titleWrapper">
                        <h1 className="downloadHero__title">Download for desktop</h1>
                        <div className="downloadHero__badge">
                            <span className="downloadHero__badgeText">{badgeText}</span>
                        </div>
                    </div>
                    <p className="downloadHero__subtitle">
                        Local-first installers. Offline capable. No dataset uploads. Your data stays with you. NVIDIA GPU recommended for training; CPU-only is supported.
                    </p>
                </div>
            </section>

            <section className="downloadMain">
                <div className="container">
                    <div className="downloadTabs" role="tablist" aria-label="Operating system">
                        <button
                            className={`downloadTab ${activeOS === 'windows' ? 'downloadTab--active' : ''}`}
                            type="button"
                            role="tab"
                            aria-selected={activeOS === 'windows'}
                            onClick={() => setActiveOS('windows')}
                        >
                            <span className="downloadTab__icon">{osData.windows.icon}</span>
                            Windows
                        </button>
                        <button
                            className={`downloadTab ${activeOS === 'macos' ? 'downloadTab--active' : ''}`}
                            type="button"
                            role="tab"
                            aria-selected={activeOS === 'macos'}
                            onClick={() => setActiveOS('macos')}
                        >
                            <span className="downloadTab__icon">{osData.macos.icon}</span>
                            macOS
                            <span className="downloadTab__badge">Soon</span>
                        </button>
                        <button
                            className={`downloadTab ${activeOS === 'linux' ? 'downloadTab--active' : ''}`}
                            type="button"
                            role="tab"
                            aria-selected={activeOS === 'linux'}
                            onClick={() => setActiveOS('linux')}
                        >
                            <span className="downloadTab__icon">{osData.linux.icon}</span>
                            Linux
                            <span className="downloadTab__badge">Soon</span>
                        </button>
                    </div>

                    <div className="downloadHubGrid">
                        <article className="downloadHubCard downloadHubCard--primary">
                            <div className="downloadHubCard__header">
                                <div>
                                    <div className="downloadHubCard__kicker">{currentOS.name} Installer</div>
                                    <div className="downloadHubCard__title">ML FORGE IDE</div>
                                    <div className="downloadHubCard__version">
                                        <span className="downloadHubCard__versionLabel">Latest Version:</span>
                                        <span className="downloadHubCard__versionValue">{latestVersion}</span>
                                    </div>
                                    {releaseDate ? (
                                        <div className="downloadHubCard__version">
                                            <span className="downloadHubCard__versionLabel">Released:</span>
                                            <span className="downloadHubCard__versionValue">{releaseDate}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <div className="downloadHubCard__actions">
                                <a
                                    className={`button button--primary button--large ${!primaryInstaller?.url ? 'button--disabled' : ''}`}
                                    href={primaryInstaller?.url || '#'}
                                    onClick={(e) => {
                                        if (!primaryInstaller?.url) {
                                            e.preventDefault()
                                        }
                                        if (activeOS === 'windows') {
                                            // Download logic here when available
                                        }
                                    }}
                                    style={!primaryInstaller?.url ? { pointerEvents: 'none', opacity: 0.6 } : {}}
                                >
                                    <span className="button__icon"></span>
                                    Download for {currentOS.name}
                                </a>
                                <p className="downloadHubCard__note">
                                    {manifestLoading ? 'Checking latest release…' : manifestError ? manifestError : primaryInstaller?.url ? 'Direct download' : 'Not available'}
                                </p>
                            </div>
                            <div className="downloadHubCard__body">
                                {installers.length > 1 ? (
                                    <div className="downloadHubSection">
                                        <h3 className="downloadHubSection__title">Other installers</h3>
                                        <div className="downloadHubCard__actions">
                                            {installers.slice(1).map((installer, index) => (
                                                <a
                                                    key={`${installer?.url || 'installer'}-${index}`}
                                                    className={`button button--outline ${!installer?.url ? 'button--disabled' : ''}`}
                                                    href={installer?.url || '#'}
                                                    onClick={(e) => {
                                                        if (!installer?.url) e.preventDefault()
                                                    }}
                                                    style={!installer?.url ? { pointerEvents: 'none', opacity: 0.6 } : {}}
                                                >
                                                    Download
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                                <div className="downloadHubSection">
                                    <h3 className="downloadHubSection__title">System Requirements</h3>
                                    <ul className="downloadHubList">
                                        {currentOS.requirements.map((req, index) => (
                                            <li key={index} className="downloadHubList__item">
                                                <strong>{req.label}:</strong> {req.value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="downloadHubSection">
                                    <h3 className="downloadHubSection__title">Verification</h3>
                                    {installers.length ? (
                                        installers.map((installer, index) => (
                                            <div key={`${installer?.sha256 || 'sha'}-${index}`} className="downloadHubRow">
                                                <div className="downloadHubRow__label">SHA256</div>
                                                <div className="downloadHubRow__value downloadHubRow__value--mono">
                                                    {installer?.sha256 || '—'}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="downloadHubRow">
                                            <div className="downloadHubRow__label">SHA256</div>
                                            <div className="downloadHubRow__value downloadHubRow__value--mono">—</div>
                                        </div>
                                    )}
                                    <p className="downloadHubCard__help">
                                        Verify your download integrity using the checksum above.
                                    </p>
                                </div>
                            </div>
                        </article>

                        <article className="downloadHubCard">
                            <div className="downloadHubCard__kicker">Release Notes</div>
                            <div className="downloadHubCard__title">Version History</div>
                            <div className="downloadHubReleases">
                                <div className="downloadHubRelease">
                                    <div className="downloadHubRelease__header">
                                        <div className="downloadHubRelease__version">{latestVersion}</div>
                                        <div className="downloadHubRelease__date">{releaseDate || (activeOS === 'macos' ? 'Coming Soon' : '—')}</div>
                                    </div>
                                    <div className="downloadHubRelease__body">
                                        {releaseNotes.length ? (
                                            <ul>
                                                {releaseNotes.map((note, idx) => (
                                                    <li key={`${idx}-${String(note)}`}>{String(note)}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>{activeOS === 'macos' ? 'Coming Soon' : 'No release notes published yet.'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <a
                                className="button button--outline"
                                href="/docs"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/docs')
                                }}
                            >
                                View Full Documentation
                            </a>
                        </article>

                        <article className="downloadHubCard">
                            <div className="downloadHubCard__kicker">Hardware Compatibility</div>
                            <div className="downloadHubCard__title">GPU Support</div>
                            <div className="downloadHubTable">
                                <div className="downloadHubTable__head">
                                    <div>Vendor</div>
                                    <div>Status</div>
                                    <div>Notes</div>
                                </div>
                                <div className="downloadHubTable__row">
                                    <div>
                                        <strong>NVIDIA</strong>
                                    </div>
                                    <div>
                                        <span className="downloadHubTable__badge downloadHubTable__badge--supported">Supported</span>
                                    </div>
                                    <div>Recommended for training speed. CUDA 11.8+ required.</div>
                                </div>
                                <div className="downloadHubTable__row">
                                    <div>
                                        <strong>AMD</strong>
                                    </div>
                                    <div>
                                        <span className="downloadHubTable__badge downloadHubTable__badge--experimental">Experimental</span>
                                    </div>
                                    <div>Depends on ROCm / driver stack. Limited testing.</div>
                                </div>
                                <div className="downloadHubTable__row">
                                    <div>
                                        <strong>CPU Only</strong>
                                    </div>
                                    <div>
                                        <span className="downloadHubTable__badge downloadHubTable__badge--supported">Supported</span>
                                    </div>
                                    <div>Slower training, fully offline. Suitable for small datasets.</div>
                                </div>
                            </div>
                        </article>

                        <div className="downloadHubGrid__split">
                            <article className="downloadHubCard">
                                <div className="downloadHubCard__kicker">Installation</div>
                                <div className="downloadHubCard__title">Quick Start Guide</div>
                                <ol className="downloadHubSteps">
                                    <li className="downloadHubStep">
                                        <div className="downloadHubStep__number">1</div>
                                        <div className="downloadHubStep__content">
                                            <strong>Download the installer</strong>
                                            <p>Choose an installer above and download it from the official HTTPS host.</p>
                                        </div>
                                    </li>
                                    <li className="downloadHubStep">
                                        <div className="downloadHubStep__number">2</div>
                                        <div className="downloadHubStep__content">
                                            <strong>Verify SHA256</strong>
                                            <p>
                                                {activeOS === 'windows'
                                                    ? 'PowerShell: Get-FileHash .\\Installer.exe -Algorithm SHA256'
                                                    : activeOS === 'linux'
                                                        ? 'Terminal: sha256sum ./installer-file'
                                                        : 'Coming Soon'}
                                            </p>
                                        </div>
                                    </li>
                                    <li className="downloadHubStep">
                                        <div className="downloadHubStep__number">3</div>
                                        <div className="downloadHubStep__content">
                                            <strong>Install and launch</strong>
                                            <p>Run the installer and open the app from your {activeOS === 'windows' ? 'Start menu' : activeOS === 'macos' ? 'Applications folder' : 'application launcher'}.</p>
                                        </div>
                                    </li>
                                    <li className="downloadHubStep">
                                        <div className="downloadHubStep__number">4</div>
                                        <div className="downloadHubStep__content">
                                            <strong>Get started</strong>
                                            <p>Follow the in-app tutorial or check our <a href="/docs" onClick={(e) => { e.preventDefault(); navigate('/docs') }}>documentation</a></p>
                                        </div>
                                    </li>
                                </ol>
                            </article>

                            <article className="downloadHubCard">
                                <div className="downloadHubCard__kicker">Hosting</div>
                                <div className="downloadHubCard__title">What the desktop app expects</div>
                                <div className="downloadHubCard__meta">
                                    <div className="downloadHubRow">
                                        <div className="downloadHubRow__label">Manifest</div>
                                        <div className="downloadHubRow__value downloadHubRow__value--mono">
                                            {updateBaseUrl ? `${String(updateBaseUrl).replace(/\/+$/, '')}/{os}/latest.json` : '{BRAINTRAIN_UPDATE_BASE_URL}/{os}/latest.json'}
                                        </div>
                                    </div>
                                    <div className="downloadHubRow">
                                        <div className="downloadHubRow__label">Windows</div>
                                        <div className="downloadHubRow__value downloadHubRow__value--mono">/windows/latest.json</div>
                                    </div>
                                    <div className="downloadHubRow">
                                        <div className="downloadHubRow__label">Linux</div>
                                        <div className="downloadHubRow__value downloadHubRow__value--mono">/linux/latest.json</div>
                                    </div>
                                    <div className="downloadHubRow">
                                        <div className="downloadHubRow__label">Runtime env</div>
                                        <div className="downloadHubRow__value downloadHubRow__value--mono">BRAINTRAIN_UPDATE_BASE_URL (required)</div>
                                    </div>
                                    <div className="downloadHubRow">
                                        <div className="downloadHubRow__label">Optional</div>
                                        <div className="downloadHubRow__value downloadHubRow__value--mono">BRAINTRAIN_UPDATE_CHANNEL=stable|beta</div>
                                    </div>
                                </div>
                            </article>

                            <article className="downloadHubCard downloadHubCard--cta">
                                <div className="downloadHubCard__ctaContent">
                                    <div className="downloadHubCard__kicker">Enterprise & Air-Gapped Deployments</div>
                                    <div className="downloadHubCard__title">Need offline licensing or air-gapped installs?</div>
                                    <div className="downloadHubCard__meta">
                                        ML FORGE supports offline licensing, air-gapped installations, and regulated environment deployments.
                                        Perfect for healthcare, manufacturing, and government use cases.
                                    </div>
                                    <div className="downloadHubCard__ctaActions">
                                        <a
                                            className="button button--primary"
                                            href="/pricing"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                navigate('/pricing')
                                            }}
                                        >
                                            See pricing
                                        </a>
                                        <a
                                            className="button button--outline"
                                            href="/request-access"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                navigate('/request-access')
                                            }}
                                        >
                                            Request access
                                        </a>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default DownloadHubPage
