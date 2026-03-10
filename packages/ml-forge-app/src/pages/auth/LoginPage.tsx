import { LoginForm } from "../../components/forms/login-form"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { SEO } from "../../utils/SEO"

export default function LoginPage() {
  return (
    <>
      <SEO title="Sign In — ML Forge" />
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </>
  )
}
