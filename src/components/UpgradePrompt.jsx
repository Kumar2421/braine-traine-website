/**
 * Upgrade Prompt Component
 * Displays upgrade prompts when users approach or reach limits
 */

export function UpgradePrompt({ 
    title = "Upgrade Your Plan",
    message = "You're approaching your usage limits. Upgrade to get more resources and features.",
    onUpgrade,
    variant = 'warning', // 'warning' | 'error' | 'info'
    showCloseButton = false,
    onClose
}) {
    const styles = {
        warning: {
            backgroundColor: '#fef3c7',
            borderColor: '#fbbf24',
            textColor: '#92400e',
            buttonColor: '#f59e0b'
        },
        error: {
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
            textColor: '#991b1b',
            buttonColor: '#ef4444'
        },
        info: {
            backgroundColor: '#eff6ff',
            borderColor: '#93c5fd',
            textColor: '#1e40af',
            buttonColor: '#3b82f6'
        }
    }

    const style = styles[variant] || styles.warning

    return (
        <div 
            className="upgrade-prompt"
            style={{
                padding: '16px 20px',
                borderRadius: '8px',
                marginBottom: '24px',
                backgroundColor: style.backgroundColor,
                border: `1px solid ${style.borderColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                position: 'relative'
            }}
        >
            {showCloseButton && onClose && (
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        color: style.textColor,
                        cursor: 'pointer',
                        padding: '4px 8px',
                        lineHeight: '1'
                    }}
                    aria-label="Close"
                >
                    ×
                </button>
            )}
            <div style={{ flex: 1, paddingRight: showCloseButton ? '32px' : '0' }}>
                <div style={{ 
                    fontWeight: '600', 
                    fontSize: '15px',
                    color: style.textColor,
                    marginBottom: '4px'
                }}>
                    {title}
                </div>
                <div style={{ 
                    fontSize: '14px',
                    color: style.textColor,
                    opacity: 0.9
                }}>
                    {message}
                </div>
            </div>
            {onUpgrade && (
                <button
                    className="button"
                    style={{
                        backgroundColor: style.buttonColor,
                        color: '#ffffff',
                        fontSize: '14px',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                    }}
                    onClick={onUpgrade}
                >
                    View Plans
                </button>
            )}
        </div>
    )
}

