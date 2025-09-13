'use client'
import { useForm } from 'react-hook-form'

type FormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
}

const FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID!

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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-2">Phone: 020 8000 0000 · Email: hello@eleventhhour.co.uk</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input {...register('firstName', { required: true })} placeholder="First name *" className="input" />
          <input {...register('lastName', { required: true })} placeholder="Last name *" className="input" />
        </div>
        <input {...register('email', { required: true })} placeholder="Email *" type="email" className="input" />
        <input {...register('phone')} placeholder="Phone" className="input" />
        <textarea {...register('message', { required: true })} placeholder="How can we help?" className="input min-h-[120px]" />
        <button disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Sending…' : 'Send'}</button>
        {isSubmitSuccessful && <p className="text-green-700">Thanks! We’ll be in touch.</p>}
      </form>
    </div>
  )
}
