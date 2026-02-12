/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            maxWidth: {
                container: '1280px',
                120: '30rem',
            },
            fontSize: {
                md: ['1rem', { lineHeight: '1.5rem' }],
                'display-md': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em' }],
                'display-lg': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.02em' }],
            },
            backgroundColor: {
                primary: '#ffffff',
                secondary: '#F2F4F7',
            },
            textColor: {
                primary: '#0b0f12',
                tertiary: '#4D5761',
                'brand-secondary': '#6941C6',
            },
            colors: {
                'brand-secondary': '#6941C6',
                secondary: '#F2F4F7',
                'fg-white': '#ffffff',
            },
            borderRadius: {
                xs: '0.125rem',
            },
            outlineColor: {
                'focus-ring': 'rgba(105, 65, 198, 0.7)',
            },
        },
    },
    plugins: [],
}
