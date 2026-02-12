import { useMemo, useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { Checkbox } from '@/components/base/checkbox/checkbox'
import { Form } from '@/components/base/form/form'
import { Input, InputBase } from '@/components/base/input/input'
import { InputGroup } from '@/components/base/input/input-group'
import { NativeSelect } from '@/components/base/select/select-native'
import { TextArea } from '@/components/base/textarea/textarea'
import countries, { phoneCodeOptions } from '@/utils/countries'

import { supabase } from './supabaseClient'

function RequestAccessPage({ session, navigate }) {
    const user = session?.user

    const query = useMemo(() => new URLSearchParams(window.location.search || ''), [])
    const type = useMemo(() => query.get('type') || 'pro', [query])

    const [selectedCountryPhone, setSelectedCountryPhone] = useState('US')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [ok, setOk] = useState(false)

    return (
        <>
            <section className="pricingHero">
                <div className="container pricingHero__inner">
                    <p className="pricingHero__kicker">Contact</p>
                    <h1 className="pricingHero__title">{type === 'enterprise' ? 'Contact Enterprise' : 'Request Access'}</h1>
                    <p className="pricingHero__subtitle">
                        Tell us what you’re building and we’ll recommend the right ML FORGE plan for your local Vision AI workflow.
                    </p>
                </div>
            </section>

            <section className="contactSimple">
                <div className="contactSimple__container">
                    <div className="contactSimple__head">
                        <span className="contactSimple__kicker">Contact us</span>
                        <h2 className="contactSimple__title">Get in touch</h2>
                        <p className="contactSimple__subtitle">
                            {type === 'enterprise'
                                ? 'Enterprise deployments (on-prem/offline), security reviews, and custom workflow support.'
                                : 'Pro access requests for advanced dataset tooling, training control, and production exports.'}
                        </p>
                    </div>

                    <Form
                        onSubmit={async (e) => {
                            e.preventDefault()
                            setError('')
                            setOk(false)

                            const data = Object.fromEntries(new FormData(e.currentTarget))
                            const cleanEmail = String(data.email || '').trim()

                            if (!cleanEmail) {
                                setError('Email is required.')
                                return
                            }

                            try {
                                setIsLoading(true)
                                const { error: insertErr } = await supabase.from('access_requests').insert({
                                    request_type: type,
                                    user_id: user?.id || null,
                                    name: String(data.firstName || '').trim() || null,
                                    email: cleanEmail,
                                    company: String(data.company || '').trim() || null,
                                    message: String(data.message || '').trim() || null,
                                })
                                if (insertErr) throw insertErr
                                setOk(true)
                                e.currentTarget.reset()
                            } catch (err) {
                                setError(err?.message || 'Unable to submit request. Please try again.')
                            } finally {
                                setIsLoading(false)
                            }
                        }}
                        className="contactSimple__form"
                    >
                        <div className="contactSimple__fields">
                            <div className="contactSimple__row">
                                <Input isRequired size="md" name="firstName" label="First name" placeholder="First name" wrapperClassName="contactSimple__col" defaultValue={user?.user_metadata?.name || ''} />
                                <Input isRequired size="md" name="lastName" label="Last name" placeholder="Last name" wrapperClassName="contactSimple__col" />
                            </div>
                            <Input isRequired size="md" name="email" label="Email" type="email" placeholder="you@company.com" defaultValue={user?.email || ''} />
                            <Input size="md" name="company" label="Company" placeholder="Company / team" />
                            <InputGroup
                                size="md"
                                name="phone"
                                label="Phone number"
                                leadingAddon={
                                    <NativeSelect
                                        aria-label="Country code"
                                        value={selectedCountryPhone}
                                        onChange={(value) => setSelectedCountryPhone(value.currentTarget.value)}
                                        options={phoneCodeOptions.map((item) => ({
                                            label: item.label,
                                            value: item.id,
                                        }))}
                                    />
                                }
                            >
                                <InputBase
                                    type="tel"
                                    placeholder={countries
                                        .find((country) => country.code === selectedCountryPhone)
                                        ?.phoneMask?.replaceAll('#', '0')}
                                />
                            </InputGroup>
                            <TextArea
                                isRequired
                                name="message"
                                label="Message"
                                placeholder={
                                    type === 'enterprise'
                                        ? 'Share your environment (on-prem/offline), constraints, model types, and deployment targets.'
                                        : 'Share your workflow (datasets, training, export target) and what you want to unlock in ML FORGE.'
                                }
                                rows={5}
                            />
                            <Checkbox
                                name="privacy"
                                size="md"
                                hint={
                                    <>
                                        You agree to our friendly{' '}
                                        <a
                                            href="#"
                                            className="rounded-xs underline underline-offset-3 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                                        >
                                            privacy policy.
                                        </a>
                                    </>
                                }
                            />
                        </div>

                        {error ? <div className="contactSimple__error">{error}</div> : null}
                        {ok ? <div className="contactSimple__ok">Request submitted. We’ll follow up via email.</div> : null}

                        <Button type="submit" size="xl" disabled={isLoading}>
                            {isLoading ? 'Sending…' : 'Send message'}
                        </Button>

                        <button type="button" className="contactSimple__back" onClick={() => navigate('/pricing')}>
                            Back to pricing
                        </button>
                    </Form>
                </div>
            </section>
        </>
    )
}

export default RequestAccessPage
