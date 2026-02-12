import { forwardRef, useId } from 'react'

const sizeClasses = {
    md: 'uiInput--md',
    sm: 'uiInput--sm',
}

export const Input = forwardRef(function Input(
    {
        label,
        name,
        type = 'text',
        placeholder,
        isRequired,
        size = 'md',
        wrapperClassName = '',
        className = '',
        defaultValue,
        ...props
    },
    ref,
) {
    const id = useId()

    return (
        <label className={['uiField', wrapperClassName].join(' ')} htmlFor={id}>
            {label ? <span className="uiField__label">{label}</span> : null}
            <input
                ref={ref}
                id={id}
                name={name}
                type={type}
                required={isRequired}
                placeholder={placeholder}
                defaultValue={defaultValue}
                className={[
                    'uiInput',
                    sizeClasses[size] || sizeClasses.md,
                    className,
                ].join(' ')}
                {...props}
            />
        </label>
    )
})

export const InputBase = forwardRef(function InputBase(
    { className = '', ...props },
    ref,
) {
    return (
        <input
            ref={ref}
            className={[
                'uiInput uiInput--md',
                className,
            ].join(' ')}
            {...props}
        />
    )
})
