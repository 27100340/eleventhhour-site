import type { Metadata } from 'next'
import { ShieldCheck, Leaf, Clock, PhoneCall } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Eleventh Hour Cleaning | London\'s Trusted Property Care Experts',
  description: 'Learn more about Eleventh Hour Cleaning — London\'s premium cleaning and maintenance service offering exceptional care for homes and businesses.',
}

const values = [
  {
    Icon: ShieldCheck,
    title: 'Fully insured & background-checked staff',
    desc: 'Every team member undergoes thorough vetting, DBS checks, and is fully insured for your peace of mind.',
  },
  {
    Icon: Leaf,
    title: 'Eco-conscious cleaning methods',
    desc: 'We use environmentally friendly products and sustainable practices to protect your home and our planet.',
  },
  {
    Icon: Clock,
    title: 'Transparent pricing and punctual service',
    desc: 'No hidden fees, no surprises. We arrive on time and deliver exactly what we promise.',
  },
  {
    Icon: PhoneCall,
    title: '24/7 emergency call-outs',
    desc: 'When emergencies happen, we\'re ready to respond — day or night, weekday or weekend.',
  },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">About us</p>
            <h1 className="mt-4">
              Premium service, <span className="text-accent">without the premium stress.</span>
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-ink-soft">
              Eleventh Hour Cleaning was founded on a simple idea: exceptional care for homes and
              businesses, delivered exactly when you need it.
            </p>
          </div>
        </div>
        <div aria-hidden="true" className="tick-rule" />
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Our story</p>
              <h2 className="mt-3">One trusted name for the whole property</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft">
                <p>
                  We bring together experienced cleaners, engineers, and maintenance experts under one
                  trusted name — offering reliable, last-minute and scheduled services for homes and
                  businesses that value quality.
                </p>
                <p>
                  From elegant townhouses to bustling offices, we understand what true cleanliness
                  looks like. Our team of vetted professionals handles everything — cleaning,
                  gardening, handyman work, and complete property maintenance — so you can relax and
                  focus on what truly matters.
                </p>
                <p className="font-semibold text-ink">
                  When we say &ldquo;Eleventh Hour,&rdquo; we mean it — we&rsquo;re there when you need us most.
                </p>
              </div>
            </div>
            <img
              src="/images/handyman.jpg"
              alt="Professional cleaning team"
              className="aspect-[3/2] w-full rounded-(--radius-card) border border-line object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">What we stand by</p>
            <h2 className="mt-3">We pride ourselves on</h2>
            <p className="mt-4 text-lg text-ink-soft">
              These are the principles that guide everything we do at Eleventh Hour Cleaning.
            </p>
          </div>
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {values.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius-ctl) bg-accent-tint">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-base">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2>Ready to experience the difference?</h2>
          <p className="mt-4 text-lg text-ink-soft">
            Join thousands of satisfied customers who trust Eleventh Hour Cleaning for their property
            care needs.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/book" className="btn-primary px-6 py-3 text-base">
              Book a service
            </Link>
            <Link href="/contact" className="btn-secondary px-6 py-3 text-base">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
