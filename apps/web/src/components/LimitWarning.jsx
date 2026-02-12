/**
 * Limit Warning Component
 * Displays warnings when users approach or reach usage limits
 */

export function LimitWarning({
    current,
    limit,
    label,
    unit = '',
    isSoftLimit,
    isHardLimit,
    onUpgrade,
    showUpgradeButton = true
}) {
    if (limit === -1 || limit === null) return null // Unlimited
    if (!isSoftLimit && !isHardLimit) return null // No warning needed

    const percentage = limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0

    return (
        <div
            className="limit-warning"
            style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginTop: '8px',
                backgroundColor: isHardLimit ? '#fef2f2' : '#fef3c7',
                border: `1px solid ${isHardLimit ? '#fecaca' : '#fbbf24'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
            }}
        >
            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: '600',
                    fontSize: '14px',
                    color: isHardLimit ? '#991b1b' : '#92400e',
                    marginBottom: '4px'
                }}>
                    {isHardLimit ? '⚠️ Limit Reached' : '⚠️ Approaching Limit'}
                </div>
                <div style={{
                    fontSize: '13px',
                    color: isHardLimit ? '#991b1b' : '#92400e'
                }}>
                    {isHardLimit
                        ? `You've reached your ${label} limit (${current}${unit} / ${limit}${unit}). Choose a plan with higher limits to continue.`
                        : `You're using ${percentage}% of your ${label} limit (${current}${unit} / ${limit}${unit}).`
                    }
                </div>
            </div>
            {showUpgradeButton && onUpgrade && (
                <button
                    className="button"
                    style={{
                        backgroundColor: isHardLimit ? '#ef4444' : '#f59e0b',
                        color: '#ffffff',
                        fontSize: '13px',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                    }}
                    onClick={onUpgrade}
                >
                    {isHardLimit ? 'See plans' : 'Compare plans'}
                </button>
            )}
        </div>
    )
}

