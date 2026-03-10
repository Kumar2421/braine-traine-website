import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (password !== confirmPassword) { setError("Passwords do not match"); return }
    setIsLoading(true)
    try {
      const { error: resetErr } = await supabase.auth.updateUser({ password })
      if (resetErr) throw resetErr
      setSuccess("Password updated successfully!")
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.')
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
      <h1 className="text-[32px] font-normal text-[#1c1917] tracking-[-0.02em] leading-tight mb-2">Reset password</h1>
      <p className="text-[14px] text-[#78716c] mb-8">Enter your new password below</p>

      {error && <div className="mb-5 text-[13px] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-md px-3 py-2.5">{error}</div>}
      {success && <div className="mb-5 text-[13px] text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] rounded-md px-3 py-2.5">{success}</div>}

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-[6px]">
          <label htmlFor="reset-password" className="text-[13px] font-medium text-[#44403c]">New Password</label>
          <div className="relative">
            <input id="reset-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className={`${inputClass} pr-10`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#78716c] transition-colors outline-none">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-[6px]">
          <label htmlFor="reset-confirm" className="text-[13px] font-medium text-[#44403c]">Confirm New Password</label>
          <div className="relative">
            <input id="reset-confirm" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className={`${inputClass} pr-10`} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#78716c] transition-colors outline-none">
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="w-full h-[44px] bg-[#3ecf8e] hover:bg-[#2db97d] active:bg-[#27a570] text-[#022c1e] text-[15px] font-normal rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3ecf8e]/50 disabled:opacity-60 mb-6">
        {isLoading ? "Updating…" : "Reset Password"}
      </button>
    </form>
  )
}
