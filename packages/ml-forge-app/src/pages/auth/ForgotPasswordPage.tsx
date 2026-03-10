import { ForgotPasswordForm } from "../../components/forms/forgot-password-form"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { SEO } from "../../utils/SEO"

export default function ForgotPasswordPage() {
  return (
    <>
      <SEO title="Forgot Password — ML Forge" />
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  )
}
