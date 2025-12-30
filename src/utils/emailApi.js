import { supabase } from '../supabaseClient'

/**
 * Email API for custom OTP sending and verification
 * Uses Supabase Edge Functions with Resend
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

/**
 * Send OTP to email address
 * @param {string} email - User email
 * @param {string} firstName - User first name
 * @param {string} lastName - User last name
 * @param {string} password - User password (will be sent securely to Edge Function)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendOTP(email, firstName, lastName, password) {
  try {
    // Call Edge Function directly with fetch (bypasses JWT requirement for unauthenticated requests)
    const response = await fetch(`${supabaseUrl}/functions/v1/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        email: email.trim(),
        firstName: firstName?.trim() || '',
        lastName: lastName?.trim() || '',
        password: password, // Password sent securely to Edge Function
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to send OTP')
    }

    if (data?.error) {
      return { success: false, error: data.error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return {
      success: false,
      error: error.message || 'Failed to send OTP. Please try again.'
    }
  }
}

/**
 * Verify OTP code
 * @param {string} email - User email
 * @param {string} code - OTP code
 * @returns {Promise<{success: boolean, user?: object, session?: object, error?: string}>}
 */
export async function verifyOTP(email, code) {
  try {
    // Call Edge Function directly with fetch (bypasses JWT requirement for unauthenticated requests)
    const response = await fetch(`${supabaseUrl}/functions/v1/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        email: email.trim(),
        code: code.trim(),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to verify OTP')
    }

    if (data?.error) {
      return { success: false, error: data.error }
    }

    if (data?.session && data?.user) {
      // Update Supabase client session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })

      if (sessionError) {
        console.error('Error setting session:', sessionError)
        return { success: false, error: 'Failed to create session. Please try again.' }
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      }
    }

    // Handle case where password login is required (user created but session couldn't be created)
    if (data?.requiresPasswordLogin) {
      return {
        success: true, // Account was created successfully
        user: data.user,
        requiresPasswordLogin: true,
        message: data.message || 'Account created successfully. Please log in with your password to continue.'
      }
    }

    // Handle case where account already exists
    if (data?.requiresLogin) {
      return {
        success: false,
        error: data.error || 'An account with this email already exists. Please log in instead.',
        requiresLogin: true
      }
    }

    return { success: false, error: 'Invalid response from server' }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return {
      success: false,
      error: error.message || 'Failed to verify OTP. Please try again.'
    }
  }
}

// Note: Password hashing is handled by Supabase Auth internally
// We send the plain password securely to the Edge Function
// which then passes it to Supabase Auth for proper hashing

