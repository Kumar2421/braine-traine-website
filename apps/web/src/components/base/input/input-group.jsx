import { cloneElement, isValidElement, useId } from 'react'

export const InputGroup = ({
    label,
    name,
    size = 'md',
    leadingAddon,
    children,
    className = '',
}) => {
    const id = useId()
    const sizeClasses = size === 'md' ? 'uiInputGroup--md' : 'uiInputGroup--sm'

    return (
        <label className={['uiField', className].join(' ')} htmlFor={id}>
            {label ? <span className="uiField__label">{label}</span> : null}
            <div className={['uiInputGroup', sizeClasses].join(' ')}>
                {leadingAddon ? <div className="uiInputGroup__leading">{leadingAddon}</div> : null}
                <div className="uiInputGroup__main">
                    {isValidElement(children)
                        ? cloneElement(children, {
                            id,
                            name,
                        })
                        : children}
                </div>
            </div>
        </label>
    )
}
