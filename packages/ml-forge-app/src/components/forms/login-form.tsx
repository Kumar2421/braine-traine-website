import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"

export function LoginForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextPath = searchParams.get('next') || '/dashboard'

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (signInErr) throw signInErr
      if (!data?.session) throw new Error('Login failed.')
      navigate(nextPath, { replace: true })
    } catch (err) {
      let msg = 'Unable to log in. Please try again.'
      if (err instanceof Error) {
        msg = err.message
        if (msg.includes('Invalid login credentials')) msg = 'Invalid email or password.'
        else if (msg.includes('Email not confirmed')) msg = 'Please check your inbox to confirm your email.'
      }
      setError(msg)
    } finally { setIsLoading(false) }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setIsLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${nextPath}` }
      })
      if (err) throw err
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed.')
      setIsLoading(false)
    }
  }

  const inputOuterClass = `
    p-[2px] rounded-lg bg-[#f9fafb] border border-[#e5e7eb]
    focus-within:border-[#3ecf8e]/50 focus-within:ring-4 focus-within:ring-[#3ecf8e]/10
    transition-all duration-200
  `

  const inputClass = `
    w-full h-[40px] px-3 text-[14px] text-[#1c1917]
    bg-white border border-[#d1d5db] rounded-md
    placeholder:text-[#9ca3af]
    outline-none transition-all duration-150
    hover:border-[#9ca3af]
    focus:border-[#3ecf8e]
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const socialBtnClass = `
    w-full h-[48px] flex items-center justify-center gap-3
    bg-white border border-[#d4d4d8] rounded-md
    text-[16px] font-medium text-[#1c1917]
    transition-all duration-150
    hover:border-[#a1a1aa] hover:bg-[#fafaf9]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3ecf8e]/40 focus-visible:border-[#3ecf8e]
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  return (
    <form className="flex flex-col w-full" onSubmit={handleSubmit} noValidate>

      {/* Heading - 2X size and Bold */}
      <h1 className="text-[32px] font-bold text-[#111827] tracking-tight leading-tight mb-1">
        Welcome back
      </h1>
      <p className="text-[14px] text-[#6b7280] mb-6">
        Sign in to your account
      </p>

      {/* Error */}
      {error && (
        <div className="mb-4 text-[13px] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-md px-3 py-2 shadow-sm">
          {error}
        </div>
      )}

      {/* Social buttons - Google only */}
      <div className="mb-6">
        <div className="relative p-[1px] rounded-lg bg-gradient-to-b from-[#e5e7eb] to-[#d1d5db] shadow-sm">
          <button type="button" disabled={isLoading} onClick={handleGoogleSignIn} className={`${socialBtnClass} border-none`}>
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-[#e5e7eb]" />
        <span className="text-[12px] font-medium text-[#9ca3af]">or</span>
        <div className="flex-1 h-px bg-[#e5e7eb]" />
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-[13px] font-medium text-[#374151]">Email address</label>
          <div className={inputOuterClass}>
            <input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-[13px] font-medium text-[#374151]">Password</label>
            <Link to="/forgot-password" tabIndex={-1} className="text-[12px] font-medium text-[#3ecf8e] hover:text-[#2db97d] transition-colors underline">
              Forgot password?
            </Link>
          </div>
          <div className={inputOuterClass}>
            <div className="relative">
              <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className={`${inputClass} pr-10`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors outline-none">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button type="submit" disabled={isLoading} className="w-full h-[40px] bg-[#c1f2d6] hover:bg-[#a7f3d0] active:bg-[#6ee7b7] text-[#065f46] text-[14px] font-medium rounded-md shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3ecf8e]/50 disabled:opacity-60 disabled:cursor-not-allowed mb-6">
        {isLoading ? "Signing in…" : "Sign in"}
      </button>

      {/* Switch */}
      <p className="text-center text-[13px] text-[#6b7280]">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-[#111827] font-semibold hover:text-[#3ecf8e] transition-all underline">Sign up now</Link>
      </p>

    </form>
  )
}
