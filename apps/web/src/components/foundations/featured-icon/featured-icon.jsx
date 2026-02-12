export function FeaturedIcon({ icon: Icon, size = 'md', className = '', ...props }) {
    const sizeClass = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'

    return (
        <span
            className={[
                'inline-flex items-center justify-center rounded-xl bg-white/80 ring-1 ring-black/5',
                sizeClass,
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            {...props}
        >
            {Icon ? <Icon className={size === 'lg' ? 'h-6 w-6 text-tertiary' : 'h-5 w-5 text-tertiary'} /> : null}
        </span>
    )
}
