/**
 * Subscription Upgrade/Downgrade Modal Component
 * Handles plan changes with prorated billing preview
 */

import { useState, useEffect } from 'react'
import { calculateProratedAmount, upgradeSubscription, downgradeSubscription } from '../utils/subscriptionApi'
import { getPricingPlans, formatPrice } from '../utils/razorpayApi'
import { useToast } from '../utils/toast'
import { LoadingSpinner } from './LoadingSpinner'

export function SubscriptionUpgradeModal({ isOpen, onClose, currentSubscription, onSuccess }) {
    const toast = useToast()
    const [plans, setPlans] = useState([])
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [loading, setLoading] = useState(false)
    const [calculating, setCalculating] = useState(false)
    const [proration, setProration] = useState(null)
    const [changeType, setChangeType] = useState(null) // 'upgrade' or 'downgrade'
    const [immediate, setImmediate] = useState(false)

    useEffect(() => {
        if (isOpen) {
            loadPlans()
        }
    }, [isOpen])

    const loadPlans = async () => {
        try {
            const { data } = await getPricingPlans()
            if (data) {
                setPlans(data.filter(p => p.plan_key !== 'free'))
            }
        } catch (error) {
            console.error('Error loading plans:', error)
        }
    }

    const handlePlanSelect = async (plan) => {
        setSelectedPlan(plan)
        setCalculating(true)

        try {
            const result = await calculateProratedAmount(currentSubscription.subscription_id, plan.plan_key)
            if (result.success) {
                setProration(result.breakdown)
                setChangeType(result.breakdown.isUpgrade ? 'upgrade' : 'downgrade')
            } else {
                toast.error(result.error || 'Failed to calculate proration')
            }
        } catch (error) {
            console.error('Error calculating proration:', error)
            toast.error('Failed to calculate proration')
        } finally {
            setCalculating(false)
        }
    }

    const handleConfirm = async () => {
        if (!selectedPlan || !proration) return

        setLoading(true)
        try {
            let result
            if (changeType === 'upgrade') {
                result = await upgradeSubscription(currentSubscription.subscription_id, selectedPlan.plan_key)
            } else {
                result = await downgradeSubscription(currentSubscription.subscription_id, selectedPlan.plan_key, immediate)
            }

            if (result.success) {
                toast.success(`Subscription ${changeType === 'upgrade' ? 'upgraded' : 'downgraded'} successfully`)
                onSuccess?.()
                onClose()
            } else {
                toast.error(result.error || `Failed to ${changeType} subscription`)
            }
        } catch (error) {
            console.error(`Error ${changeType}ing subscription:`, error)
            toast.error(`Failed to ${changeType} subscription`)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const currentPlan = plans.find(p => p.plan_key === currentSubscription?.plan_type)

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Change Subscription Plan</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Current Plan */}
                    <div className="plan-comparison">
                        <div className="plan-card plan-card--current">
                            <h3>Current Plan</h3>
                            <div className="plan-name">{currentPlan?.plan_name || currentSubscription?.plan_type}</div>
                            <div className="plan-price">
                                {currentPlan && formatPrice(
                                    currentSubscription?.billing_interval === 'yearly'
                                        ? currentPlan.price_yearly
                                        : currentPlan.price_monthly
                                )}
                                /{currentSubscription?.billing_interval === 'yearly' ? 'year' : 'month'}
                            </div>
                        </div>

                        <div className="plan-arrow">→</div>

                        <div className="plan-card plan-card--selected">
                            <h3>{selectedPlan ? 'New Plan' : 'Select Plan'}</h3>
                            {selectedPlan ? (
                                <>
                                    <div className="plan-name">{selectedPlan.plan_name}</div>
                                    <div className="plan-price">
                                        {formatPrice(
                                            currentSubscription?.billing_interval === 'yearly'
                                                ? selectedPlan.price_yearly
                                                : selectedPlan.price_monthly
                                        )}
                                        /{currentSubscription?.billing_interval === 'yearly' ? 'year' : 'month'}
                                    </div>
                                </>
                            ) : (
                                <div className="plan-placeholder">Select a plan below</div>
                            )}
                        </div>
                    </div>

                    {/* Plan Selection */}
                    <div className="plan-selection">
                        <h3>Available Plans</h3>
                        <div className="plan-grid">
                            {plans.map((plan) => {
                                const isCurrent = plan.plan_key === currentSubscription?.plan_type
                                const isSelected = selectedPlan?.plan_key === plan.plan_key

                                return (
                                    <div
                                        key={plan.plan_id}
                                        className={`plan-option ${isCurrent ? 'plan-option--current' : ''} ${isSelected ? 'plan-option--selected' : ''}`}
                                        onClick={() => !isCurrent && handlePlanSelect(plan)}
                                    >
                                        <div className="plan-option__name">{plan.plan_name}</div>
                                        <div className="plan-option__price">
                                            {formatPrice(
                                                currentSubscription?.billing_interval === 'yearly'
                                                    ? plan.price_yearly
                                                    : plan.price_monthly
                                            )}
                                            /{currentSubscription?.billing_interval === 'yearly' ? 'year' : 'month'}
                                        </div>
                                        {isCurrent && <div className="plan-option__badge">Current</div>}
                                        {isSelected && <div className="plan-option__badge plan-option__badge--selected">Selected</div>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Proration Preview */}
                    {calculating && (
                        <div className="proration-loading">
                            <LoadingSpinner size="small" />
                            <span>Calculating proration...</span>
                        </div>
                    )}

                    {proration && selectedPlan && (
                        <div className="proration-preview">
                            <h3>Billing Preview</h3>
                            <div className="proration-breakdown">
                                <div className="proration-row">
                                    <span>Days remaining in current period:</span>
                                    <span>{proration.daysRemaining} days</span>
                                </div>
                                <div className="proration-row">
                                    <span>Unused amount (credit):</span>
                                    <span>-{formatPrice(proration.unusedAmount)}</span>
                                </div>
                                <div className="proration-row">
                                    <span>New plan cost:</span>
                                    <span>{formatPrice(proration.newPrice)}</span>
                                </div>
                                <div className="proration-row proration-row--total">
                                    <span>Amount due now:</span>
                                    <span>{formatPrice(proration.proratedAmount)}</span>
                                </div>
                            </div>

                            {changeType === 'downgrade' && (
                                <div className="downgrade-options">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={immediate}
                                            onChange={(e) => setImmediate(e.target.checked)}
                                        />
                                        <span>Downgrade immediately (otherwise at period end)</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="button button--outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button
                        className="button button--primary"
                        onClick={handleConfirm}
                        disabled={loading || !selectedPlan || !proration || calculating}
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size="small" />
                                Processing...
                            </>
                        ) : (
                            `Confirm ${changeType === 'upgrade' ? 'Upgrade' : 'Downgrade'}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

