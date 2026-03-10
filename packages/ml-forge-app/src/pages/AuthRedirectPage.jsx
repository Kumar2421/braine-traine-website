import { useEffect, useMemo, useState } from 'react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { SEO } from '../utils/SEO'

function AuthRedirectPage({ navigate }) {
  const token = useMemo(() => new URLSearchParams(window.location.search || '').get('token') || '', [])
  const [attempted, setAttempted] = useState(false)
  const deepLinkUrl = useMemo(() => (token ? `braintrain://auth?token=${encodeURIComponent(token)}` : ''), [token])

  useEffect(() => {
    if (!token) return
    const t = window.setTimeout(() => {
      setAttempted(true)
    }, 900)

    if (token) {
        window.location.assign(deepLinkUrl)
    }

    return () => {
      window.clearTimeout(t)
    }
  }, [token, deepLinkUrl])

  return (
    <>
      <SEO title="Connecting to ML Forge..." />
      <AuthLayout>
        <div className="flex flex-col w-full">
          {/* Heading - 2X size and Bold */}
          <h1 className="text-[48px] font-bold text-[#1c1917] tracking-[-0.03em] leading-[1.1] mb-2">
            Connecting…
          </h1>
          <p className="text-[16px] text-[#78716c] mb-10 font-medium">
            Handing off to ML FORGE IDE
          </p>

          <div className="bg-white border border-[#d4d4d8] rounded-lg p-6 mb-8 shadow-sm">
            <h3 className="text-[14px] font-semibold text-[#1c1917] mb-2 uppercase tracking-wider opacity-60">Exchange token</h3>
            <p className="text-[15px] text-[#44403c] leading-relaxed">
              {token ? 'Your token has been issued and is ready for the handoff.' : 'Missing security token. Please restart login from the IDE.'}
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-10">
            {token && (
              <button
                onClick={() => window.location.assign(deepLinkUrl)}
                className="w-full h-[48px] bg-[#3ecf8e] hover:bg-[#2db97d] active:bg-[#27a570] text-[#022c1e] text-[16px] font-semibold rounded-md shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
              >
                Open IDE to sign in
              </button>
            )}
            
            <button
              onClick={() => navigate('/download')}
              className="w-full h-[48px] bg-white border border-[#d4d4d8] text-[#1c1917] text-[15px] font-medium rounded-md hover:bg-[#fafaf9] transition-all"
            >
              Download IDE
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-[14px] text-[#78716c] hover:text-[#1c1917] font-medium transition-colors underline underline-offset-4 decoration-[#d4d4d8]"
            >
              Back to login page
            </button>
          </div>

          {attempted && !token && (
            <p className="mt-8 text-[13px] text-[#ef4444] text-center bg-[#fef2f2] p-3 rounded-md border border-[#fecaca]">
              Handoff failed. Please ensure the IDE is running and try again.
            </p>
          )}
        </div>
      </AuthLayout>
    </>
  )
}

export default AuthRedirectPage
