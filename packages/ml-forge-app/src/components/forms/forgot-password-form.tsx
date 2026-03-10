import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (resetErr) throw resetErr
      setSuccess("If an account exists for this email, a password reset link has been sent.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email.")
    } finally { setIsLoading(false) }
  }

  const inputClass = `
    w-full h-[40px] px-3 text-[14px] text-[#1c1917]
    bg-white border border-[#d4d4d8] rounded-md
    placeholder:text-[#a1a1aa]
    outline-none transition-all duration-150
    hover:border-[#a1a1aa]
    focus:ring-2 focus:ring-[#3ecf8e]/25 focus:border-[#3ecf8e]
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  return (
    <form className="flex flex-col w-full" onSubmit={handleSubmit} noValidate>
      <h1 className="text-[32px] font-normal text-[#1c1917] tracking-[-0.02em] leading-tight mb-2">Forgot password</h1>
      <p className="text-[14px] text-[#78716c] mb-8">Enter your email to receive a password reset link</p>

      {error && <div className="mb-5 text-[13px] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-md px-3 py-2.5">{error}</div>}
      {success && <div className="mb-5 text-[13px] text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] rounded-md px-3 py-2.5">{success}</div>}

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-[6px]">
          <label htmlFor="forgot-email" className="text-[13px] font-medium text-[#44403c]">Email</label>
          <input id="forgot-email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className={inputClass} />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="w-full h-[44px] bg-[#3ecf8e] hover:bg-[#2db97d] active:bg-[#27a570] text-[#022c1e] text-[15px] font-normal rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3ecf8e]/50 disabled:opacity-60 mb-6">
        {isLoading ? "Sending…" : "Send Reset Link"}
      </button>

      <p className="text-center text-[14px] text-[#78716c]">
        Remembered your password?{" "}
        <Link to="/login" className="text-[#1c1917] underline underline-offset-2 decoration-[#a1a1aa] hover:decoration-[#44403c] transition-all">Back to login</Link>
      </p>
    </form>
  )
}
