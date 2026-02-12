export const NativeSelect = ({
    options = [],
    className = '',
    value,
    onChange,
    ...props
}) => {
    return (
        <select
            value={value}
            onChange={onChange}
            className={[
                'uiSelect',
                className,
            ].join(' ')}
            {...props}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    )
}
