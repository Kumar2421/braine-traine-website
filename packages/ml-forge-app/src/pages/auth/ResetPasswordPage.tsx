import { ResetPasswordForm } from "../../components/forms/reset-password-form"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { SEO } from "../../utils/SEO"

export default function ResetPasswordPage() {
  return (
    <>
      <SEO title="Reset Password — ML Forge" />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  )
}
