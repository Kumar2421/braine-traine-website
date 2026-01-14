const countries = [
    { code: 'US', name: 'United States', phoneCode: '+1', phoneMask: '(###) ###-####' },
    { code: 'IN', name: 'India', phoneCode: '+91', phoneMask: '#####-#####' },
    { code: 'GB', name: 'United Kingdom', phoneCode: '+44', phoneMask: '#### ### ####' },
]

export const phoneCodeOptions = countries.map((c) => ({
    id: c.code,
    label: `${c.code} ${c.phoneCode}`,
}))

export default countries
