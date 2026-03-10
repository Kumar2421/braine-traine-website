import { OTPValidationForm } from "../../components/forms/otp-validation-form"
import { AuthLayout } from "../../components/auth/AuthLayout"
import { SEO } from "../../utils/SEO"

export default function OTPValidationPage() {
  return (
    <>
      <SEO title="Verify OTP — ML Forge" />
      <AuthLayout>
        <OTPValidationForm />
      </AuthLayout>
    </>
  )
}
