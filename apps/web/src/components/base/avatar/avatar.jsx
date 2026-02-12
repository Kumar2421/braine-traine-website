export function Avatar({ src, alt, size = 'md', className }) {
    const sizeClass =
        size === '2xl'
            ? 'h-20 w-20 md:h-24 md:w-24'
            : size === 'xl'
                ? 'h-16 w-16'
                : size === 'lg'
                    ? 'h-12 w-12'
                    : size === 'sm'
                        ? 'h-8 w-8'
                        : 'h-10 w-10'

    const classes = ['rounded-full object-cover', sizeClass, className].filter(Boolean).join(' ')

    return (
        <img
            src={src}
            alt={alt}
            className={classes}
            loading="lazy"
        />
    )
}

export default Avatar
