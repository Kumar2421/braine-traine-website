import { useState } from 'react'
import './App.css'

function DownloadHubPage({ navigate }) {
    const [activeOS, setActiveOS] = useState('windows')

    const osData = {
        windows: {
            name: 'Windows',
            icon: '🪟',
            version: '0.1.0',
            file: 'ML FORGE-Setup-0.1.0.exe',
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
            version: 'Coming Soon',
            file: 'ML FORGE-Setup-0.1.0.AppImage',
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

    return (
        <>
            <section className="downloadHero">
                <div className="container downloadHero__inner">
                    <p className="downloadHero__kicker">Download</p>
                    <div className="downloadHero__titleWrapper">
                        <h1 className="downloadHero__title">Download ML FORGE</h1>
                        <div className="downloadHero__badge">
                            <span className="downloadHero__badgeText">Coming Soon</span>
                        </div>
                    </div>
                    <p className="downloadHero__subtitle">
                        Local-first installers. Offline capable. No dataset uploads. Your data stays with you.
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
                            <span className="downloadTab__icon">🪟</span>
                            Windows
                        </button>
                        <button 
                            className={`downloadTab ${activeOS === 'macos' ? 'downloadTab--active' : ''}`}
                            type="button" 
                            role="tab" 
                            aria-selected={activeOS === 'macos'}
                            onClick={() => setActiveOS('macos')}
                        >
                            <span className="downloadTab__icon">🍎</span>
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
                            <span className="downloadTab__icon">🐧</span>
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
                                        <span className="downloadHubCard__versionValue">{currentOS.version}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="downloadHubCard__actions">
                                <a 
                                    className={`button button--primary button--large ${activeOS !== 'windows' ? 'button--disabled' : ''}`} 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (activeOS === 'windows') {
                                            // Download logic here when available
                                        }
                                    }}
                                    style={activeOS !== 'windows' ? { pointerEvents: 'none', opacity: 0.6 } : {}}
                                >
                                    <span className="button__icon">⬇</span>
                                    Download for {currentOS.name}
                                </a>
                                <p className="downloadHubCard__note">{currentOS.file} (Coming Soon)</p>
                            </div>
                            <div className="downloadHubCard__body">
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
                                    <div className="downloadHubRow">
                                        <div className="downloadHubRow__label">SHA256 Checksum</div>
                                        <div className="downloadHubRow__value downloadHubRow__value--mono">
                                            (Available upon release)
                                        </div>
                                    </div>
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
                                        <div className="downloadHubRelease__version">0.1.0</div>
                                        <div className="downloadHubRelease__date">Coming Soon</div>
                                    </div>
                                    <div className="downloadHubRelease__body">
                                        <p>Initial public release of ML FORGE IDE</p>
                                        <ul>
                                            <li>Complete Vision AI workflow pipeline</li>
                                            <li>Dataset Manager with versioning</li>
                                            <li>Annotation Studio with review workflows</li>
                                            <li>Training engine with reproducible configs</li>
                                            <li>Export wizard for deployment</li>
                                        </ul>
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
                                            <p>Click the download button above to get {currentOS.file}</p>
                                        </div>
                                    </li>
                                    <li className="downloadHubStep">
                                        <div className="downloadHubStep__number">2</div>
                                        <div className="downloadHubStep__content">
                                            <strong>Run the installer</strong>
                                            <p>Double-click the downloaded file and follow the installation wizard</p>
                                        </div>
                                    </li>
                                    <li className="downloadHubStep">
                                        <div className="downloadHubStep__number">3</div>
                                        <div className="downloadHubStep__content">
                                            <strong>Launch ML FORGE</strong>
                                            <p>Open ML FORGE IDE from your {activeOS === 'windows' ? 'Start menu' : activeOS === 'macos' ? 'Applications folder' : 'application launcher'} or desktop shortcut</p>
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
                                            View Pricing Plans
                                        </a>
                                        <a
                                            className="button button--outline"
                                            href="/request-access"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                navigate('/request-access')
                                            }}
                                        >
                                            Request Enterprise Access
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
