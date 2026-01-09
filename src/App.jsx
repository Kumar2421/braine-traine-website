import { useCallback, useEffect, useState, lazy, Suspense } from 'react'
import './App.css'
import { SEO } from './components/SEO.jsx'
import { isAdmin } from './utils/adminAuth'
import { LoadingSpinner } from './components/LoadingSpinner'
import { supabase } from './supabaseClient'

// Lazy load pages for code splitting and performance
const DocsPage = lazy(() => import('./DocsPage'))
const GuidedWorkflowAutomationPage = lazy(() => import('./GuidedWorkflowAutomationPage'))
const GuaranteesBoundariesPage = lazy(() => import('./GuaranteesBoundariesPage'))
const TestimonialsPage = lazy(() => import('./TestimonialsPage'))
const YoloWorkflowPage = lazy(() => import('./YoloWorkflowPage'))
const AboutPage = lazy(() => import('./AboutPage'))
const DownloadPage = lazy(() => import('./DownloadPage'))
const LoginPage = lazy(() => import('./LoginPage'))
const SignupPage = lazy(() => import('./SignupPage'))
const ForgotPasswordPage = lazy(() => import('./ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./ResetPasswordPage'))
const TermsPage = lazy(() => import('./TermsPage'))
const PrivacyPage = lazy(() => import('./PrivacyPage'))
const DashboardPage = lazy(() => import('./DashboardPage'))
const DownloadHubPage = lazy(() => import('./DownloadHubPage'))
const PricingPage = lazy(() => import('./PricingPage'))
const WhyPage = lazy(() => import('./WhyPage'))
const LicensePage = lazy(() => import('./LicensePage'))
const SecurityPage = lazy(() => import('./SecurityPage'))
const AuthRedirectPage = lazy(() => import('./AuthRedirectPage'))
const RequestAccessPage = lazy(() => import('./RequestAccessPage'))
const AdminPage = lazy(() => import('./AdminPage'))
const SubscriptionPage = lazy(() => import('./SubscriptionPage'))
const CheckoutPage = lazy(() => import('./CheckoutPage'))
const TeamManagement = lazy(() => import('./components/TeamManagement').then(m => ({ default: m.TeamManagement })))

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
    const nextPathname = (nextPath || '/').split('?')[0].split('#')[0]
    const nextHash = (nextPath || '').includes('#') ? `#${(nextPath || '').split('#')[1]}` : ''
    const currentHash = window.location.hash || ''
    if (nextPathname === currentPath && nextHash === currentHash) return
    window.history.pushState({}, '', nextPath)
    setPath(window.location.pathname || '/')

    if (!nextHash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const targetId = nextHash.replace('#', '')
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const el = document.getElementById(targetId)
        if (!el) return
        const y = el.getBoundingClientRect().top + window.scrollY - 92
        window.scrollTo({ top: y, behavior: 'smooth' })
      })
    })
  }, [])

  const isHome = path === '/'
  const isDocs = path === '/docs' || path.startsWith('/docs/')
  const isWorkflowAutomation = path === '/workflow-automation'
  const isGuarantees = path === '/guarantees'
  const isTestimonials = path === '/testimonials'
  const isYoloUseCase = path === '/use-cases/yolo'
  const isAbout = path === '/about'
  const isDownload = path === '/download'
  const isDownloads = path === '/downloads'
  const isLogin = path === '/login'
  const isSignup = path === '/signup'
  const isForgotPassword = path === '/forgot-password'
  const isResetPassword = path === '/reset-password'
  const isTerms = path === '/terms'
  const isPrivacy = path === '/privacy'
  const isDashboard = path === '/dashboard'
  const isDashboardLicense = path === '/dashboard/license'
  const isPricing = path === '/pricing'
  const isWhy = path === '/why'
  const isLogout = path === '/logout'
  const isSecurity = path === '/security'
  const isAuthRedirect = path === '/auth-redirect'
  const isRequestAccess = path === '/request-access'
  const isAdminPath = path === '/admin'
  const isSubscription = path === '/subscription' || path === '/dashboard/subscription'
  const isCheckout = path === '/checkout'
  const isTeams = path === '/teams' || path === '/dashboard/teams'
  const isHelpCenter = path === '/help' || path === '/help-center' || path === '/faq'

  const authed = !!session
  const needsAuth = isDashboard || isDashboardLicense || isSubscription || isCheckout

  useEffect(() => {
    if (isDownloads) {
      navigate('/download')
      return
    }

    if (path === '/agentic-ai') {
      navigate('/workflow-automation')
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

    // Check if user is admin and redirect accordingly
    const checkAdminAndRedirect = async () => {
      const admin = await isAdmin()
      if (admin && !next) {
        navigate('/admin')
      } else {
        navigate(next || '/dashboard')
      }
    }

    checkAdminAndRedirect()
  }, [authed, isLogin, navigate])

  const footer = (
    <footer className="footer" id="company">
      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo" aria-hidden="true" />
            <div>
              <div className="footer__name">ML FORGE</div>
              <div className="footer__tag">Desktop-first Vision AI training studio for reproducible workflows.</div>
            </div>
          </div>
          <div className="footer__cols">
            <div className="footer__col">
              <div className="footer__heading">Product</div>
              <a
                className="footer__link"
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/')
                }}
              >
                Overview
              </a>
              <a
                className="footer__link"
                href="/workflow-automation"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/workflow-automation')
                }}
              >
                Workflow
              </a>
              <a
                className="footer__link"
                href="/use-cases/yolo"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/use-cases/yolo')
                }}
              >
                Use Cases
              </a>
              <a
                className="footer__link"
                href="/why"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/why')
                }}
              >
                Why ML FORGE
              </a>
              <a
                className="footer__link"
                href="/pricing"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/pricing')
                }}
              >
                Pricing
              </a>
            </div>
            <div className="footer__col">
              <div className="footer__heading">Resources</div>
              <a
                className="footer__link"
                href="/docs"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/docs')
                }}
              >
                Documentation
              </a>
              <a
                className="footer__link"
                href="/testimonials"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/testimonials')
                }}
              >
                Testimonials
              </a>
              <a
                className="footer__link"
                href="/download"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/download')
                }}
              >
                Download
              </a>
              <a
                className="footer__link"
                href="/about"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/about')
                }}
              >
                About
              </a>
              <a
                className="footer__link"
                href="/dashboard/license"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/dashboard/license')
                }}
              >
                License
              </a>
            </div>
            <div className="footer__col">
              <div className="footer__heading">Company</div>
              <a
                className="footer__link"
                href="/security"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/security')
                }}
              >
                Security
              </a>
              <a
                className="footer__link"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                }}
              >
                Privacy Policy
              </a>
              <a
                className="footer__link"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                }}
              >
                Terms of Service
              </a>
              <a
                className="footer__link"
                href="/request-access"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/request-access')
                }}
              >
                Request Access
              </a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__legal">© {new Date().getFullYear()} ML FORGE. All rights reserved.</div>
          <div className="footer__bottomLinks">
            <a
              className="footer__link"
              href="#"
              onClick={(e) => {
                e.preventDefault()
              }}
            >
              Privacy
            </a>
            <a
              className="footer__link"
              href="#"
              onClick={(e) => {
                e.preventDefault()
              }}
            >
              Terms
            </a>
            <a
              className="footer__link"
              href="/security"
              onClick={(e) => {
                e.preventDefault()
                navigate('/security')
              }}
            >
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  )

  // SEO metadata based on current page
  useEffect(() => {
    if (isHome) {
      document.title = 'ML FORGE — Desktop-first Vision AI training studio'
    } else if (isDocs) {
      document.title = 'Documentation | ML FORGE'
    } else if (isWorkflowAutomation) {
      document.title = 'Guided Workflow Automation | ML FORGE'
    } else if (isGuarantees) {
      document.title = 'Guarantees & Boundaries | ML FORGE'
    } else if (isTestimonials) {
      document.title = 'Testimonials | ML FORGE'
    } else if (isYoloUseCase) {
      document.title = 'End-to-end YOLO workflow | ML FORGE'
    } else if (isDashboard) {
      document.title = 'Dashboard | ML FORGE'
    } else if (isPricing) {
      document.title = 'Pricing | ML FORGE'
    } else if (isDownload) {
      document.title = 'Download | ML FORGE'
    }
  }, [isHome, isDocs, isWorkflowAutomation, isGuarantees, isTestimonials, isYoloUseCase, isDashboard, isPricing, isDownload])

  // Handle mobile nav closing on window resize and outside clicks
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 980) {
        const nav = document.querySelector('.nav')
        const toggle = document.querySelector('.navToggle')
        if (nav && toggle) {
          nav.classList.remove('nav--open')
          toggle.setAttribute('aria-expanded', 'false')
        }
      }
    }

    const handleClickOutside = (e) => {
      const nav = document.querySelector('.nav')
      const toggle = document.querySelector('.navToggle')
      const topbar = document.querySelector('.topbar')

      if (nav && toggle && topbar && window.innerWidth < 980) {
        const isClickInsideNav = nav.contains(e.target)
        const isClickOnToggle = toggle.contains(e.target)
        const isClickInsideTopbar = topbar.contains(e.target)

        if (!isClickInsideNav && !isClickOnToggle && isClickInsideTopbar) {
          nav.classList.remove('nav--open')
          toggle.setAttribute('aria-expanded', 'false')
        }
      }
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('click', handleClickOutside)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

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
      {!isLogin && !isSignup && !isCheckout && (
        <header className="topbar topbar--phase1">
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
              <span className="brand__text">ML FORGE</span>
            </a>

            <button
              className="navToggle"
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded="false"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const topbar = e.currentTarget.closest('.topbar')
                const nav = topbar?.querySelector('.nav')
                const button = e.currentTarget
                const isExpanded = button.getAttribute('aria-expanded') === 'true'

                if (nav) {
                  if (isExpanded) {
                    nav.classList.remove('nav--open')
                    button.setAttribute('aria-expanded', 'false')
                  } else {
                    nav.classList.add('nav--open')
                    button.setAttribute('aria-expanded', 'true')
                  }
                }
              }}
            >
              <span className="navToggle__icon" aria-hidden="true">☰</span>
            </button>

            <nav className="nav" aria-label="Primary">
              {isHome ? (
                <>
                  <a
                    className={`nav__link ${isHome ? 'nav__link--active' : ''}`}
                    href="/"
                    onClick={(e) => {
                      e.preventDefault()
                      // Close mobile nav when link is clicked
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/')
                    }}
                  >
                    Product
                  </a>
                  <a
                    className={`nav__link ${isYoloUseCase ? 'nav__link--active' : ''}`}
                    href="/use-cases/yolo"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/use-cases/yolo')
                    }}
                  >
                    YOLO Use Case
                  </a>
                  <a
                    className={`nav__link ${isWorkflowAutomation ? 'nav__link--active' : ''}`}
                    href="/workflow-automation"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/workflow-automation')
                    }}
                  >
                    Workflow
                  </a>
                  <a
                    className={`nav__link ${isGuarantees ? 'nav__link--active' : ''}`}
                    href="/guarantees"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/guarantees')
                    }}
                  >
                    Guarantees
                  </a>
                  <a
                    className={`nav__link ${isTestimonials ? 'nav__link--active' : ''}`}
                    href="/testimonials"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/testimonials')
                    }}
                  >
                    Testimonials
                  </a>
                  <a
                    className={`nav__link ${isDocs ? 'nav__link--active' : ''}`}
                    href="/docs"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/docs')
                    }}
                  >
                    Docs
                  </a>
                  <a
                    className={`nav__link ${isWhy ? 'nav__link--active' : ''}`}
                    href="/why"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/why')
                    }}
                  >
                    Why ML FORGE
                  </a>
                  <a
                    className={`nav__link ${isPricing ? 'nav__link--active' : ''}`}
                    href="/pricing"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
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
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
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
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/')
                    }}
                  >
                    Home
                  </a>
                  <a
                    className={`nav__link ${isYoloUseCase ? 'nav__link--active' : ''}`}
                    href="/use-cases/yolo"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/use-cases/yolo')
                    }}
                  >
                    Use Cases
                  </a>
                  <a
                    className={`nav__link ${isWorkflowAutomation ? 'nav__link--active' : ''}`}
                    href="/workflow-automation"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/workflow-automation')
                    }}
                  >
                    Workflow
                  </a>
                  <a
                    className={`nav__link ${isGuarantees ? 'nav__link--active' : ''}`}
                    href="/guarantees"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/guarantees')
                    }}
                  >
                    Guarantees
                  </a>
                  <a
                    className={`nav__link ${isTestimonials ? 'nav__link--active' : ''}`}
                    href="/testimonials"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/testimonials')
                    }}
                  >
                    Testimonials
                  </a>
                  <a
                    className={`nav__link ${isDocs ? 'nav__link--active' : ''}`}
                    href="/docs"
                    onClick={(e) => {
                      e.preventDefault()
                      const nav = e.currentTarget.closest('.nav')
                      const toggle = document.querySelector('.navToggle')
                      if (nav && toggle) {
                        nav.classList.remove('nav--open')
                        toggle.setAttribute('aria-expanded', 'false')
                      }
                      navigate('/docs')
                    }}
                  >
                    Docs
                  </a>
                </>
              )}
            </nav>

            <div className="topbar__actions">
              {session ? (
                <a
                  className="button button--ghost"
                  href="/dashboard"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/dashboard')
                  }}
                  aria-label="Account"
                >
                  <span className="button__icon" aria-hidden="true">👤</span>
                  <span className="button__text">Account</span>
                </a>
              ) : (
                <a
                  className="button button--ghost"
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/login')
                  }}
                  aria-label="Log In"
                >
                  <span className="button__icon" aria-hidden="true">
                    <img
                      src="https://img.icons8.com/?size=100&id=ZrksPzH5Aadq&format=png&color=000000"
                      alt=""
                      className="button__iconImg"
                    />
                  </span>
                  <span className="button__text">Log In</span>
                </a>
              )}
              <a
                className="button button--primary"
                href="/download"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/download')
                }}
                aria-label="Download"
              >
                <span className="button__icon" aria-hidden="true">
                  <img
                    src="https://img.icons8.com/?size=100&id=80618&format=png&color=000000"
                    alt=""
                    className="button__iconImg"
                  />
                </span>
                <span className="button__text">Download</span>
              </a>
            </div>
          </div>
        </header>
      )}

      <main>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><LoadingSpinner /></div>}>
          {isHome ? (
            <>
              <section className="hero">
                <div className="container hero__inner">
                  <div className="hero__copy">
                    <h1 className="hero__title">
                      A local-first Vision AI IDE for teams who need reproducible results.
                    </h1>
                    <p className="hero__subtitle">
                      ML FORGE replaces fragile scripts, Colab notebooks, and cloud GPU friction with a desktop workflow for datasets,
                      annotation, training, evaluation, and export. <strong>Runs locally.</strong> <strong>No data leaves your machine.</strong>{' '}
                      <strong>Deterministic &amp; reproducible by default.</strong>
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
                        Download for desktop
                      </a>
                      <a
                        className="button button--outline"
                        href="/workflow-automation"
                        onClick={(e) => {
                          e.preventDefault()
                          navigate('/workflow-automation')
                        }}
                      >
                        See the workflow
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              <section className="aboutSection">
                <div className="container">
                  <div className="sectionHeader">
                    <h2 className="sectionHeader__title">Testimonials</h2>
                    <p className="sectionHeader__subtitle">Engineer feedback focused on reproducibility, traceability, and shipping to production.</p>
                  </div>

                  <div className="unifyGrid">
                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Manufacturing</div>
                      <p className="unifyCard__body">
                        “We went from ‘it works on my machine’ to deterministic runs with replayable configs. When a regression showed up, we traced it to a dataset
                        version change in minutes instead of re-running the whole pipeline.”
                      </p>
                      <div className="unifyCard__meta">Nikhil Desai · Staff Machine Learning Engineer</div>
                    </article>

                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Robotics</div>
                      <p className="unifyCard__body">
                        “With ML FORGE, every export is tied to the exact dataset snapshot and metrics—so we can audit what shipped without guesswork.”
                      </p>
                      <div className="unifyCard__meta">Sara Kim · Computer Vision Lead</div>
                    </article>

                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Security</div>
                      <p className="unifyCard__body">
                        “We’re not trusting a black box—every step is explicit, and the artifact trail is complete. That changed how confidently we promote models from
                        experiments to releases.”
                      </p>
                      <div className="unifyCard__meta">Lina Haddad · Engineering Manager, Applied AI</div>
                    </article>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <a
                      className="button button--outline"
                      href="/testimonials"
                      onClick={(e) => {
                        e.preventDefault()
                        navigate('/testimonials')
                      }}
                    >
                      Read all testimonials
                    </a>
                  </div>
                </div>
              </section>

              <div className="heroBand" aria-hidden="true">
                <div className="heroBand__viewport">
                  <div className="heroBand__track" />
                </div>
              </div>

              <section className="aboutSection">
                <div className="container">
                  <div className="sectionHeader">
                    <h2 className="sectionHeader__title">What is ML FORGE?</h2>
                    <p className="sectionHeader__subtitle">A desktop-first Vision AI IDE for teams who need deterministic results and full control of data.</p>
                  </div>

                  <div className="unifyGrid">
                    <article className="unifyCard">
                      <div className="unifyCard__kicker">What is this?</div>
                      <p className="unifyCard__body">A local workflow for datasets → annotation → training → evaluation → export, with configs and artifacts kept together.</p>
                    </article>
                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Who is it for?</div>
                      <p className="unifyCard__body">ML engineers and Vision AI developers building on laptops, workstations, and on-prem machines — not hosted notebooks.</p>
                    </article>
                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Why should I care?</div>
                      <p className="unifyCard__body">Because reproducibility is a production feature. ML FORGE makes outputs explainable: which dataset, which config, which run.</p>
                    </article>
                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Concrete example</div>
                      <p className="unifyCard__body">Train and deploy YOLO locally in minutes — then export a deterministic ONNX/TensorRT bundle with full lineage.</p>
                      <div style={{ marginTop: '14px' }}>
                        <a
                          className="button button--outline"
                          href="/use-cases/yolo"
                          onClick={(e) => {
                            e.preventDefault()
                            navigate('/use-cases/yolo')
                          }}
                        >
                          View the canonical YOLO workflow
                        </a>
                      </div>
                    </article>
                  </div>
                </div>
              </section>

              <section className="unify unify--dark">
                <div className="container">
                  <h2 className="unifyHeading">Hardware &amp; local-first guarantee</h2>
                  <p className="unifyHeading__subtitle">The differentiator that matters in real engineering environments.</p>

                  <div className="unifyGrid">
                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Runs locally</div>
                      <p className="unifyCard__body">Training, labeling, evaluation, and exports run on your machine or your infrastructure — not a hosted notebook.</p>
                    </article>
                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Your data never leaves your machine</div>
                      <p className="unifyCard__body">The website is distribution and account metadata. Datasets and models stay local unless you decide otherwise.</p>
                    </article>
                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Works on 8–16GB RAM setups</div>
                      <p className="unifyCard__body">Optimized for practical laptop/workstation workflows. GPU recommended for training; CPU-only is supported (slower).</p>
                    </article>
                  </div>
                </div>
              </section>

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
                        Version datasets with explicit metadata and snapshots.
                        No silent changes. No hidden preprocessing. <strong>Repeatable inputs every run.</strong>
                      </p>
                    </article>

                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Annotation Studio</div>
                      <p className="unifyCard__body">
                        Label and review with an audit-ready change history.
                        Built for iteration, not one-off labeling. <strong>Review-gated changes.</strong>
                      </p>
                      <div className="unifyPartner">
                        <div className="unifyPartner__logo" aria-hidden="true">ML FORGE</div>
                        <div className="unifyPartner__meta">
                          <div className="unifyPartner__kicker">Review-gated changes</div>
                          <div className="unifyPartner__body">Every label edit is attributable and reversible.</div>
                        </div>
                      </div>
                    </article>

                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Deterministic Training</div>
                      <p className="unifyCard__body">
                        Explicit configs, locked inputs, and repeatable runs across machines.
                        <strong>Configure visually or via code.</strong>
                      </p>
                    </article>

                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Evaluation &amp; Benchmarks</div>
                      <p className="unifyCard__body">
                        Compare runs, metrics, and artifacts with full provenance.
                        <strong>Know exactly what changed between experiments.</strong>
                      </p>
                      <div className="unifyPartner unifyPartner--inline">
                        <div className="unifyPartner__logo" aria-hidden="true">ML FORGE</div>
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
                        <strong>No data leaves your machine.</strong>
                      </p>
                    </article>

                    <article className="unifyCard">
                      <div className="unifyCard__kicker">Production-Ready Exports</div>
                      <p className="unifyCard__body">
                        Export models, configs, and metrics together — ready for edge or on-prem deployment.
                        <strong>Deterministic exports with full lineage.</strong>
                      </p>
                    </article>
                  </div>
                </div>
              </section>
            </>
          ) : isTestimonials ? (
            <TestimonialsPage navigate={navigate} />
          ) : isGuarantees ? (
            <GuaranteesBoundariesPage navigate={navigate} />
          ) : isWorkflowAutomation ? (
            <GuidedWorkflowAutomationPage navigate={navigate} />
          ) : isDocs ? (
            <DocsPage />
          ) : isYoloUseCase ? (
            <YoloWorkflowPage navigate={navigate} />
          ) : isLogin ? (
            <LoginPage />
          ) : isSignup ? (
            <SignupPage />
          ) : isForgotPassword ? (
            <ForgotPasswordPage />
          ) : isResetPassword ? (
            <ResetPasswordPage />
          ) : isTerms ? (
            <TermsPage />
          ) : isPrivacy ? (
            <PrivacyPage />
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
          ) : isAdminPath ? (
            <AdminPage session={session} navigate={navigate} />
          ) : isSubscription ? (
            <SubscriptionPage session={session} navigate={navigate} />
          ) : isCheckout ? (
            <CheckoutPage navigate={navigate} />
          ) : isTeams ? (
            <TeamManagement session={session} navigate={navigate} />
          ) : isHelpCenter ? (
            <HelpCenterPage navigate={navigate} />
          ) : (
            <></>
          )}
        </Suspense>

        {isHome && (
          <>
            <section className="features" id="platform">
              <div className="container">
                <div className="platformHero platformHero--centered">
                  <h2 className="platformHero__title">
                    One IDE. <span className="platformHero__titleMuted">For every Vision AI team.</span>
                  </h2>
                  <p className="platformHero__subtitle">Built for datasets → annotation → training → evaluation → export — without notebook glue.</p>
                </div>

                <div className="platformStack">
                  <section className="platformPanel platformPanel--build">
                    <div className="platformPanel__inner">
                      <div className="platformCopy">
                        <h3 className="platformCopy__title">
                          Teams that <span className="platformCopy__titleAccent">build</span> datasets
                        </h3>
                        <div className="platformCopy__lede">Import, curate, and version image &amp; video datasets you can trust.</div>
                        <ul className="platformBullets">
                          <li className="platformBullets__item">
                            Create immutable dataset snapshots for training and evaluation.
                          </li>
                          <li className="platformBullets__item">
                            Explicit metadata so pipelines don’t depend on tribal knowledge.
                          </li>
                          <li className="platformBullets__item">
                            Catch data drift before it shows up as “random” accuracy changes.
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
                            <div className="platformChart platformChart--dataset">
                              <div className="platformChart__grid" />
                              <div className="platformChart__dataset-bars" />
                              <div className="platformChart__dataset-labels">
                                <span className="platformChart__label">Person</span>
                                <span className="platformChart__label">Car</span>
                                <span className="platformChart__label">Bike</span>
                                <span className="platformChart__label">Sign</span>
                              </div>
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
                        <div className="platformCopy__lede">Reproducible training runs with configs and artifacts kept together.</div>
                        <ul className="platformBullets">
                          <li className="platformBullets__item">Stop losing runs to mismatched configs, seeds, or preprocessing.</li>
                          <li className="platformBullets__item">Deterministic runs across machines (local or on-prem).</li>
                          <li className="platformBullets__item">Re-run any experiment from the exact same inputs.</li>
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
                            <div className="platformChart platformChart--loss">
                              <div className="platformChart__grid" />
                              <div className="platformChart__loss-curve" />
                              <div className="platformChart__loss-labels">
                                <span className="platformChart__axis-label platformChart__axis-label--y">Loss</span>
                                <span className="platformChart__axis-label platformChart__axis-label--x">Epoch</span>
                              </div>
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
                        <div className="platformCopy__lede">Export models with the context required to reproduce and deploy.</div>
                        <ul className="platformBullets">
                          <li className="platformBullets__item">Bundle model + config + metrics so deployments aren’t guesswork.</li>
                          <li className="platformBullets__item">Audit-ready artifacts when you need to prove how a model was trained.</li>
                          <li className="platformBullets__item">Designed for edge and on-prem workflows where cloud isn’t an option.</li>
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
                            <div className="platformChart platformChart--confusion">
                              <div className="platformChart__grid" />
                              <div className="platformChart__confusion-matrix" />
                              <div className="platformChart__confusion-labels">
                                <span className="platformChart__matrix-label">Precision: 0.94</span>
                                <span className="platformChart__matrix-label">Recall: 0.91</span>
                                <span className="platformChart__matrix-label">F1: 0.92</span>
                              </div>
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
                      Manufacturing inspection teams shipping to the line
                    </div>
                    <div className="recognitionCard__brand">Manufacturing</div>
                    <div className="recognitionCard__bar" aria-hidden="true" />
                  </article>

                  <article className="recognitionCard">
                    <div className="recognitionCard__title">
                      Robotics &amp; autonomy teams iterating on-device
                    </div>
                    <div className="recognitionCard__brand">Robotics</div>
                    <div className="recognitionCard__bar" aria-hidden="true" />
                  </article>

                  <article className="recognitionCard">
                    <div className="recognitionCard__title">
                      Security &amp; surveillance deployments running on-prem
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

            <section className="aboutSection">
              <div className="container">
                <div className="sectionHeader">
                  <h2 className="sectionHeader__title">Built for engineers, not slide decks</h2>
                  <p className="sectionHeader__subtitle">A technical philosophy: fewer fragile pipelines, fewer hidden dependencies, more reproducibility.</p>
                </div>

                <div className="aboutSplit">
                  <div className="aboutSplit__copy">
                    <h3 className="aboutSplit__title">Founder / philosophy</h3>
                    <p className="aboutSplit__body">
                      Built by an ML engineer who needed a reliable desktop workflow: dataset versioning, reviewable labeling, deterministic training, and export bundles
                      that carry the evidence required to reproduce results later.
                    </p>
                    <div className="aboutSplit__cta">
                      <a
                        className="button button--primary"
                        href="/workflow-automation"
                        onClick={(e) => {
                          e.preventDefault()
                          navigate('/workflow-automation')
                        }}
                      >
                        See the workflow
                      </a>
                      <a
                        className="button button--outline"
                        href="/use-cases/yolo"
                        onClick={(e) => {
                          e.preventDefault()
                          navigate('/use-cases/yolo')
                        }}
                      >
                        Canonical YOLO use case
                      </a>
                    </div>
                  </div>
                  <div className="aboutSplit__panel" aria-hidden="true">
                    <div className="aboutChipRow">
                      <span className="aboutChip">Local-first</span>
                      <span className="aboutChip">Deterministic</span>
                      <span className="aboutChip">Artifact lineage</span>
                      <span className="aboutChip">Audit-ready</span>
                      <span className="aboutChip">On-prem friendly</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="ctaBand ctaBand--agentic">
              <div className="container ctaBand__inner ctaBand__inner--agentic">
                <h2 className="ctaBand__title ctaBand__title--agentic">Vision AI is hard. Reproducibility is harder.</h2>
                <div className="ctaBand__row">
                  <p className="ctaBand__subtitle ctaBand__subtitle--agentic">
                    When results depend on whoever ran the notebook last, you don’t have a pipeline — you have a liability. ML FORGE makes
                    workflows deterministic and local-first.
                  </p>
                  <a
                    className="ctaBand__button"
                    href="/download"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/download')
                    }}
                  >
                    Get the desktop app
                  </a>
                </div>
              </div>
            </section>
          </>
        )}

        {!isLogin && !isSignup && !isHome && !isCheckout && footer}

        {isHome && !isLogin && !isSignup && !isCheckout && footer}
      </main>
    </div>
  )
}

export default App
