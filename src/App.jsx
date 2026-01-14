import { useCallback, useEffect, useState, lazy, Suspense } from 'react'
import './App.css'
import { SEO } from './components/SEO.jsx'
import { isAdmin } from './utils/adminAuth'
import { LoadingSpinner } from './components/LoadingSpinner'
import { AnimatedSpan, Terminal, TypingAnimation } from './components/ui/terminal'
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
const DashboardV2Page = lazy(() => import('./DashboardV2Page'))
const DownloadHubPage = lazy(() => import('./DownloadHubPage'))
const PricingPage = lazy(() => import('./PricingPage'))
const WhyPage = lazy(() => import('./WhyPage'))
const SecurityPage = lazy(() => import('./SecurityPage'))
const RequestAccessPage = lazy(() => import('./RequestAccessPage'))
const AdminPage = lazy(() => import('./AdminPage'))
const SubscriptionPage = lazy(() => import('./SubscriptionPage'))
const CheckoutPage = lazy(() => import('./CheckoutPage'))
const TeamManagement = lazy(() => import('./components/TeamManagement').then(m => ({ default: m.TeamManagement })))
const TeamPage = lazy(() => import('./TeamPage'))
const FaqPage = lazy(() => import('./FaqPage'))
const BlogPage = lazy(() => import('./BlogPage'))
const ManufacturingInspectionPage = lazy(() => import('./ManufacturingInspectionPage'))

function App() {
  const [path, setPath] = useState(() => window.location.pathname || '/')
  const [session, setSession] = useState(null)
  const [desktopMenu, setDesktopMenu] = useState(null)
  const [mobileSection, setMobileSection] = useState(null)

  const closeMobileNav = useCallback(() => {
    const nav = document.querySelector('.nav')
    const toggle = document.querySelector('.navToggle')
    const topbar = document.querySelector('.topbar')
    const icon = toggle?.querySelector?.('.navToggle__icon')

    if (nav) nav.classList.remove('nav--open')
    if (toggle) toggle.setAttribute('aria-expanded', 'false')
    if (topbar) topbar.classList.remove('topbar--navOpen')
    if (icon) icon.textContent = '☰'
  }, [])

  useEffect(() => {
    const onDocClick = (e) => {
      if (window.innerWidth < 980) return
      const topbar = document.querySelector('.topbar')
      if (!topbar) return
      const isInside = topbar.contains(e.target)
      if (!isInside) {
        setDesktopMenu(null)
      }
    }

    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

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
  const isManufacturingInspection = path === '/use-cases/manufacturing-inspection'
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
  const isDashboardV2 = path === '/dashboard-v2'
  const isPricing = path === '/pricing'
  const isWhy = path === '/why'
  const isLogout = path === '/logout'
  const isSecurity = path === '/security'
  const isRequestAccess = path === '/request-access'
  const isAdminPath = path === '/admin'
  const isSubscription = path === '/subscription' || path === '/dashboard/subscription'
  const isCheckout = path === '/checkout'
  const isTeams = path === '/teams' || path === '/dashboard/teams'
  const isTeam = path === '/team'
  const isFaq = path === '/faq'
  const isBlog = path === '/blog'
  const isHelpCenter = path === '/help' || path === '/help-center'

  const authed = !!session
  const needsAuth = isDashboard || isDashboardV2 || isSubscription || isCheckout

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
              <div className="footerSocial" aria-label="Social links">
                <a className="footerSocialButton" href="https://github.com/" target="_blank" rel="noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 0.296997C5.37 0.296997 0 5.67 0 12.297C0 17.6 3.438 22.097 8.205 23.682C8.805 23.795 9.025 23.424 9.025 23.105C9.025 22.82 9.015 22.065 9.01 21.065C5.672 21.789 4.968 19.455 4.968 19.455C4.422 18.07 3.633 17.7 3.633 17.7C2.546 16.956 3.717 16.971 3.717 16.971C4.922 17.055 5.555 18.207 5.555 18.207C6.625 20.042 8.364 19.512 9.05 19.205C9.158 18.429 9.467 17.9 9.81 17.6C7.145 17.3 4.344 16.268 4.344 11.67C4.344 10.36 4.809 9.29 5.579 8.45C5.444 8.147 5.039 6.927 5.684 5.274C5.684 5.274 6.689 4.952 8.984 6.504C9.944 6.237 10.964 6.105 11.984 6.099C13.004 6.105 14.024 6.237 14.984 6.504C17.264 4.952 18.269 5.274 18.269 5.274C18.914 6.927 18.509 8.147 18.389 8.45C19.154 9.29 19.619 10.36 19.619 11.67C19.619 16.28 16.814 17.295 14.144 17.59C14.564 17.95 14.954 18.686 14.954 19.81C14.954 21.416 14.939 22.706 14.939 23.096C14.939 23.411 15.149 23.786 15.764 23.666C20.565 22.092 24 17.592 24 12.297C24 5.67 18.627 0.296997 12 0.296997Z" fill="white" />
                  </svg>

                </a>

                <a className="footerSocialButton" href="https://instagram.com/" target="_blank" rel="noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M7.5 2.5H16.5C19.2614 2.5 21.5 4.73858 21.5 7.5V16.5C21.5 19.2614 19.2614 21.5 16.5 21.5H7.5C4.73858 21.5 2.5 19.2614 2.5 16.5V7.5C2.5 4.73858 4.73858 2.5 7.5 2.5Z" stroke="white" strokeWidth="1.6" />
                    <path d="M12 16.1C14.2647 16.1 16.1 14.2647 16.1 12C16.1 9.73533 14.2647 7.9 12 7.9C9.73533 7.9 7.9 9.73533 7.9 12C7.9 14.2647 9.73533 16.1 12 16.1Z" stroke="white" strokeWidth="1.6" />
                    <path d="M17.2 6.8H17.21" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>

                </a>

                <a className="footerSocialButton" href="https://discord.com/" target="_blank" rel="noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M19.5 6.2C17.9 5.3 16.2 4.8 14.4 4.6L14.1 5.3C12.9 5.1 11.7 5.1 10.5 5.3L10.2 4.6C8.4 4.8 6.7 5.3 5.1 6.2C3.6 8.5 3.1 10.8 3.2 13.1C4.9 14.3 6.7 15.1 8.7 15.5L9.3 14.5C8.7 14.3 8.2 14.1 7.6 13.8C7.7 13.7 7.8 13.6 7.9 13.5C11.1 15 14.5 15 17.7 13.5C17.8 13.6 17.9 13.7 18 13.8C17.4 14.1 16.9 14.3 16.3 14.5L16.9 15.5C18.9 15.1 20.7 14.3 22.4 13.1C22.6 10.4 21.9 8.1 19.5 6.2Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M9.2 12.7C9.8 12.7 10.3 12.1 10.3 11.4C10.3 10.7 9.8 10.1 9.2 10.1C8.6 10.1 8.1 10.7 8.1 11.4C8.1 12.1 8.6 12.7 9.2 12.7Z" fill="white" />
                    <path d="M14.8 12.7C15.4 12.7 15.9 12.1 15.9 11.4C15.9 10.7 15.4 10.1 14.8 10.1C14.2 10.1 13.7 10.7 13.7 11.4C13.7 12.1 14.2 12.7 14.8 12.7Z" fill="white" />
                  </svg>

                </a>

                <a className="footerSocialButton" href="https://youtube.com/" target="_blank" rel="noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M21.6 7.1C21.4 6.3 20.8 5.7 20 5.5C18.5 5 12 5 12 5C12 5 5.5 5 4 5.5C3.2 5.7 2.6 6.3 2.4 7.1C2 8.6 2 12 2 12C2 12 2 15.4 2.4 16.9C2.6 17.7 3.2 18.3 4 18.5C5.5 19 12 19 12 19C12 19 18.5 19 20 18.5C20.8 18.3 21.4 17.7 21.6 16.9C22 15.4 22 12 22 12C22 12 22 8.6 21.6 7.1Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M10 9.75V14.25L14 12L10 9.75Z" fill="white" />
                  </svg>

                </a>

                <a className="footerSocialButton" href="https://x.com/" target="_blank" rel="noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M4 4L20 20" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M20 4L4 20" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>

                </a>

                <a className="footerSocialButton" href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M6.5 9.5V18.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M6.5 6.7C7.16274 6.7 7.7 6.16274 7.7 5.5C7.7 4.83726 7.16274 4.3 6.5 4.3C5.83726 4.3 5.3 4.83726 5.3 5.5C5.3 6.16274 5.83726 6.7 6.5 6.7Z" fill="white" />
                    <path d="M11 18.5V13.6C11 11.8 12.1 10.9 13.6 10.9C15.1 10.9 16 11.9 16 13.7V18.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.8 9.5H12.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>

                </a>
              </div>
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
            {/* <a
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
            </a> */}
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
    } else if (isManufacturingInspection) {
      document.title = 'Edge Vision AI for Manufacturing Inspection | ML FORGE'
    } else if (isDashboard) {
      document.title = 'Dashboard | ML FORGE'
    } else if (isPricing) {
      document.title = 'Pricing | ML FORGE'
    } else if (isDownload) {
      document.title = 'Download | ML FORGE'
    }
  }, [isHome, isDocs, isWorkflowAutomation, isGuarantees, isTestimonials, isYoloUseCase, isManufacturingInspection, isDashboard, isPricing, isDownload])

  // Handle mobile nav closing on window resize and outside clicks
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 980) {
        const nav = document.querySelector('.nav')
        const toggle = document.querySelector('.navToggle')
        if (nav && toggle) {
          nav.classList.remove('nav--open')
          toggle.setAttribute('aria-expanded', 'false')
          const topbar = document.querySelector('.topbar')
          const icon = toggle?.querySelector?.('.navToggle__icon')
          if (topbar) topbar.classList.remove('topbar--navOpen')
          if (icon) icon.textContent = '☰'
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
          closeMobileNav()
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
      {!isLogin && !isSignup && !isCheckout && !isDashboardV2 && (
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
                const icon = button.querySelector('.navToggle__icon')
                const isExpanded = button.getAttribute('aria-expanded') === 'true'

                if (nav) {
                  if (isExpanded) {
                    nav.classList.remove('nav--open')
                    button.setAttribute('aria-expanded', 'false')
                    topbar?.classList?.remove?.('topbar--navOpen')
                    if (icon) icon.textContent = '☰'
                  } else {
                    nav.classList.add('nav--open')
                    button.setAttribute('aria-expanded', 'true')
                    topbar?.classList?.add?.('topbar--navOpen')
                    if (icon) icon.textContent = '✕'
                  }
                }
              }}
            >
              <span className="navToggle__icon" aria-hidden="true">☰</span>
            </button>

            <nav className="nav" aria-label="Primary">
              <div className="navDesktop" aria-label="Primary navigation">
                <button
                  className="navDesktopTrigger"
                  type="button"
                  aria-expanded={desktopMenu === 'product'}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDesktopMenu((v) => (v === 'product' ? null : 'product'))
                  }}
                >
                  <span>Product</span>
                  <span className="navDesktopChevron" aria-hidden="true">▾</span>
                </button>

                <button
                  className="navDesktopTrigger"
                  type="button"
                  aria-expanded={desktopMenu === 'usecases'}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDesktopMenu((v) => (v === 'usecases' ? null : 'usecases'))
                  }}
                >
                  <span>Use Cases</span>
                  <span className="navDesktopChevron" aria-hidden="true">▾</span>
                </button>

                <button
                  className="navDesktopTrigger"
                  type="button"
                  aria-expanded={desktopMenu === 'resources'}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDesktopMenu((v) => (v === 'resources' ? null : 'resources'))
                  }}
                >
                  <span>Resources</span>
                  <span className="navDesktopChevron" aria-hidden="true">▾</span>
                </button>

                <button
                  className="navDesktopTrigger"
                  type="button"
                  aria-expanded={desktopMenu === 'company'}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDesktopMenu((v) => (v === 'company' ? null : 'company'))
                  }}
                >
                  <span>Company</span>
                  <span className="navDesktopChevron" aria-hidden="true">▾</span>
                </button>
              </div>

              <div className="navMobile" aria-label="Mobile navigation">
                <button
                  className="navMobileGroup"
                  type="button"
                  aria-expanded={mobileSection === 'product'}
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileSection((v) => (v === 'product' ? null : 'product'))
                  }}
                >
                  <span>Product</span>
                  <span className="navMobileGroup__chevron" aria-hidden="true">▾</span>
                </button>

                {mobileSection === 'product' ? (
                  <div className="navMobileGroup__panel">
                    <a
                      className={`navMobileLink ${isHome ? 'navMobileLink--active' : ''}`}
                      href="/"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/')
                      }}
                    >
                      Overview
                    </a>
                    <a
                      className={`navMobileLink ${isWorkflowAutomation ? 'navMobileLink--active' : ''}`}
                      href="/workflow-automation"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/workflow-automation')
                      }}
                    >
                      Workflow
                    </a>
                    <a
                      className={`navMobileLink ${isGuarantees ? 'navMobileLink--active' : ''}`}
                      href="/guarantees"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/guarantees')
                      }}
                    >
                      Guarantees
                    </a>
                    <a
                      className={`navMobileLink ${isPricing ? 'navMobileLink--active' : ''}`}
                      href="/pricing"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/pricing')
                      }}
                    >
                      Pricing
                    </a>
                  </div>
                ) : null}

                <button
                  className="navMobileGroup"
                  type="button"
                  aria-expanded={mobileSection === 'usecases'}
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileSection((v) => (v === 'usecases' ? null : 'usecases'))
                  }}
                >
                  <span>Use Cases</span>
                  <span className="navMobileGroup__chevron" aria-hidden="true">▾</span>
                </button>

                {mobileSection === 'usecases' ? (
                  <div className="navMobileGroup__panel">
                    <a
                      className={`navMobileLink ${isYoloUseCase ? 'navMobileLink--active' : ''}`}
                      href="/use-cases/yolo"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/use-cases/yolo')
                      }}
                    >
                      YOLO Use Case
                    </a>
                    <a
                      className={`navMobileLink ${isManufacturingInspection ? 'navMobileLink--active' : ''}`}
                      href="/use-cases/manufacturing-inspection"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/use-cases/manufacturing-inspection')
                      }}
                    >
                      Manufacturing Inspection
                    </a>
                  </div>
                ) : null}

                <button
                  className="navMobileGroup"
                  type="button"
                  aria-expanded={mobileSection === 'resources'}
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileSection((v) => (v === 'resources' ? null : 'resources'))
                  }}
                >
                  <span>Resources</span>
                  <span className="navMobileGroup__chevron" aria-hidden="true">▾</span>
                </button>

                {mobileSection === 'resources' ? (
                  <div className="navMobileGroup__panel">
                    <a
                      className={`navMobileLink ${isDocs ? 'navMobileLink--active' : ''}`}
                      href="/docs"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/docs')
                      }}
                    >
                      Documentation
                    </a>
                    <a
                      className={`navMobileLink ${isTestimonials ? 'navMobileLink--active' : ''}`}
                      href="/testimonials"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/testimonials')
                      }}
                    >
                      Testimonials
                    </a>
                    <a
                      className={`navMobileLink ${isBlog ? 'navMobileLink--active' : ''}`}
                      href="/blog"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/blog')
                      }}
                    >
                      Blog
                    </a>
                  </div>
                ) : null}

                <button
                  className="navMobileGroup"
                  type="button"
                  aria-expanded={mobileSection === 'company'}
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileSection((v) => (v === 'company' ? null : 'company'))
                  }}
                >
                  <span>Company</span>
                  <span className="navMobileGroup__chevron" aria-hidden="true">▾</span>
                </button>

                {mobileSection === 'company' ? (
                  <div className="navMobileGroup__panel">
                    <a
                      className={`navMobileLink ${isWhy ? 'navMobileLink--active' : ''}`}
                      href="/why"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/why')
                      }}
                    >
                      Why ML FORGE
                    </a>
                    <a
                      className={`navMobileLink ${isAbout ? 'navMobileLink--active' : ''}`}
                      href="/about"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/about')
                      }}
                    >
                      About
                    </a>
                    <a
                      className={`navMobileLink ${isTeam ? 'navMobileLink--active' : ''}`}
                      href="/team"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/team')
                      }}
                    >
                      Team
                    </a>
                    <a
                      className={`navMobileLink ${isFaq ? 'navMobileLink--active' : ''}`}
                      href="/faq"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
                        navigate('/faq')
                      }}
                    >
                      FAQ
                    </a>
                  </div>
                ) : null}

                <div className="navMobileActions" aria-label="Account actions">
                  {session ? (
                    <>
                      <a
                        className="button button--ghost"
                        href="/dashboard-v2"
                        onClick={(e) => {
                          e.preventDefault()
                          closeMobileNav()
                          navigate('/dashboard-v2')
                        }}
                        aria-label="Dashboard v2"
                      >
                        <span className="button__icon" aria-hidden="true">📊</span>
                        <span className="button__text">Dashboard v2</span>
                      </a>
                      <a
                        className="button button--ghost"
                        href="/dashboard"
                        onClick={(e) => {
                          e.preventDefault()
                          closeMobileNav()
                          navigate('/dashboard')
                        }}
                        aria-label="Account"
                      >
                        <span className="button__icon" aria-hidden="true">👤</span>
                        <span className="button__text">Account</span>
                      </a>
                    </>
                  ) : (
                    <a
                      className="button button--ghost"
                      href="/login"
                      onClick={(e) => {
                        e.preventDefault()
                        closeMobileNav()
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
                      closeMobileNav()
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
            </nav>

            <div className="topbar__actions">
              {session ? (
                <>
                  <a
                    className="button button--ghost"
                    href="/dashboard-v2"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/dashboard-v2')
                    }}
                    aria-label="Dashboard v2"
                  >
                    <span className="button__text">Dashboard v2</span>
                  </a>
                  <a
                    className="button button--ghost"
                    href="/dashboard"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/dashboard')
                    }}
                    aria-label="Account"
                  >
                    <span className="button__text">Account</span>
                  </a>
                </>
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
                <span className="button__text">Download</span>
              </a>
            </div>
          </div>

          {desktopMenu ? (
            <div
              className="navMega"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <div className="navMega__inner">
                {desktopMenu === 'product' ? (
                  <div className="navMega__layout">
                    <div className="navMega__intro">
                      <div className="navMega__introTitle">Product</div>
                      <div className="navMega__introText">
                        Build, train, and ship Vision AI — locally and reproducibly.
                      </div>
                    </div>
                    <div className="navMega__grid">
                      <div className="navMega__col">
                        <div className="navMega__title">Product</div>
                        <a
                          className="navMega__link"
                          href="/"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/')
                          }}
                        >
                          Overview
                        </a>
                        <a
                          className="navMega__link"
                          href="/workflow-automation"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/workflow-automation')
                          }}
                        >
                          Workflow
                        </a>
                        <a
                          className="navMega__link"
                          href="/guarantees"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/guarantees')
                          }}
                        >
                          Guarantees
                        </a>
                      </div>
                      <div className="navMega__col">
                        <div className="navMega__title">Downloads</div>
                        <a
                          className="navMega__link"
                          href="/download"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/download')
                          }}
                        >
                          Download ML FORGE
                        </a>
                        <a
                          className="navMega__link"
                          href="/docs"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/docs')
                          }}
                        >
                          Documentation
                        </a>
                      </div>
                    </div>
                  </div>
                ) : desktopMenu === 'usecases' ? (
                  <div className="navMega__layout">
                    <div className="navMega__intro">
                      <div className="navMega__introTitle">Use Cases</div>
                      <div className="navMega__introText">
                        Templates for real-world Vision AI workflows.
                      </div>
                    </div>
                    <div className="navMega__grid">
                      <div className="navMega__col">
                        <div className="navMega__title">Use cases</div>
                        <a
                          className="navMega__link"
                          href="/use-cases/yolo"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/use-cases/yolo')
                          }}
                        >
                          End-to-end YOLO workflow
                        </a>
                        <a
                          className="navMega__link"
                          href="/use-cases/manufacturing-inspection"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/use-cases/manufacturing-inspection')
                          }}
                        >
                          Manufacturing inspection
                        </a>
                      </div>
                    </div>
                  </div>
                ) : desktopMenu === 'resources' ? (
                  <div className="navMega__layout">
                    <div className="navMega__intro">
                      <div className="navMega__introTitle">Resources</div>
                      <div className="navMega__introText">
                        Guides, docs, and examples to help you move faster.
                      </div>
                    </div>
                    <div className="navMega__grid">
                      <div className="navMega__col">
                        <div className="navMega__title">Resources</div>
                        <a
                          className="navMega__link"
                          href="/docs"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/docs')
                          }}
                        >
                          Documentation
                        </a>
                        <a
                          className="navMega__link"
                          href="/testimonials"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/testimonials')
                          }}
                        >
                          Testimonials
                        </a>
                        <a
                          className="navMega__link"
                          href="/blog"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/blog')
                          }}
                        >
                          Blog
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="navMega__layout">
                    <div className="navMega__intro">
                      <div className="navMega__introTitle">Company</div>
                      <div className="navMega__introText">
                        Learn why teams choose ML FORGE.
                      </div>
                    </div>
                    <div className="navMega__grid">
                      <div className="navMega__col">
                        <div className="navMega__title">Company</div>
                        <a
                          className="navMega__link"
                          href="/why"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/why')
                          }}
                        >
                          Why ML FORGE
                        </a>
                        <a
                          className="navMega__link"
                          href="/about"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/about')
                          }}
                        >
                          About
                        </a>
                        <a
                          className="navMega__link"
                          href="/team"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/team')
                          }}
                        >
                          Team
                        </a>
                        <a
                          className="navMega__link"
                          href="/faq"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/faq')
                          }}
                        >
                          FAQ
                        </a>
                      </div>
                      <div className="navMega__col">
                        <div className="navMega__title">Pricing</div>
                        <a
                          className="navMega__link"
                          href="/pricing"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/pricing')
                          }}
                        >
                          Plans
                        </a>
                        <a
                          className="navMega__link"
                          href="/request-access"
                          onClick={(e) => {
                            e.preventDefault()
                            setDesktopMenu(null)
                            navigate('/request-access')
                          }}
                        >
                          Request access
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
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
          ) : isManufacturingInspection ? (
            <ManufacturingInspectionPage navigate={navigate} />
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
          ) : isDashboardV2 ? (
            <DashboardV2Page session={session} navigate={navigate} />
          ) : isPricing ? (
            <PricingPage navigate={navigate} />
          ) : isWhy ? (
            <WhyPage />
          ) : isSecurity ? (
            <SecurityPage />
          ) : isRequestAccess ? (
            <RequestAccessPage session={session} navigate={navigate} />
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
          ) : isTeam ? (
            <TeamPage navigate={navigate} />
          ) : isFaq ? (
            <FaqPage navigate={navigate} />
          ) : isBlog ? (
            <BlogPage navigate={navigate} />
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
                            <Terminal embedded>
                              <TypingAnimation>&gt; pnpm dlx shadcn@latest init</TypingAnimation>
                              <AnimatedSpan className="text-green-500">✔ Preflight checks.</AnimatedSpan>
                              <AnimatedSpan className="text-green-500">✔ Verifying framework. Found Vite + React.</AnimatedSpan>
                              <AnimatedSpan className="text-green-500">✔ Validating Tailwind CSS.</AnimatedSpan>
                              <AnimatedSpan className="text-green-500">✔ Importing dataset sources.</AnimatedSpan>
                              <AnimatedSpan className="text-blue-500">
                                <span>ℹ Snapshot created:</span>
                                <span className="pl-2">- dataset@v12 (immutable)</span>
                              </AnimatedSpan>
                              <TypingAnimation className="text-muted-foreground">Success! Dataset version is ready for training.</TypingAnimation>
                            </Terminal>
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
                            <Terminal embedded>
                              <TypingAnimation>&gt; mlforge run train --project yolo-v5 --seed 1337</TypingAnimation>
                              <AnimatedSpan className="text-green-500">✔ Locked config + seed.</AnimatedSpan>
                              <AnimatedSpan className="text-green-500">✔ Resolved dataset snapshot: dataset@v12.</AnimatedSpan>
                              <AnimatedSpan className="text-green-500">✔ Starting training (deterministic mode).</AnimatedSpan>
                              <AnimatedSpan className="text-blue-500">
                                <span>ℹ Metrics:</span>
                                <span className="pl-2">- mAP@0.5: 0.78 → 0.92</span>
                              </AnimatedSpan>
                              <TypingAnimation className="text-muted-foreground">Run complete. Artifacts + logs captured.</TypingAnimation>
                            </Terminal>
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
                            <Terminal embedded>
                              <TypingAnimation>&gt; mlforge export --format onnx --run 2026-01-13T12:51</TypingAnimation>
                              <AnimatedSpan className="text-green-500">✔ Packed model + config + metrics.</AnimatedSpan>
                              <AnimatedSpan className="text-green-500">✔ Added evaluation report + lineage.</AnimatedSpan>
                              <AnimatedSpan className="text-green-500">✔ Exported without cloud dependencies.</AnimatedSpan>
                              <AnimatedSpan className="text-blue-500">
                                <span>ℹ Bundle:</span>
                                <span className="pl-2">- export/yolo-v5.onnx + manifest.json</span>
                              </AnimatedSpan>
                              <TypingAnimation className="text-muted-foreground">Ready to deploy. Repro steps included.</TypingAnimation>
                            </Terminal>
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

        {!isLogin && !isSignup && !isHome && !isCheckout && !isDashboardV2 && footer}

        {isHome && !isLogin && !isSignup && !isCheckout && !isDashboardV2 && footer}
      </main>
    </div>
  )
}

export default App
