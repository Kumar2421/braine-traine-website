/**
 * Usage Limits Enforcement
 * Provides utilities for checking and enforcing usage limits
 */

import { supabase } from '../supabaseClient'
import { getUsageWithLimits } from './ideFeatureGating.js'

/**
 * Check if user can perform an action based on usage limits
 * @param {string} actionType - Type of action (create_project, export, start_training, etc.)
 * @param {Object} context - Additional context (model size, export format, etc.)
 * @returns {Promise<{allowed: boolean, reason?: string, limit_reached?: boolean, upgrade_required?: boolean, current_usage?: Object, limit?: Object}>}
 */
export async function checkUsageLimit(actionType, context = {}) {
    try {
        const { usage, limits, tier } = await getUsageWithLimits()

        switch (actionType) {
            case 'create_project':
                return checkProjectLimit(usage, limits)

            case 'export':
                return checkExportLimit(usage, limits, context.export_format)

            case 'start_training':
                return checkTrainingLimit(usage, limits)

            case 'use_gpu':
                return checkGPULimit(usage, limits, context.hours)

            case 'create_dataset':
                return checkDatasetLimit(usage, limits, context.project_id)

            default:
                return { allowed: true }
        }
    } catch (error) {
        console.error('Error checking usage limit:', error)
        return { allowed: false, reason: 'Error checking limits' }
    }
}

/**
 * Check project creation limit
 */
async function checkProjectLimit(usage, limits) {
    const maxProjects = limits.max_projects
    const currentProjects = usage.projects_count || 0

    if (maxProjects === -1) {
        return { allowed: true } // Unlimited
    }

    if (currentProjects >= maxProjects) {
        return {
            allowed: false,
            reason: `Project limit reached. You have ${currentProjects} of ${maxProjects} projects.`,
            limit_reached: true,
            upgrade_required: true,
            current_usage: { projects_count: currentProjects },
            limit: { max_projects: maxProjects },
        }
    }

    // Soft limit warning at 80%
    const warningThreshold = maxProjects * 0.8
    if (currentProjects >= warningThreshold) {
        return {
            allowed: true,
            warning: `You're approaching your project limit (${currentProjects}/${maxProjects})`,
            current_usage: { projects_count: currentProjects },
            limit: { max_projects: maxProjects },
        }
    }

    return {
        allowed: true,
        current_usage: { projects_count: currentProjects },
        limit: { max_projects: maxProjects },
    }
}

/**
 * Check export limit
 */
async function checkExportLimit(usage, limits, exportFormat = null) {
    const maxExports = limits.max_exports_per_month
    const currentExports = usage.exports_count || 0

    if (maxExports === -1) {
        return { allowed: true } // Unlimited
    }

    if (currentExports >= maxExports) {
        return {
            allowed: false,
            reason: `Export limit reached. You have used ${currentExports} of ${maxExports} exports this month.`,
            limit_reached: true,
            upgrade_required: true,
            current_usage: { exports_count: currentExports },
            limit: { max_exports_per_month: maxExports },
        }
    }

    // Check export format if provided
    if (exportFormat) {
        const allowedFormats = limits.export_formats_allowed || []
        if (!allowedFormats.includes(exportFormat.toLowerCase())) {
            return {
                allowed: false,
                reason: `Export format '${exportFormat}' is not available in your plan`,
                upgrade_required: true,
            }
        }
    }

    // Soft limit warning at 80%
    const warningThreshold = maxExports * 0.8
    if (currentExports >= warningThreshold) {
        return {
            allowed: true,
            warning: `You're approaching your export limit (${currentExports}/${maxExports})`,
            current_usage: { exports_count: currentExports },
            limit: { max_exports_per_month: maxExports },
        }
    }

    return {
        allowed: true,
        current_usage: { exports_count: currentExports },
        limit: { max_exports_per_month: maxExports },
    }
}

/**
 * Check training run limit
 */
async function checkTrainingLimit(usage, limits) {
    const maxTrainingRuns = limits.max_training_runs_per_month
    const currentRuns = usage.training_runs_count || 0

    if (maxTrainingRuns === -1) {
        return { allowed: true } // Unlimited
    }

    if (currentRuns >= maxTrainingRuns) {
        return {
            allowed: false,
            reason: `Training run limit reached. You have used ${currentRuns} of ${maxTrainingRuns} training runs this month.`,
            limit_reached: true,
            upgrade_required: true,
            current_usage: { training_runs_count: currentRuns },
            limit: { max_training_runs_per_month: maxTrainingRuns },
        }
    }

    return {
        allowed: true,
        current_usage: { training_runs_count: currentRuns },
        limit: { max_training_runs_per_month: maxTrainingRuns },
    }
}

/**
 * Check GPU hours limit
 */
async function checkGPULimit(usage, limits, hours = 0) {
    const maxGpuHours = limits.max_gpu_hours_per_month
    const currentGpuHours = parseFloat(usage.gpu_hours_used?.toString() || '0')
    const requestedHours = parseFloat(hours?.toString() || '0')

    if (maxGpuHours === -1) {
        return { allowed: true } // Unlimited
    }

    const totalAfterRequest = currentGpuHours + requestedHours

    if (totalAfterRequest > maxGpuHours) {
        return {
            allowed: false,
            reason: `GPU hours limit would be exceeded. You have ${currentGpuHours.toFixed(2)} of ${maxGpuHours} hours used. Requested: ${requestedHours.toFixed(2)} hours.`,
            limit_reached: true,
            upgrade_required: true,
            current_usage: { gpu_hours_used: currentGpuHours },
            limit: { max_gpu_hours_per_month: maxGpuHours },
        }
    }

    // Soft limit warning at 80%
    const warningThreshold = maxGpuHours * 0.8
    if (currentGpuHours >= warningThreshold) {
        return {
            allowed: true,
            warning: `You're approaching your GPU hours limit (${currentGpuHours.toFixed(2)}/${maxGpuHours})`,
            current_usage: { gpu_hours_used: currentGpuHours },
            limit: { max_gpu_hours_per_month: maxGpuHours },
        }
    }

    return {
        allowed: true,
        current_usage: { gpu_hours_used: currentGpuHours },
        limit: { max_gpu_hours_per_month: maxGpuHours },
    }
}

/**
 * Check dataset limit per project
 */
async function checkDatasetLimit(usage, limits, projectId) {
    // This would require checking datasets per project
    // For now, we'll just check total datasets
    const maxDatasetsPerProject = limits.max_datasets_per_project

    if (maxDatasetsPerProject === -1) {
        return { allowed: true } // Unlimited
    }

    // In a full implementation, you'd query datasets for this project
    // For now, return allowed
    return {
        allowed: true,
        limit: { max_datasets_per_project: maxDatasetsPerProject },
    }
}

/**
 * Get usage percentage for a metric
 * @param {number} current - Current usage
 * @param {number} limit - Limit (-1 for unlimited)
 * @returns {number} Percentage (0-100, or -1 for unlimited)
 */
export function getUsagePercentage(current, limit) {
    if (limit === -1 || limit === null) return -1 // Unlimited
    if (limit === 0) return 100
    return Math.min(100, Math.round((current / limit) * 100))
}

/**
 * Check if usage is at soft limit (80%)
 * @param {number} current - Current usage
 * @param {number} limit - Limit
 * @returns {boolean}
 */
export function isSoftLimitReached(current, limit) {
    if (limit === -1 || limit === null) return false
    return current >= limit * 0.8
}

/**
 * Check if usage is at hard limit (100%)
 * @param {number} current - Current usage
 * @param {number} limit - Limit
 * @returns {boolean}
 */
export function isHardLimitReached(current, limit) {
    if (limit === -1 || limit === null) return false
    return current >= limit
}

