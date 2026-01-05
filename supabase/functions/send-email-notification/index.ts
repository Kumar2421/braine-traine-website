// Send Email Notification Edge Function
// Handles email notifications for subscription events, user activities, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  rateLimit, 
  validateRequest, 
  sanitizeObject, 
  getUserIdForRateLimit,
  errorResponse,
  successResponse,
  corsHeaders 
} from '../_shared/security.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Email templates
const emailTemplates = {
  subscription_confirmation: (data: any) => ({
    subject: 'Subscription Confirmed - ML FORGE',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #14b8a6; color: #fff; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ML FORGE</h1>
          </div>
          <div class="content">
            <h2>Subscription Confirmed!</h2>
            <p>Your subscription to <strong>${data.plan_name}</strong> has been confirmed.</p>
            <p><strong>Amount:</strong> ₹${data.amount}</p>
            <p><strong>Billing Interval:</strong> ${data.billing_interval}</p>
            <p><strong>Next Billing Date:</strong> ${data.next_billing_date}</p>
            <p>Thank you for choosing ML FORGE!</p>
            <a href="${supabaseUrl.replace('/rest/v1', '')}/subscription" class="button">Manage Subscription</a>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
  welcome: (data: any) => ({
    subject: 'Welcome to ML FORGE!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ML FORGE!</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name}!</h2>
            <p>Welcome to ML FORGE - your unified IDE for Machine Learning.</p>
            <p>Get started by:</p>
            <ul>
              <li>Downloading the ML FORGE IDE</li>
              <li>Creating your first project</li>
              <li>Exploring our documentation</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
  // Add more templates as needed
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Missing authorization header', 401)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Rate limiting
    const userId = await getUserIdForRateLimit(req, supabase)
    const rateLimitResult = await rateLimit(userId, 10, 60000) // 10 emails per minute
    if (!rateLimitResult.allowed) {
      return errorResponse(rateLimitResult.error || 'Rate limit exceeded', 429)
    }

    // Parse and validate request
    let body
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid JSON in request body', 400)
    }

    body = sanitizeObject(body)

    const { to, subject, template, data } = body

    if (!to || !subject || !template) {
      return errorResponse('Missing required fields: to, subject, template', 400)
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return errorResponse('Invalid email address', 400)
    }

    // Get template
    const templateFn = emailTemplates[template as keyof typeof emailTemplates]
    if (!templateFn) {
      return errorResponse('Invalid template', 400)
    }

    const emailContent = templateFn(data || {})

    // In production, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Mailgun
    // For now, we'll log it and return success
    console.log('Email notification:', {
      to,
      subject: emailContent.subject || subject,
      template,
      timestamp: new Date().toISOString(),
    })

    // TODO: Integrate with actual email service
    // Example with Resend:
    // const resendResponse = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'ML FORGE <noreply@mlforge.com>',
    //     to: [to],
    //     subject: emailContent.subject || subject,
    //     html: emailContent.html,
    //   }),
    // })

    return successResponse({
      success: true,
      message: 'Email notification queued',
      // In production, return actual email ID
    })
  } catch (error) {
    console.error('Error sending email notification:', error)
    return errorResponse('Failed to send email notification', 500)
  }
})

