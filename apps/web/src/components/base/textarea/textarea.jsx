import { forwardRef, useId } from 'react'

export const TextArea = forwardRef(function TextArea(
    { label, name = 'message', isRequired, rows = 4, className = '', ...props },
    ref,
) {
    const id = useId()

    return (
        <label className="uiField" htmlFor={id}>
            {label ? <span className="uiField__label">{label}</span> : null}
            <textarea
                ref={ref}
                id={id}
                name={name}
                required={isRequired}
                rows={rows}
                className={[
                    'uiTextarea',
                    className,
                ].join(' ')}
                {...props}
            />
        </label>
    )
})
