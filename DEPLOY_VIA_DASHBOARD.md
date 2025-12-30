# Deploy Edge Functions via Supabase Dashboard

## Quick Setup (5 minutes)

### Step 1: Set Environment Variables (Secrets)

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **Edge Functions** in the left sidebar
4. Click the **Settings** (gear icon) at the top right
5. Click on the **Secrets** tab
6. Add these two secrets:

   **Secret 1:**
   - Click **Add Secret**
   - Name: `RESEND_API_KEY`
   - Value: `re_Q8qgiqvX_AES8hRLbpVYvg4aiacH5McYn`
   - Click **Save**

   **Secret 2:**
   - Click **Add Secret**
   - Name: `RESEND_FROM_EMAIL`
   - Value: `onboarding@resend.dev`
   - Click **Save**

✅ **Done!** Your secrets are now configured.

---

### Step 2: Deploy `send-otp` Function

1. In **Edge Functions** page, click **Create Function** button (or find existing `send-otp` and click **Edit**)
2. Function name: `send-otp` (must match exactly)
3. Open the file `supabase/functions/send-otp/index.ts` in your code editor
4. **Select ALL** the code (Ctrl+A) and **Copy** (Ctrl+C)
5. Go back to Supabase Dashboard
6. **Paste** the code into the code editor
7. Click **Deploy** button (or **Update** if editing existing function)
8. Wait for deployment to complete (you'll see a success message)

✅ **Done!** `send-otp` function is deployed.

---

### Step 3: Deploy `verify-otp` Function

1. In **Edge Functions** page, click **Create Function** button (or find existing `verify-otp` and click **Edit**)
2. Function name: `verify-otp` (must match exactly)
3. Open the file `supabase/functions/verify-otp/index.ts` in your code editor
4. **Select ALL** the code (Ctrl+A) and **Copy** (Ctrl+C)
5. Go back to Supabase Dashboard
6. **Paste** the code into the code editor
7. Click **Deploy** button (or **Update** if editing existing function)
8. Wait for deployment to complete

✅ **Done!** `verify-otp` function is deployed.

---

## Verify Deployment

1. Go to **Edge Functions** page
2. You should see both functions listed:
   - ✅ `send-otp`
   - ✅ `verify-otp`
3. Click on each function to see its details and URL

---

## Test It!

1. Go to your website: `http://localhost:5173/signup`
2. Fill in the signup form
3. Click **Sign Up**
4. Check your email for the OTP code
5. Enter the OTP code
6. Complete signup!

---

## Troubleshooting

### Functions not showing up?
- Make sure you're in the correct Supabase project
- Refresh the page
- Check that function names match exactly (case-sensitive)

### Email not sending?
- Go to **Edge Functions** → `send-otp` → **Logs** tab
- Check for error messages
- Verify secrets are set correctly (Step 1)

### "RESEND_API_KEY is not configured" error?
- Go back to **Edge Functions** → **Settings** → **Secrets**
- Verify `RESEND_API_KEY` is set correctly
- Make sure there are no extra spaces

---

## That's It! 🎉

Your Edge Functions are now deployed and ready to use!

