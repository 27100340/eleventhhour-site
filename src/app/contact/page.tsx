'use client'
import { useForm } from 'react-hook-form'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import Link from 'next/link'

type FormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
}

const FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID!

const contactDetails = [
  { Icon: Phone, label: 'Phone', value: '020 3355 1526', href: 'tel:+442033551526' },
  { Icon: MessageCircle, label: 'WhatsApp', value: '07400 760630', href: 'https://wa.me/447400760630' },
  { Icon: Mail, label: 'Email', value: 'hello@eleventhhourcleaning.co.uk', href: 'mailto:hello@eleventhhourcleaning.co.uk' },
  { Icon: MapPin, label: 'Location', value: 'London & Greater London', href: undefined },
]

export default function ContactPage() {
  const { register, handleSubmit, formState: { isSubmitting, isSubmitSuccessful } } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    const fd = new FormData()
    fd.append('FirstName', data.firstName)
    fd.append('LastName', data.lastName)
    fd.append('Email', data.email)
    fd.append('Phone', data.phone)
    fd.append('Message', data.message)
    await fetch(`https://formspree.io/f/${FORM_ID}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: fd,
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4">We&rsquo;d love to hear from you</h1>
          <p className="mt-5 text-lg text-ink-soft">
            Questions, quotes, or something last-minute — get in touch and we&rsquo;ll respond quickly.
          </p>

          <ul className="mt-10 space-y-5">
            {contactDetails.map(({ Icon, label, value, href }) => (
              <li key={label} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius-ctl) bg-accent-tint">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="mt-0.5 inline-block font-medium text-ink transition-colors duration-150 hover:text-accent"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-0.5 font-medium text-ink">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-10 border-t border-line pt-6 text-sm text-ink-soft">
            In a hurry? <Link href="/book" className="font-semibold text-accent hover:text-accent-dark">Book now</Link> and
            schedule your next clean in under 60 seconds.
          </p>
        </div>

        <div className="card p-7 md:p-9">
          <h2 className="text-xl">Send us a message</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input {...register('firstName', { required: true })} placeholder="First name *" className="input" />
              <input {...register('lastName', { required: true })} placeholder="Last name *" className="input" />
            </div>
            <input {...register('email', { required: true })} placeholder="Email *" type="email" className="input" />
            <input {...register('phone')} placeholder="Phone" className="input" />
            <textarea {...register('message', { required: true })} placeholder="How can we help?" className="input min-h-[140px]" />
            <button disabled={isSubmitting} className="btn-primary py-3 text-base">
              {isSubmitting ? 'Sending…' : 'Send message'}
            </button>
            {isSubmitSuccessful && (
              <p className="rounded-(--radius-ctl) bg-accent-tint px-4 py-3 text-sm font-medium text-accent-dark">
                Thanks! We&rsquo;ll be in touch.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
