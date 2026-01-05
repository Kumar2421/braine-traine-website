/**
 * Error Tracking with Sentry
 * Provides enterprise-grade error tracking and monitoring
 */

// Initialize Sentry (will be loaded dynamically)
let Sentry = null
let isInitialized = false

/**
 * Initialize Sentry error tracking
 * @param {string} dsn - Sentry DSN (optional, can be from env)
 */
export async function initErrorTracking(dsn = null) {
    if (isInitialized) return

    try {
        // Load Sentry SDK dynamically
        const SentryModule = await import('@sentry/react')
        Sentry = SentryModule

        const sentryDsn = dsn || import.meta.env.VITE_SENTRY_DSN

        if (!sentryDsn) {
            console.warn('Sentry DSN not configured. Error tracking disabled.')
            return
        }

        Sentry.init({
            dsn: sentryDsn,
            environment: import.meta.env.MODE || 'development',
            integrations: [
                new Sentry.BrowserTracing(),
                new Sentry.Replay({
                    maskAllText: true,
                    blockAllMedia: true,
                }),
            ],
            // Performance Monitoring
            tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
            // Session Replay
            replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 0.5,
            replaysOnErrorSampleRate: 1.0,
            // Filter sensitive data
            beforeSend(event, hint) {
                // Remove sensitive data from errors
                if (event.request) {
                    // Remove passwords, tokens, etc.
                    if (event.request.data) {
                        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization']
                        sensitiveKeys.forEach(key => {
                            if (event.request.data[key]) {
                                event.request.data[key] = '[Filtered]'
                            }
                        })
                    }
                }
                return event
            },
        })

        isInitialized = true
        console.log('Sentry error tracking initialized')
    } catch (error) {
        console.error('Failed to initialize Sentry:', error)
    }
}

/**
 * Capture exception
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
export function captureException(error, context = {}) {
    if (!Sentry || !isInitialized) {
        console.error('Error (Sentry not initialized):', error, context)
        return
    }

    Sentry.captureException(error, {
        extra: context,
        tags: {
            component: context.component || 'unknown',
        },
    })
}

/**
 * Capture message
 * @param {string} message - Message to log
 * @param {string} level - Log level (info, warning, error)
 * @param {Object} context - Additional context
 */
export function captureMessage(message, level = 'info', context = {}) {
    if (!Sentry || !isInitialized) {
        console.log(`[${level}] ${message}`, context)
        return
    }

    Sentry.captureMessage(message, {
        level: level,
        extra: context,
    })
}

/**
 * Set user context for error tracking
 * @param {Object} user - User object
 */
export function setUserContext(user) {
    if (!Sentry || !isInitialized) return

    Sentry.setUser({
        id: user?.id,
        email: user?.email,
        // Don't include sensitive data
    })
}

/**
 * Clear user context
 */
export function clearUserContext() {
    if (!Sentry || !isInitialized) return
    Sentry.setUser(null)
}

/**
 * Add breadcrumb for debugging
 * @param {string} message - Breadcrumb message
 * @param {string} category - Category
 * @param {string} level - Level (info, warning, error)
 */
export function addBreadcrumb(message, category = 'default', level = 'info') {
    if (!Sentry || !isInitialized) return

    Sentry.addBreadcrumb({
        message,
        category,
        level,
        timestamp: Date.now() / 1000,
    })
}

/**
 * Set tag for filtering
 * @param {string} key - Tag key
 * @param {string} value - Tag value
 */
export function setTag(key, value) {
    if (!Sentry || !isInitialized) return
    Sentry.setTag(key, value)
}

/**
 * Performance monitoring - start transaction
 * @param {string} name - Transaction name
 * @param {string} op - Operation type
 * @returns {Object} Transaction object
 */
export function startTransaction(name, op = 'navigation') {
    if (!Sentry || !isInitialized) return null
    return Sentry.startTransaction({ name, op })
}

/**
 * Error boundary wrapper for React components
 */
export const ErrorBoundary = null // Will be set when Sentry is loaded

// Auto-initialize if DSN is available
if (import.meta.env.VITE_SENTRY_DSN) {
    initErrorTracking().catch(err => {
        console.error('Failed to auto-initialize Sentry:', err)
    })
}

