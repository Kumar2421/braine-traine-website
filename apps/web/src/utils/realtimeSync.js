/**
 * Real-Time Sync Utilities
 * Supabase Realtime subscriptions for live updates between web and IDE
 */

import { supabase } from '../supabaseClient'

/**
 * Subscribe to usage tracking updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function when data changes
 * @returns {Function} Unsubscribe function
 */
export function subscribeToUsageTracking(userId, callback) {
    if (!userId) {
        console.warn('subscribeToUsageTracking: userId is required')
        return () => {}
    }

    const channel = supabase
        .channel(`usage_tracking:${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*', // INSERT, UPDATE, DELETE
                schema: 'public',
                table: 'usage_tracking',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                callback(payload)
            }
        )
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
}

/**
 * Subscribe to subscription updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function when subscription changes
 * @returns {Function} Unsubscribe function
 */
export function subscribeToSubscriptionUpdates(userId, callback) {
    if (!userId) {
        console.warn('subscribeToSubscriptionUpdates: userId is required')
        return () => {}
    }

    const channel = supabase
        .channel(`subscriptions:${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'subscriptions',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                callback(payload)
            }
        )
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
}

/**
 * Subscribe to IDE sync events
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function when sync events occur
 * @returns {Function} Unsubscribe function
 */
export function subscribeToIDESyncEvents(userId, callback) {
    if (!userId) {
        console.warn('subscribeToIDESyncEvents: userId is required')
        return () => {}
    }

    const channel = supabase
        .channel(`ide_sync_events:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'ide_sync_events',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                callback(payload)
            }
        )
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
}

/**
 * Subscribe to models updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function when models change
 * @returns {Function} Unsubscribe function
 */
export function subscribeToModelsUpdates(userId, callback) {
    if (!userId) {
        console.warn('subscribeToModelsUpdates: userId is required')
        return () => {}
    }

    const channel = supabase
        .channel(`models:${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'models',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                callback(payload)
            }
        )
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
}

/**
 * Subscribe to training runs updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function when training runs change
 * @returns {Function} Unsubscribe function
 */
export function subscribeToTrainingRunsUpdates(userId, callback) {
    if (!userId) {
        console.warn('subscribeToTrainingRunsUpdates: userId is required')
        return () => {}
    }

    const channel = supabase
        .channel(`training_runs:${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'training_runs',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                callback(payload)
            }
        )
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
}

/**
 * Subscribe to projects updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function when projects change
 * @returns {Function} Unsubscribe function
 */
export function subscribeToProjectsUpdates(userId, callback) {
    if (!userId) {
        console.warn('subscribeToProjectsUpdates: userId is required')
        return () => {}
    }

    const channel = supabase
        .channel(`projects:${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'projects',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                callback(payload)
            }
        )
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
}

/**
 * Subscribe to multiple real-time updates
 * @param {string} userId - User ID
 * @param {Object} callbacks - Object with callback functions for each subscription type
 * @returns {Function} Unsubscribe function for all subscriptions
 */
export function subscribeToAllUpdates(userId, callbacks = {}) {
    if (!userId) {
        console.warn('subscribeToAllUpdates: userId is required')
        return () => {}
    }

    const unsubscribers = []

    if (callbacks.usageTracking) {
        unsubscribers.push(subscribeToUsageTracking(userId, callbacks.usageTracking))
    }

    if (callbacks.subscription) {
        unsubscribers.push(subscribeToSubscriptionUpdates(userId, callbacks.subscription))
    }

    if (callbacks.ideSync) {
        unsubscribers.push(subscribeToIDESyncEvents(userId, callbacks.ideSync))
    }

    if (callbacks.models) {
        unsubscribers.push(subscribeToModelsUpdates(userId, callbacks.models))
    }

    if (callbacks.trainingRuns) {
        unsubscribers.push(subscribeToTrainingRunsUpdates(userId, callbacks.trainingRuns))
    }

    if (callbacks.projects) {
        unsubscribers.push(subscribeToProjectsUpdates(userId, callbacks.projects))
    }

    // Return function to unsubscribe from all
    return () => {
        unsubscribers.forEach(unsubscribe => unsubscribe())
    }
}

/**
 * Log sync event to database
 * @param {string} userId - User ID
 * @param {string} eventType - Type of sync event
 * @param {string} syncStatus - Status (success, failed, partial)
 * @param {Object} eventData - Additional event data
 * @param {string} ideVersion - IDE version
 * @param {string} idePlatform - IDE platform
 * @param {string} errorMessage - Error message if failed
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function logSyncEvent(userId, eventType, syncStatus, eventData = {}, ideVersion = null, idePlatform = null, errorMessage = null) {
    try {
        const { error } = await supabase
            .from('ide_sync_events')
            .insert({
                user_id: userId,
                event_type: eventType,
                sync_status: syncStatus,
                event_data: eventData,
                ide_version: ideVersion,
                ide_platform: idePlatform,
                error_message: errorMessage,
            })

        if (error) throw error

        return { success: true, error: null }
    } catch (error) {
        console.error('Error logging sync event:', error)
        return { success: false, error }
    }
}

