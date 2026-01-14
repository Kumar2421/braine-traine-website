import React, { useEffect, useMemo, useState } from 'react'

export function Terminal({ children, className = '', embedded = false, ...props }) {
    return (
        <div
            className={['uiTerminal', embedded ? 'uiTerminal--embedded' : '', className].join(' ')}
            {...props}
        >
            {!embedded ? (
                <div className="uiTerminal__top" aria-hidden="true">
                    <span className="uiTerminal__dot uiTerminal__dot--red" />
                    <span className="uiTerminal__dot uiTerminal__dot--yellow" />
                    <span className="uiTerminal__dot uiTerminal__dot--green" />
                    <span className="uiTerminal__title">terminal</span>
                </div>
            ) : null}
            <div className="uiTerminal__body">{children}</div>
        </div>
    )
}

export function AnimatedSpan({ children, className = '', style, ...props }) {
    return (
        <div
            className={['uiTerminal__line uiTerminal__line--fade', className].join(' ')}
            style={style}
            {...props}
        >
            {children}
        </div>
    )
}

export function TypingAnimation({ children, className = '', speedMs = 18, ...props }) {
    const fullText = useMemo(() => {
        if (typeof children === 'string') return children
        return Array.isArray(children) ? children.join('') : String(children ?? '')
    }, [children])

    const [visible, setVisible] = useState('')

    useEffect(() => {
        const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
        if (prefersReduced) {
            setVisible(fullText)
            return
        }

        let i = 0
        setVisible('')

        const id = window.setInterval(() => {
            i += 1
            setVisible(fullText.slice(0, i))
            if (i >= fullText.length) {
                window.clearInterval(id)
            }
        }, speedMs)

        return () => window.clearInterval(id)
    }, [fullText, speedMs])

    return (
        <div className={['uiTerminal__line uiTerminal__line--typing', className].join(' ')} {...props}>
            <span>{visible}</span>
            <span className="uiTerminal__caret" aria-hidden="true" />
        </div>
    )
}
