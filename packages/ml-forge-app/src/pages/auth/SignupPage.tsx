import { SignupForm } from "../../components/forms/signup-form"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { SEO } from "../../utils/SEO"

export default function SignupPage() {
  return (
    <>
      <SEO title="Sign Up — ML Forge" />
      <AuthLayout>
        <SignupForm />
      </AuthLayout>
    </>
  )
}
