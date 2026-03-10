import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"

export function OTPValidationForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
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
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      })
      if (verifyErr) throw verifyErr
      navigate("/dashboard")
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid OTP. Please try again.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Verify OTP</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter the 6-digit code sent to {email}
        </p>
      </div>

      {error && <div className="text-sm text-red-500 text-center">{error}</div>}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="000000"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isLoading}
            className="text-center text-2xl tracking-widest"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>
      </div>
    </form>
  )
}
