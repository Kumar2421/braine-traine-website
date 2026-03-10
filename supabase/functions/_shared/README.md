# Shared Edge Function Utilities

This directory contains shared utilities for Edge Functions to ensure consistency, security, and maintainability.

## Files

### `security.ts`
Provides security utilities:
- **Rate Limiting**: Prevents abuse with configurable limits
- **Request Validation**: Schema-based validation for request bodies
- **Input Sanitization**: XSS prevention and input cleaning
- **Error Handling**: Standardized error responses
- **CORS Headers**: Consistent CORS configuration

### `validation-schemas.ts`
Reusable validation schemas for common request types:
- Plan keys
- Billing intervals
- Subscription IDs
- Coupon codes
- Email addresses
- And more...

## Usage

```typescript
import { 
  rateLimit, 
  validateRequest, 
  sanitizeObject, 
  getUserIdForRateLimit,
  errorResponse,
  successResponse,
  corsHeaders 
} from '../_shared/security.ts'
import { createOrderSchema } from '../_shared/validation-schemas.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Rate limiting
  const userId = await getUserIdForRateLimit(req, supabase)
  const rateLimitResult = await rateLimit(userId, 10, 60000)
  if (!rateLimitResult.allowed) {
    return errorResponse(rateLimitResult.error || 'Rate limit exceeded', 429)
  }

  // Validate request
  const body = sanitizeObject(await req.json())
  const validation = validateRequest(body, createOrderSchema)
  if (!validation.valid) {
    return errorResponse(validation.error || 'Invalid request', 400)
  }

  // Use validated data
  const { plan_key, billing_interval } = validation.data!

  // ... your logic ...

  return successResponse({ success: true })
})
```

## Rate Limiting

Rate limits are applied per user (or IP if not authenticated):
- Default: 10 requests per minute
- Configurable per endpoint
- Returns 429 status when exceeded

## Request Validation

All request bodies should be validated using schemas:
- Type checking
- Required field validation
- Min/max length/values
- Pattern matching (regex)
- Enum validation

## Security Best Practices

1. Always validate and sanitize input
2. Apply rate limiting to prevent abuse
3. Use errorResponse/successResponse for consistent responses
4. Don't expose internal error details in production
5. Verify authentication before processing requests

