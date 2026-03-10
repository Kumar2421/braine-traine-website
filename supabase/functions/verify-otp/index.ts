import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Note: Supabase automatically validates the anon key when called via supabase.functions.invoke()
    // For OTP verification during signup, we allow unauthenticated requests
    // The anon key is automatically validated by Supabase's infrastructure

    const { email, code } = await req.json()

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Use service role key to bypass RLS for OTP verification
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Normalize inputs
    const normalizedEmail = email.toLowerCase().trim()
    const normalizedCode = code.trim()
    const now = new Date().toISOString()

    // Find valid OTP - use service role to bypass RLS
    const { data: otpData, error: findError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', normalizedCode)
      .eq('used', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Log for debugging
    if (findError) {
      console.error('OTP lookup error:', findError)
      console.error('Query params:', { email: normalizedEmail, code: normalizedCode })
    }

    if (!otpData) {
      // Try to find any OTP for this email to provide better error message
      const { data: anyOtp } = await supabaseAdmin
        .from('otp_codes')
        .select('code, expires_at, used, created_at')
        .eq('email', normalizedEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      let errorMessage = 'Invalid or expired OTP code'
      
      if (anyOtp) {
        const isExpired = new Date(anyOtp.expires_at) < new Date()
        const isUsed = anyOtp.used
        const codeMatches = anyOtp.code === normalizedCode
        
        console.error('OTP found but invalid:', {
          codeMatch: codeMatches,
          expired: isExpired,
          used: isUsed,
          expiresAt: anyOtp.expires_at,
          now: new Date().toISOString()
        })
        
        if (isUsed) {
          errorMessage = 'This OTP code has already been used. Please request a new code.'
        } else if (isExpired) {
          errorMessage = 'This OTP code has expired. Please request a new code.'
        } else if (!codeMatches) {
          errorMessage = 'Invalid OTP code. Please check the code and try again.'
        }
      } else {
        console.error('No OTP found for email:', normalizedEmail)
        errorMessage = 'No OTP code found for this email. Please request a new code.'
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { firstName, lastName, password } = otpData.user_data || {}

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is missing. Please request a new OTP.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user already exists using Admin API
    const checkUserResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(normalizedEmail)}`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    )

    let existingUser: any = null
    if (checkUserResponse.ok) {
      const usersData = await checkUserResponse.json()
      existingUser = usersData.users?.[0] || null
    }

    if (existingUser) {
      // Check if user has a password (has email identity with password)
      const hasPassword = existingUser.identities?.some(
        (identity: any) => identity.provider === 'email' && identity.provider_id === existingUser.email
      )

      // Check if user only has OAuth providers (no email/password)
      const hasOAuthOnly = existingUser.identities?.every(
        (identity: any) => identity.provider !== 'email'
      )

      if (hasOAuthOnly && !hasPassword) {
        // User exists via OAuth but no password - allow setting password
        console.log('User exists via OAuth only, setting password...')

        const updateUserResponse = await fetch(
          `${supabaseUrl}/auth/v1/admin/users/${existingUser.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              password: password,
              user_metadata: {
                first_name: firstName || existingUser.user_metadata?.first_name || '',
                last_name: lastName || existingUser.user_metadata?.last_name || '',
              }
            }),
          }
        )

        if (!updateUserResponse.ok) {
          const errorData = await updateUserResponse.json().catch(() => ({ message: 'Failed to set password' }))
          console.error('Failed to set password for OAuth user:', errorData)
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to set password. Please try logging in with Google, or contact support if you need help.',
              requiresLogin: true
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const updatedUserData = await updateUserResponse.json()
        console.log('Password set successfully for OAuth user')

        // Mark OTP as used
        await supabaseAdmin
          .from('otp_codes')
          .update({ used: true })
          .eq('id', otpData.id)

        // Wait a moment for password to be available in Supabase Auth
        // Sometimes there's a slight delay before password login is available
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Try to create session using password grant (with retries)
        let sessionResult = null
        let sessionCreated = false
        const maxRetries = 3
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          const sessionResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
              email: normalizedEmail,
              password: password,
            }),
          })

          if (sessionResponse.ok) {
            sessionResult = await sessionResponse.json()
            sessionCreated = true
            break
          } else {
            const errorData = await sessionResponse.json().catch(() => ({ message: 'Failed to create session' }))
            console.error(`Session creation attempt ${attempt} failed:`, errorData)
            
            // If not the last attempt, wait before retrying
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
            }
          }
        }

        if (!sessionCreated) {
          // Password was set but session creation failed - user needs to log in manually
          console.error('Session creation failed after setting password')
          return new Response(
            JSON.stringify({
              success: true,
              user: updatedUserData,
              requiresPasswordLogin: true,
              message: 'Password set successfully! Please log in with your email and password to continue.'
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            user: updatedUserData,
            session: {
              access_token: sessionResult.access_token,
              refresh_token: sessionResult.refresh_token,
              expires_in: sessionResult.expires_in,
              token_type: sessionResult.token_type,
              user: updatedUserData,
            }
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        // User exists and has password - ask them to log in
        // Check if they also have OAuth to provide better message
        const hasOAuth = existingUser.identities?.some(
          (identity: any) => identity.provider === 'google' || identity.provider === 'oauth'
        )
        
        const errorMessage = hasOAuth
          ? 'An account with this email already exists. Please log in with your password or use "Continue with Google".'
          : 'An account with this email already exists. Please log in instead.'
        
        return new Response(
          JSON.stringify({
            success: false,
            error: errorMessage,
            requiresLogin: true
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Create new user account using Admin API REST endpoint
    const createUserPayload = {
      email: normalizedEmail,
      password: password, // Supabase handles password hashing internally
      email_confirm: true, // Auto-confirm email since we verified via OTP
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
      }
    }

    console.log('Creating user with email:', normalizedEmail)
    console.log('Password length:', password?.length || 0)

    const createUserResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify(createUserPayload),
      }
    )

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.json().catch(() => ({ message: 'Failed to create user' }))
      console.error('Sign up error:', errorData)
      console.error('Response status:', createUserResponse.status)

      // Check if user already exists error
      if (errorData.message?.includes('already registered') || errorData.message?.includes('already exists') || errorData.error?.includes('already')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'An account with this email already exists. Please log in instead.',
            requiresLogin: true
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      throw new Error(errorData.message || errorData.error || 'Failed to create user')
    }

    const userData = await createUserResponse.json()
    console.log('User created successfully:', userData.id)

    // Mark OTP as used
    await supabaseAdmin
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpData.id)

    // Create session for the new user using password grant
    // Note: There might be a slight delay before the password is available for login
    // So we'll try to create a session with retries, but if it fails, we'll return the user data
    // and let the frontend handle the login
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second for password to be available
    
    let sessionResult = null
    let sessionCreated = false
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const sessionResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: password,
        }),
      })

      if (sessionResponse.ok) {
        sessionResult = await sessionResponse.json()
        sessionCreated = true
        break
      } else {
        const errorData = await sessionResponse.json().catch(() => ({ message: 'Failed to create session' }))
        console.error(`Session creation attempt ${attempt} failed:`, errorData)
        
        // If not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
        }
      }
    }

    if (!sessionCreated) {
      console.error('Session creation failed after retries - user will need to log in manually')
      // Return user data without session - frontend can try logging in
      return new Response(
        JSON.stringify({
          success: true,
          user: userData,
          requiresPasswordLogin: true,
          message: 'Account created successfully! Please log in with your email and password to continue.'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: userData,
        session: {
          access_token: sessionResult.access_token,
          refresh_token: sessionResult.refresh_token,
          expires_in: sessionResult.expires_in,
          token_type: sessionResult.token_type,
          user: userData,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to verify OTP. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

