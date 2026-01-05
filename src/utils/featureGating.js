import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Feature Gating Utility
 * Checks if a user has access to specific features based on their subscription tier
 */

const FEATURE_TIERS = {
    // Free tier features
    model_zoo_basic: ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
    dataset_manager_core: ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
    annotation_studio_basic: ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
    basic_augmentations: ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
    training_small_medium: ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
    inference_execution: ['free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'],

    // Data Pro features
    face_dataset_conversion: ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
    advanced_augmentations: ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
    advanced_preprocessing: ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
    dataset_version_locking: ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],
    team_collaboration_basic: ['data_pro', 'train_pro', 'deploy_pro', 'enterprise'],

    // Train Pro features
    model_zoo_all: ['train_pro', 'deploy_pro', 'enterprise'],
    annotation_studio_full: ['train_pro', 'deploy_pro', 'enterprise'],
    review_approval_workflows: ['train_pro', 'deploy_pro', 'enterprise'],
    advanced_training_engine: ['train_pro', 'deploy_pro', 'enterprise'],
    auto_tuning: ['train_pro', 'deploy_pro', 'enterprise'],
    shared_gpu_access: ['train_pro', 'deploy_pro', 'enterprise'],
    full_training_logs: ['train_pro', 'deploy_pro', 'enterprise'],
    full_inference_visibility: ['train_pro', 'deploy_pro', 'enterprise'],
    limited_export_formats: ['train_pro', 'deploy_pro', 'enterprise'],
    limited_benchmarking: ['train_pro', 'deploy_pro', 'enterprise'],

    // Deploy Pro features
    export_formats_all: ['deploy_pro', 'enterprise'],
    full_benchmarking: ['deploy_pro', 'enterprise'],
    edge_deployment: ['deploy_pro', 'enterprise'],
    on_prem_deployment: ['deploy_pro', 'enterprise'],
    offline_deployment: ['deploy_pro', 'enterprise'],
    full_audit_logs: ['deploy_pro', 'enterprise'],
    priority_gpu_scheduling: ['deploy_pro', 'enterprise'],
}

/**
 * Get user's current subscription tier
 */
export async function getUserTier() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return 'free'

        // Check active subscription first
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_type, status')
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (subscription) {
            return subscription.plan_type
        }

        // Fallback to license
        const { data: license } = await supabase
            .from('licenses')
            .select('license_type, is_active')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('issued_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (license) {
            // Map old license types to new tiers
            const licenseType = license.license_type
            if (licenseType === 'pro') return 'train_pro'
            if (licenseType === 'enterprise') return 'enterprise'
            return licenseType
        }

        return 'free'
    } catch (error) {
        console.error('Error getting user tier:', error)
        return 'free'
    }
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(featureKey) {
    const tier = await getUserTier()
    const allowedTiers = FEATURE_TIERS[featureKey]

    if (!allowedTiers) {
        console.warn(`Unknown feature: ${featureKey}`)
        return false
    }

    return allowedTiers.includes(tier)
}

/**
 * Get all features available to user's current tier
 */
export async function getAvailableFeatures() {
    const tier = await getUserTier()
    const features = []

    for (const [featureKey, allowedTiers] of Object.entries(FEATURE_TIERS)) {
        if (allowedTiers.includes(tier)) {
            features.push(featureKey)
        }
    }

    return features
}

/**
 * Get features that require upgrade
 */
export async function getUpgradeRequiredFeatures() {
    const tier = await getUserTier()
    const upgradeFeatures = []

    for (const [featureKey, allowedTiers] of Object.entries(FEATURE_TIERS)) {
        if (!allowedTiers.includes(tier)) {
            // Find the minimum tier that has this feature
            const minTier = allowedTiers[0]
            upgradeFeatures.push({
                feature: featureKey,
                requiredTier: minTier,
            })
        }
    }

    return upgradeFeatures
}

/**
 * Check if subscription is active
 */
export async function isSubscriptionActive() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing'])
            .limit(1)
            .maybeSingle()

        return !!subscription
    } catch (error) {
        console.error('Error checking subscription status:', error)
        return false
    }
}

/**
 * React hook for feature access checking
 */
export function useFeatureAccess(featureKey) {
    const [hasAccess, setHasAccess] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAccess = async () => {
            setLoading(true)
            const access = await hasFeatureAccess(featureKey)
            setHasAccess(access)
            setLoading(false)
        }
        checkAccess()
    }, [featureKey])

    return { hasAccess, loading }
}

