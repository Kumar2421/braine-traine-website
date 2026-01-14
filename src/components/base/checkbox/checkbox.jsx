import { useId } from 'react'

export const Checkbox = ({
    name,
    size = 'md',
    hint,
    className = '',
    defaultChecked,
    ...props
}) => {
    const id = useId()

    const boxSize = size === 'md' ? 'uiCheckbox__input--md' : 'uiCheckbox__input--sm'

    return (
        <label className={['uiCheckbox', className].join(' ')}>
            <input
                id={id}
                name={name}
                type="checkbox"
                defaultChecked={defaultChecked}
                className={[
                    boxSize,
                    'uiCheckbox__input',
                ].join(' ')}
                {...props}
            />
            {hint ? <span className="uiCheckbox__hint">{hint}</span> : null}
        </label>
    )
}
