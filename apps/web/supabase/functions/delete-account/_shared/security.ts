/**
 * Security Utilities for Edge Functions
 * Provides rate limiting, request validation, and security helpers
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Rate limiting storage (in-memory, for production use Redis or Supabase)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Rate limiting middleware
 * @param userId - User ID or IP address
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns {Promise<{allowed: boolean, remaining?: number, resetAt?: number}>}
 */
export async function rateLimit(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute default
): Promise<{ allowed: boolean; remaining?: number; resetAt?: number; error?: string }> {
  const now = Date.now()
  const key = `ratelimit:${userId}`
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetAt) {
    // New window or expired
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      error: `Rate limit exceeded. Please try again after ${Math.ceil((record.resetAt - now) / 1000)} seconds.`,
    }
  }

  record.count++
  rateLimitStore.set(key, record)
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  }
}

/**
 * Validate request body against schema
 * @param body - Request body
 * @param schema - Validation schema
 * @returns {Promise<{valid: boolean, error?: string, data?: any}>}
 */
export function validateRequest(body: any, schema: {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object'
    required?: boolean
    min?: number
    max?: number
    pattern?: RegExp
    enum?: any[]
  }
}): { valid: boolean; error?: string; data?: any } {
  const errors: string[] = []
  const validated: any = {}

  for (const [key, rules] of Object.entries(schema)) {
    const value = body[key]

    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`)
      continue
    }

    // Skip if not required and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue
    }

    // Type validation
    if (value !== undefined && value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value
      if (actualType !== rules.type) {
        errors.push(`${key} must be of type ${rules.type}`)
        continue
      }

      // String validations
      if (rules.type === 'string') {
        if (rules.min && value.length < rules.min) {
          errors.push(`${key} must be at least ${rules.min} characters`)
        }
        if (rules.max && value.length > rules.max) {
          errors.push(`${key} must be at most ${rules.max} characters`)
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${key} format is invalid`)
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${key} must be one of: ${rules.enum.join(', ')}`)
        }
      }

      // Number validations
      if (rules.type === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${key} must be at least ${rules.min}`)
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${key} must be at most ${rules.max}`)
        }
      }

      // Array validations
      if (rules.type === 'array') {
        if (rules.min !== undefined && value.length < rules.min) {
          errors.push(`${key} must have at least ${rules.min} items`)
        }
        if (rules.max !== undefined && value.length > rules.max) {
          errors.push(`${key} must have at most ${rules.max} items`)
        }
      }
    }

    validated[key] = value
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('; ') }
  }

  return { valid: true, data: validated }
}

/**
 * Sanitize string input to prevent XSS
 * @param input - Input string
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Sanitize object recursively
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value)
    }
    return sanitized
  }
  return obj
}

/**
 * Get user ID from request (for rate limiting)
 * @param req - Request object
 * @param supabase - Supabase client
 * @returns User ID or IP address
 */
export async function getUserIdForRateLimit(
  req: Request,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  try {
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        return user.id
      }
    }
  } catch {
    // Fall through to IP
  }

  // Fallback to IP address
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

/**
 * CORS headers
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

/**
 * Create error response
 */
export function errorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

/**
 * Create success response
 */
export function successResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}
