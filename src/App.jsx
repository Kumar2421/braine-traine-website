import { useCallback, useEffect, useState } from 'react'
import './App.css'
import DocsPage from './DocsPage'
import AgenticPage from './AgenticPage'
import AboutPage from './AboutPage'
import DownloadPage from './DownloadPage'
import LoginPage from './LoginPage'
import SignupPage from './SignupPage'
import DashboardPage from './DashboardPage'
import DownloadHubPage from './DownloadHubPage'
import PricingPage from './PricingPage'
import WhyPage from './WhyPage'
import LicensePage from './LicensePage'
import SecurityPage from './SecurityPage'
import AuthRedirectPage from './AuthRedirectPage'
import RequestAccessPage from './RequestAccessPage'
import { SEO } from './components/SEO.jsx'

import { supabase } from './supabaseClient'

function App() {
  const [path, setPath] = useState(() => window.location.pathname || '/')
  const [session, setSession] = useState(null)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data?.session || null)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession || null)
    })

    return () => {
      mounted = false
      subscription?.subscription?.unsubscribe?.()
    }
  }, [])

  const navigate = useCallback((nextPath) => {
    const currentPath = window.location.pathname || '/'
    const nextPathname = (nextPath || '/').split('?')[0]
    if (nextPathname === currentPath) return
    window.history.pushState({}, '', nextPath)
    setPath(window.location.pathname || '/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const isHome = path === '/'
  const isDocs = path === '/docs' || path.startsWith('/docs/')
  const isAgentic = path === '/agentic-ai'
  const isAbout = path === '/about'
  const isDownload = path === '/download'
  const isDownloads = path === '/downloads'
  const isLogin = path === '/login'
  const isSignup = path === '/signup'
  const isDashboard = path === '/dashboard'
  const isDashboardLicense = path === '/dashboard/license'
  const isPricing = path === '/pricing'
  const isWhy = path === '/why'
  const isLogout = path === '/logout'
  const isSecurity = path === '/security'
  const isAuthRedirect = path === '/auth-redirect'
  const isRequestAccess = path === '/request-access'

  const authed = !!session
  const needsAuth = isDashboard || isDashboardLicense || isDownload

  useEffect(() => {
    if (isDownloads) {
      navigate('/download')
      return
    }

    if (!authed && needsAuth) {
      navigate(`/login?next=${encodeURIComponent(path)}`)
    }
  }, [authed, needsAuth, isDownloads, path, navigate])

  useEffect(() => {
    if (!isLogout) return

    supabase.auth
      .signOut()
      .catch(() => { })
      .finally(() => {
        navigate('/')
      })
  }, [isLogout, navigate])

  useEffect(() => {
    if (!authed || !isLogin) return
    const isIdeDeepLink = new URLSearchParams(window.location.search || '').get('source') === 'ide'
    if (isIdeDeepLink) return
    const isIdeHandshake = new URLSearchParams(window.location.search || '').get('ide') === '1'
    if (isIdeHandshake) return
    const next = new URLSearchParams(window.location.search || '').get('next')
    navigate(next || '/dashboard')
  }, [authed, isLogin, navigate])

  const footer = (
    <footer className="footer" id="company">
      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo" aria-hidden="true" />
            <div>
              <div className="footer__name">BrainTrain</div>
              <div className="footer__tag">BrainTrain — Desktop-first Vision AI training studio.</div>
            </div>
          </div>
          <div className="footer__cols">
            <div className="footer__col">
              <div className="footer__heading">Product</div>
              <a className="footer__link" href="#">Product</a>
              <a className="footer__link" href="#">Workflow</a>
              <a className="footer__link" href="#">Inside the IDE</a>
            </div>
            <div className="footer__col">
              <div className="footer__heading">Resources</div>
              <a className="footer__link" href="#">Docs</a>
              <a className="footer__link" href="#">GitHub</a>
              <a className="footer__link" href="#">License</a>
            </div>
            <div className="footer__col">
              <div className="footer__heading">Links</div>
              <a className="footer__link" href="#">Product</a>
              <a className="footer__link" href="#">Docs</a>
              <a className="footer__link" href="#">License</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__legal">© {new Date().getFullYear()} BrainTrain. All rights reserved.</div>
          <div className="footer__bottomLinks">
            <a className="footer__link" href="#">Privacy</a>
            <a className="footer__link" href="#">Terms</a>
            <a className="footer__link" href="#">Security</a>
          </div>
        </div>
      </div>
    </footer>
  )

  // SEO metadata based on current page
  useEffect(() => {
    if (isHome) {
      document.title = 'BrainTrain — Desktop-first Vision AI training studio'
    } else if (isDocs) {
      document.title = 'Documentation | BrainTrain'
    } else if (isDashboard) {
      document.title = 'Dashboard | BrainTrain'
    } else if (isPricing) {
      document.title = 'Pricing | BrainTrain'
    } else if (isDownload) {
      document.title = 'Download | BrainTrain'
    }
  }, [isHome, isDocs, isDashboard, isPricing, isDownload])

  return (
    <div className="page">
      <SEO
        title={
          isHome
            ? undefined
            : isDocs
              ? 'Documentation'
              : isDashboard
                ? 'Dashboard'
                : isPricing
                  ? 'Pricing'
                  : isDownload
                    ? 'Download'
                    : undefined
        }
        description={
          isHome
            ? 'Build, train, and ship Vision AI — locally, reproducibly, without cloud lock-in. Desktop-first Vision AI IDE for datasets, annotation, training, evaluation, and export.'
            : undefined
        }
        path={path}
      />
      {!isLogin && !isSignup && (
        <header className={`topbar topbar--phase1 ${isAgentic ? 'topbar--agentic' : ''}`}>
          <div className="container topbar__inner">
            <a
              className="brand"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
            >
              <span className="brand__mark" aria-hidden="true" />
              <span className="brand__text">BrainTrain</span>
            </a>

            <nav className="nav" aria-label="Primary">
              {isAgentic ? (
                <>
                  <a
                    className={`nav__link ${isWhy ? 'nav__link--active' : ''}`}
                    href="/why"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/why')
                    }}
                  >
                    Why BrainTrain
                  </a>
                  <a
                    className={`nav__link ${isAgentic ? 'nav__link--active' : ''}`}
                    href="/agentic-ai"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/agentic-ai')
                    }}
                  >
                    Workflow
                  </a>
                  <a
                    className={`nav__link ${isDocs ? 'nav__link--active' : ''}`}
                    href="/docs"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/docs')
                    }}
                  >
                    Docs
                  </a>
                  <a
                    className={`nav__link ${isPricing ? 'nav__link--active' : ''}`}
                    href="/pricing"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/pricing')
                    }}
                  >
                    Pricing
                  </a>
                  <a
                    className={`nav__link ${isAbout ? 'nav__link--active' : ''}`}
                    href="/about"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/about')
                    }}
                  >
                    About
                  </a>
                </>
              ) : (
                <>
                  <a
                    className={`nav__link ${isHome ? 'nav__link--active' : ''}`}
                    href="/"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/')
                    }}
                  >
                    Product
                  </a>

                  <a
                    className={`nav__link ${isDocs ? 'nav__link--active' : ''}`}
                    href="/docs"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/docs')
                    }}
                  >
                    Docs
                  </a>

                  <a
                    className={`nav__link ${isAgentic ? 'nav__link--active' : ''}`}
                    href="/agentic-ai"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/agentic-ai')
                    }}
                  >
                    Workflow
                  </a>

                  <a
                    className={`nav__link ${isPricing ? 'nav__link--active' : ''}`}
                    href="/pricing"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/pricing')
                    }}
                  >
                    Pricing
                  </a>

                  <a
                    className={`nav__link ${isWhy ? 'nav__link--active' : ''}`}
                    href="/why"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/why')
                    }}
                  >
                    Why BrainTrain
                  </a>
                </>
              )}
            </nav>

            <div className="topbar__actions">
              <button
                className={`iconButton ${isAgentic ? 'iconButton--agentic' : ''}`}
                type="button"
                aria-label="Change language"
              >
                <span aria-hidden="true">◎</span>
              </button>
              {session ? (
                <a
                  className={`button ${isAgentic ? 'button--agenticPill' : 'button--ghost'}`}
                  href="/dashboard"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/dashboard')
                  }}
                >
                  Account
                </a>
              ) : (
                <a
                  className={`button ${isAgentic ? 'button--agenticPill' : 'button--ghost'}`}
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/login')
                  }}
                >
                  Log In
                </a>
              )}
              <a
                className={`button ${isAgentic ? 'button--agenticPill' : 'button--primary'}`}
                href={isAgentic ? '#' : '/download'}
                onClick={(e) => {
                  if (!isAgentic) {
                    e.preventDefault()
                    navigate('/download')
                  } else {
                    e.preventDefault()
                  }
                }}
              >
                Try DataRobot
              </a>
              {isAgentic && (
                <a
                  className="button button--agenticSolid"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                  }}
                >
                  Request a Demo
                </a>
              )}
            </div>
          </div>
        </header>
      )}

      <main>
        {isHome ? (
          <>
            <section className="hero">
              <div className="container hero__inner">
                <div className="hero__copy">
                  <h1 className="hero__title">
                    Build, train, and ship Vision AI — locally, reproducibly, without cloud lock-in.
                  </h1>
                  <p className="hero__subtitle">
                    BrainTrain is a desktop-first Vision AI IDE for datasets, annotation, training, evaluation, and export — designed for
                    deterministic workflows in real-world environments.
                  </p>
                  <div className="hero__cta">
                    <a 
                      className="button button--primary" 
                      href="/download"
                      onClick={(e) => {
                        e.preventDefault()
                        navigate('/download')
                      }}
                    >
                      Download BrainTrain
                    </a>
                    <a 
                      className="button button--outline" 
                      href="/agentic-ai"
                      onClick={(e) => {
                        e.preventDefault()
                        navigate('/agentic-ai')
                      }}
                    >
                      View Workflow
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <div className="heroBand" aria-hidden="true">
              <div className="heroBand__viewport">
                <div className="heroBand__track" />
              </div>
            </div>

            <section className="unify unify--dark">
              <div className="container">
                <h2 className="unifyHeading">
                  Designed for real-world <span className="unifyHeading__muted">Vision AI</span>
                  <br />
                  workflows
                </h2>

                <div className="unifyGrid">
                  <article className="unifyCard">
                    <div className="unifyCard__kicker">Dataset Management</div>
                    <p className="unifyCard__body">
                      Versioned datasets with explicit metadata.
                      No silent changes. No hidden preprocessing.
                    </p>
                  </article>

                  <article className="unifyCard">
                    <div className="unifyCard__kicker">Annotation Studio</div>
                    <p className="unifyCard__body">
                      Reviewable labeling with audit-ready change history.
                      Built for iteration, not one-off labeling.
                    </p>
                    <div className="unifyPartner">
                      <div className="unifyPartner__logo" aria-hidden="true">SAP</div>
                      <div className="unifyPartner__meta">
                        <div className="unifyPartner__kicker">Review-gated changes</div>
                        <div className="unifyPartner__body">Audit-ready labeling history for regulated workflows.</div>
                      </div>
                    </div>
                  </article>

                  <article className="unifyCard">
                    <div className="unifyCard__kicker">Deterministic Training</div>
                    <p className="unifyCard__body">
                      Explicit configs, locked inputs, and reproducible runs — every time.
                    </p>
                  </article>

                  <article className="unifyCard">
                    <div className="unifyCard__kicker">Evaluation &amp; Benchmarks</div>
                    <p className="unifyCard__body">
                      Compare runs, metrics, and artifacts with full provenance.
                    </p>
                    <div className="unifyPartner unifyPartner--inline">
                      <div className="unifyPartner__logo" aria-hidden="true">NVIDIA</div>
                      <div className="unifyPartner__meta">
                        <div className="unifyPartner__kicker">Provenance by default</div>
                        <div className="unifyPartner__body">Artifacts stay tied to configs, data, and metrics.</div>
                      </div>
                    </div>
                  </article>

                  <article className="unifyCard">
                    <div className="unifyCard__kicker">Local-First Execution</div>
                    <p className="unifyCard__body">
                      Runs fully offline. GPU optional. No cloud dependency.
                    </p>
                  </article>

                  <article className="unifyCard">
                    <div className="unifyCard__kicker">Production-Ready Exports</div>
                    <p className="unifyCard__body">
                      Export models, configs, and metrics together — ready for deployment.
                    </p>
                  </article>
                </div>
              </div>
            </section>
          </>
        ) : isDocs ? (
          <DocsPage />
        ) : isLogin ? (
          <LoginPage />
        ) : isSignup ? (
          <SignupPage />
        ) : isLogout ? (
          <></>
        ) : isDownload ? (
          <DownloadHubPage navigate={navigate} />
        ) : isDashboard ? (
          <DashboardPage session={session} navigate={navigate} />
        ) : isPricing ? (
          <PricingPage navigate={navigate} />
        ) : isWhy ? (
          <WhyPage />
        ) : isSecurity ? (
          <SecurityPage />
        ) : isAuthRedirect ? (
          <AuthRedirectPage navigate={navigate} />
        ) : isRequestAccess ? (
          <RequestAccessPage session={session} navigate={navigate} />
        ) : isDashboardLicense ? (
          <LicensePage session={session} navigate={navigate} />
        ) : isDownloads ? (
          <DownloadPage />
        ) : isAbout ? (
          <AboutPage />
        ) : isAgentic ? (
          <AgenticPage navigate={navigate} />
        ) : (
          <></>
        )}

        {isHome && (
          <>
            <section className="features" id="platform">
              <div className="container">
                <div className="platformHero">
                  <h2 className="platformHero__title">
                    One IDE. <span className="platformHero__titleMuted">For every Vision AI team.</span>
                  </h2>
                  <p className="platformHero__subtitle">Built for datasets → annotation → training → evaluation → export.</p>
                </div>

                <div className="platformStack">
                  <section className="platformPanel platformPanel--build">
                    <div className="platformPanel__inner">
                      <div className="platformCopy">
                        <h3 className="platformCopy__title">
                          Teams that <span className="platformCopy__titleAccent">build</span> datasets
                        </h3>
                        <div className="platformCopy__lede">Import, curate, and version image &amp; video datasets.</div>
                        <ul className="platformBullets">
                          <li className="platformBullets__item">
                            Import, curate, and version image &amp; video datasets.
                          </li>
                          <li className="platformBullets__item">
                            Explicit metadata and dataset snapshots.
                          </li>
                          <li className="platformBullets__item">
                            No accidental data drift.
                          </li>
                        </ul>
                      </div>

                      <div className="platformVisual" aria-hidden="true">
                        <div className="platformWindow">
                          <div className="platformWindow__top">
                            <span className="platformWindow__dot platformWindow__dot--red" />
                            <span className="platformWindow__dot platformWindow__dot--yellow" />
                            <span className="platformWindow__dot platformWindow__dot--green" />
                          </div>
                          <div className="platformWindow__body">
                            <div className="platformChart">
                              <div className="platformChart__grid" />
                              <div className="platformChart__line" />
                              <div className="platformChart__points" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="platformPanel platformPanel--train">
                    <div className="platformPanel__inner">
                      <div className="platformCopy">
                        <h3 className="platformCopy__title">
                          Teams that <span className="platformCopy__titleAccent">train</span> models
                        </h3>
                        <div className="platformCopy__lede">Reproducible YOLO and CV pipelines.</div>
                        <ul className="platformBullets">
                          <li className="platformBullets__item">Track configs, metrics, and artifacts together.</li>
                          <li className="platformBullets__item">Deterministic runs across machines.</li>
                          <li className="platformBullets__item">Explicit inputs and repeatable evaluation.</li>
                        </ul>
                      </div>

                      <div className="platformVisual" aria-hidden="true">
                        <div className="platformWindow">
                          <div className="platformWindow__top">
                            <span className="platformWindow__dot platformWindow__dot--red" />
                            <span className="platformWindow__dot platformWindow__dot--yellow" />
                            <span className="platformWindow__dot platformWindow__dot--green" />
                          </div>
                          <div className="platformWindow__body">
                            <div className="platformChart platformChart--bars">
                              <div className="platformChart__grid" />
                              <div className="platformChart__bars" />
                              <div className="platformChart__points" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="platformPanel platformPanel--logs">
                    <div className="platformPanel__inner">
                      <div className="platformCopy">
                        <h3 className="platformCopy__title">
                          Teams that <span className="platformCopy__titleAccent">ship</span> Vision AI
                        </h3>
                        <div className="platformCopy__lede">Export models with full lineage.</div>
                        <ul className="platformBullets">
                          <li className="platformBullets__item">Export models with full lineage.</li>
                          <li className="platformBullets__item">Audit-ready artifacts for regulated environments.</li>
                          <li className="platformBullets__item">Designed for edge and on-prem deployment.</li>
                        </ul>
                      </div>

                      <div className="platformVisual" aria-hidden="true">
                        <div className="platformWindow">
                          <div className="platformWindow__top">
                            <span className="platformWindow__dot platformWindow__dot--red" />
                            <span className="platformWindow__dot platformWindow__dot--yellow" />
                            <span className="platformWindow__dot platformWindow__dot--green" />
                          </div>
                          <div className="platformWindow__body">
                            <div className="platformChart platformChart--terminal">
                              <div className="platformChart__grid" />
                              <div className="platformChart__terminal" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </section>

            <section className="recognition">
              <div className="container">
                <h2 className="recognition__title">
                  Built for teams who <span className="recognition__muted">cannot afford</span>
                  <br />
                  <span className="recognition__muted">silent failures</span>
                </h2>

                <div className="recognitionGrid">
                  <article className="recognitionCard">
                    <div className="recognitionCard__title">
                      Manufacturing quality inspection teams
                    </div>
                    <div className="recognitionCard__brand">Manufacturing</div>
                    <div className="recognitionCard__bar" aria-hidden="true" />
                  </article>

                  <article className="recognitionCard">
                    <div className="recognitionCard__title">
                      Robotics &amp; autonomous systems labs
                    </div>
                    <div className="recognitionCard__brand">Robotics</div>
                    <div className="recognitionCard__bar" aria-hidden="true" />
                  </article>

                  <article className="recognitionCard">
                    <div className="recognitionCard__title">
                      Smart surveillance &amp; security deployments
                    </div>
                    <div className="recognitionCard__brand">Security</div>
                    <div className="recognitionCard__bar" aria-hidden="true" />
                  </article>

                  <article className="recognitionCard">
                    <div className="recognitionCard__title">Medical imaging (offline / on-prem)</div>
                    <div className="recognitionCard__brand">Healthcare</div>
                    <div className="recognitionCard__bar" aria-hidden="true" />
                  </article>
                </div>
              </div>
            </section>

            <section className="ctaBand ctaBand--agentic">
              <div className="container ctaBand__inner ctaBand__inner--agentic">
                <h2 className="ctaBand__title ctaBand__title--agentic">Vision AI is hard. Reproducibility is harder.</h2>
                <div className="ctaBand__row">
                  <p className="ctaBand__subtitle ctaBand__subtitle--agentic">
                    BrainTrain exists because scripts, notebooks, and ad-hoc tools break down in real production workflows.
                  </p>
                  <a 
                    className="ctaBand__button" 
                    href="/download"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/download')
                    }}
                  >
                    Download BrainTrain
                  </a>
                </div>
              </div>
            </section>
          </>
        )}

        {!isLogin && !isSignup && !isHome && footer}

        {isHome && !isLogin && !isSignup && footer}
      </main>
    </div>
  )
}

export default App
