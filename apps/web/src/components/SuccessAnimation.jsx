/**
 * Success Animation Component
 * Displays animated success checkmark
 */

import { useEffect, useState } from 'react'
import './SuccessAnimation.css'

export function SuccessAnimation({ show, onComplete }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (show) {
            setVisible(true)
            const timer = setTimeout(() => {
                setVisible(false)
                onComplete?.()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [show, onComplete])

    if (!visible) return null

    return (
        <div className="success-animation-overlay" role="dialog" aria-live="polite" aria-label="Payment successful">
            <div className="success-animation-container">
                <div className="success-checkmark">
                    <div className="success-checkmark-circle">
                        <div className="success-checkmark-stem"></div>
                        <div className="success-checkmark-kick"></div>
                    </div>
                </div>
                <h2 className="success-animation-title">Payment Successful!</h2>
                <p className="success-animation-message">Your subscription has been activated.</p>
            </div>
        </div>
    )
}

