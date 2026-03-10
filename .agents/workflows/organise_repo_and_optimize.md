---
description: description: Organise repo, add SEO component, and apply security meta tags
---


# 📦 Organise Repo & Optimise Front‑end

## 1️⃣ Re‑structure folders
```bash
# Move auth pages
mv src/pages/LoginPage.tsx src/pages/auth/
mv src/pages/SignupPage.tsx src/pages/auth/
mv src/pages/ForgotPasswordPage.tsx src/pages/auth/
mv src/pages/OTPValidationPage.tsx src/pages/auth/
mv src/pages/ResetPasswordPage.tsx src/pages/auth/
mv src/pages/AuthPages.css src/pages/auth/
# Move home page
mv src/pages/HomePage.tsx src/pages/home/
mv src/pages/HomePage.css src/pages/home/
# Create layout folder
mkdir -p src/components/layout
mv src/components/Navbar.tsx src/components/layout/
mv src/components/Navbar.css src/components/layout/
mv src/components/Footer.tsx src/components/layout/
mv src/components/Footer.css src/components/layout/
mv src/components/ProtectedRoute.tsx src/components/layout/
# Create forms folder
mkdir -p src/components/forms
mv src/components/login-form.tsx src/components/forms/
mv src/components/signup-form.tsx src/components/forms/
mv src/components/forgot-password-form.tsx src/components/forms/
mv src/components/reset-password-form.tsx src/components/forms/
mv src/components/otp-validation-form.tsx src/components/forms/
