import { useState } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
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
      const redirectTo = `${window.location.origin}/reset-password`
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
      if (resetErr) throw resetErr
      setSuccess("If an account exists for this email, a password reset link has been sent.")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to send reset email. Please try again."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email to receive a password reset link
        </p>
      </div>

      {error && <div className="text-sm text-red-500 text-center">{error}</div>}
      {success && <div className="text-sm text-green-500 text-center">{success}</div>}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Remembered your password?{" "}
        <Link to="/login" className="underline underline-offset-4">
          Back to login
        </Link>
      </div>
    </form>
  )
}
