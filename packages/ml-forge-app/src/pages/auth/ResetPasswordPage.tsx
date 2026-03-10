import { SEO } from "../../utils/SEO";
import { GalleryVerticalEnd } from "lucide-react"
import { ResetPasswordForm } from "../../components/forms/reset-password-form"
import authHeroImage from "../../assets/WhatsApp Image 2026-02-28 at 11.55.29 AM.jpeg"

export default function ResetPasswordPage() {
  return (
    <>
      <SEO title="ResetPassword" />
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="/" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              ML Forge
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <ResetPasswordForm />
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <img
            src={authHeroImage}
            alt="ML Forge Auth Hero"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4]"
          />
        </div>
      </div>
    </>
  )
}


