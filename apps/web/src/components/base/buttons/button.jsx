import { forwardRef } from 'react'

const sizeClasses = {
    xl: 'uiButton--xl',
    lg: 'uiButton--lg',
    md: 'uiButton--md',
    sm: 'uiButton--sm',
}

export const Button = forwardRef(function Button(
    { className = '', size = 'md', type = 'button', ...props },
    ref,
) {
    return (
        <button
            ref={ref}
            type={type}
            className={[
                'uiButton',
                sizeClasses[size] || sizeClasses.md,
                className,
            ].join(' ')}
            {...props}
        />
    )
})
