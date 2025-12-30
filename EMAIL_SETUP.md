# Custom Email Setup with Nodemailer

This guide explains how to set up custom email sending using Nodemailer instead of Supabase's built-in SMTP.

## Prerequisites

1. **SMTP Provider Account**: You need an SMTP provider account. Popular options:
   - **Gmail** (free, requires App Password)
   - **SendGrid** (free tier available)
   - **Mailgun** (free tier available)
   - **Amazon SES** (pay-as-you-go)
   - **Resend** (free tier available)
   - Any SMTP provider

2. **Supabase Project**: Your Supabase project with Edge Functions enabled

## Step 1: Run Database Migration

Run the SQL migration to create the OTP storage table:

```sql
-- Run supabase_otp_storage.sql in Supabase Dashboard → SQL Editor
```

This creates the `otp_codes` table to temporarily store OTP codes.

## Step 2: Deploy Edge Functions

Deploy the two Edge Functions to Supabase:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy send-otp
supabase functions deploy verify-otp
```

Or deploy via Supabase Dashboard:
1. Go to **Edge Functions** → **Create Function**
2. Create `send-otp` and `verify-otp` functions
3. Copy the code from `supabase/functions/send-otp/index.ts` and `supabase/functions/verify-otp/index.ts`

## Step 3: Configure Environment Variables

In Supabase Dashboard → **Edge Functions** → **Settings** → **Secrets**, add:

### Required Variables:

```
SMTP_HOST=smtp.gmail.com          # Your SMTP server hostname
SMTP_PORT=587                     # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com    # Your SMTP username/email
SMTP_PASSWORD=your-app-password   # Your SMTP password or API key
SMTP_FROM_EMAIL=noreply@yourdomain.com  # Sender email address
SMTP_FROM_NAME=BrainTrain         # Sender display name
```

### Supabase Variables (usually auto-set):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 4: SMTP Provider Setup Examples

### Gmail Setup:

1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use these settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   ```

### SendGrid Setup:

1. Create account at [SendGrid](https://sendgrid.com)
2. Create API Key in Settings → API Keys
3. Use these settings:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   ```

### Mailgun Setup:

1. Create account at [Mailgun](https://mailgun.com)
2. Get SMTP credentials from Dashboard → Sending → SMTP
3. Use these settings:
   ```
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=your-mailgun-smtp-username
   SMTP_PASSWORD=your-mailgun-smtp-password
   ```

## Step 5: Test the Setup

1. Go to your signup page (`/signup`)
2. Fill in the form and submit
3. Check your email for the OTP code
4. Enter the OTP code to verify

## Troubleshooting

### Email Not Sending:

1. **Check Edge Function Logs**:
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for error messages

2. **Verify SMTP Credentials**:
   - Double-check all environment variables are set correctly
   - Test SMTP connection using a tool like [Mailtrap](https://mailtrap.io)

3. **Check SMTP Provider Limits**:
   - Free tiers often have rate limits
   - Check your provider's dashboard for quota

4. **Verify Email Address**:
   - Ensure sender email is verified with your SMTP provider
   - Some providers require domain verification

### OTP Not Verifying:

1. **Check OTP Expiry**: OTPs expire after 10 minutes
2. **Check Database**: Verify OTP is stored in `otp_codes` table
3. **Check Logs**: Look for errors in Edge Function logs

### Common Errors:

- **"SMTP configuration is missing"**: Set all required environment variables
- **"Invalid credentials"**: Check SMTP_USER and SMTP_PASSWORD
- **"Connection timeout"**: Check SMTP_HOST and SMTP_PORT
- **"Rate limit exceeded"**: Wait a few minutes or upgrade your SMTP plan

## Security Notes

1. **Password Hashing**: Passwords are hashed using SHA-256 on the frontend before sending to the Edge Function
2. **OTP Expiry**: OTPs expire after 10 minutes
3. **One-Time Use**: OTPs can only be used once
4. **Environment Variables**: Never commit SMTP credentials to your repository
5. **HTTPS**: Always use HTTPS in production

## Production Recommendations

1. **Use Dedicated SMTP Service**: For production, use a dedicated service like SendGrid, Mailgun, or Amazon SES
2. **Domain Verification**: Verify your domain with your SMTP provider for better deliverability
3. **Rate Limiting**: Implement rate limiting on the frontend to prevent abuse
4. **Monitoring**: Set up monitoring for email delivery rates
5. **Backup Provider**: Consider having a backup SMTP provider

## Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Verify all environment variables are set
3. Test SMTP connection independently
4. Check your SMTP provider's status page

