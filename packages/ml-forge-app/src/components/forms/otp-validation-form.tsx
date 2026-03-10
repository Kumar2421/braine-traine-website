import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"

export function OTPValidationForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ""
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const { error: verifyErr } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' })
      if (verifyErr) throw verifyErr
      navigate("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.')
    } finally { setIsLoading(false) }
  }

  return (
    <form className="flex flex-col w-full" onSubmit={handleSubmit} noValidate>
      <h1 className="text-[32px] font-normal text-[#1c1917] tracking-[-0.02em] leading-tight mb-2">Verify OTP</h1>
      <p className="text-[14px] text-[#78716c] mb-8">
        Enter the 6-digit code sent to <span className="text-[#1c1917] font-medium">{email || "your email"}</span>
      </p>

      {error && <div className="mb-5 text-[13px] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-md px-3 py-2.5">{error}</div>}

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-[6px]">
          <label htmlFor="otp-code" className="text-[13px] font-medium text-[#44403c]">Verification Code</label>
          <input
            id="otp-code"
            type="text"
            placeholder="000000"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={isLoading}
            className="
              w-full h-[52px] px-3 text-[24px] text-[#1c1917] text-center tracking-[0.3em] font-mono
              bg-white border border-[#d4d4d8] rounded-md
              placeholder:text-[#d4d4d8] placeholder:tracking-[0.3em]
              outline-none transition-all duration-150
              hover:border-[#a1a1aa]
              focus:ring-2 focus:ring-[#3ecf8e]/25 focus:border-[#3ecf8e]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="w-full h-[44px] bg-[#3ecf8e] hover:bg-[#2db97d] active:bg-[#27a570] text-[#022c1e] text-[15px] font-normal rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3ecf8e]/50 disabled:opacity-60 mb-6">
        {isLoading ? "Verifying…" : "Verify OTP"}
      </button>

      <p className="text-center text-[12px] text-[#a1a1aa] leading-relaxed">
        Didn&apos;t receive a code? Check your spam folder or{" "}
        <button type="button" className="underline underline-offset-2 hover:text-[#78716c] transition-colors">request a new code</button>.
      </p>
    </form>
  )
}
