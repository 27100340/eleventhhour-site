import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, Sparkles, Calendar, CheckCircle, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Trusted Household Cleaning & Maintenance Services | Eleventh Hour Cleaning',
  description: 'Enjoy a spotless home with our premium household cleaning, gardening, and maintenance services. Discreet, reliable, and tailored for London\'s busy professionals.',
}

const services = [
  {
    title: 'Regular Cleaning',
    description: 'Weekly & bi-weekly home cleans with the same professional for consistency and trust.',
    Icon: Calendar,
  },
  {
    title: 'Deep Cleaning',
    description: 'Spring clean: skirtings, limescale, inside appliances & more for a thorough refresh.',
    Icon: Sparkles,
  },
  {
    title: 'End of Tenancy',
    description: 'Inventory-ready cleans for tenants & landlords to ensure deposit return.',
    Icon: Home,
  },
  {
    title: 'Carpet & Upholstery',
    description: 'Hot water extraction for carpets, rugs & sofas to restore freshness.',
    Icon: CheckCircle,
  },
]

const reasons = [
  {
    title: 'Same professional where possible',
    desc: 'We assign the same cleaner for continuity and to build trust with your family.',
  },
  {
    title: 'Flexible scheduling',
    desc: 'One-off, weekly, or bi-weekly visits that fit your lifestyle and routine.',
  },
  {
    title: 'Quality assurance',
    desc: 'Comprehensive room-by-room checklists ensure nothing is missed in your home.',
  },
  {
    title: 'Transparent pricing',
    desc: 'Clear, upfront rates with no hidden fees or surprises.',
  },
]

export default function HouseholdServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">For your home</p>
            <h1 className="mt-4">
              Household cleaning & <span className="text-accent">maintenance</span>
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-ink-soft">
              Your home deserves care, not compromise.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Our domestic cleaning and maintenance experts ensure every corner feels fresh,
              organized, and comfortable. We handle regular cleans, deep refreshes, and seasonal
              upkeep — so your home always feels effortlessly pristine.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="btn-primary px-6 py-3 text-base">
              Book a home clean
            </Link>
            <Link href="/contact" className="btn-secondary px-6 py-3 text-base">
              Get a quote
            </Link>
          </div>
        </div>
        <div aria-hidden="true" className="tick-rule" />
      </section>

      {/* Services grid */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Popular at home</p>
            <h2 className="mt-3">Popular household services</h2>
            <p className="mt-4 text-lg text-ink-soft">
              From one-time deep cleans to regular maintenance, we provide comprehensive home care
              services.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ title, description, Icon }) => (
              <div key={title} className="card p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-(--radius-ctl) bg-accent-tint">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mt-4">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Why choose us</p>
              <h2 className="mt-3">Why choose us for your home?</h2>
              <ul className="mt-8 space-y-6">
                {reasons.map(({ title, desc }) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-tint">
                      <Check className="h-4 w-4 text-accent" />
                    </span>
                    <div>
                      <h3 className="text-base">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop&crop=center"
              alt="Professional home cleaning"
              className="aspect-[3/2] w-full rounded-(--radius-card) border border-line object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-paper">
        <div aria-hidden="true" className="tick-rule opacity-40" />
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-paper">Ready to reclaim your free time?</h2>
          <p className="mx-auto mt-3 max-w-xl text-paper/70">
            Book a trusted professional in minutes and enjoy a spotless home without the hassle.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 rounded-(--radius-ctl) bg-paper px-6 py-3 text-base font-semibold text-ink transition-colors duration-150 hover:bg-white"
            >
              Book home clean
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-(--radius-ctl) border border-paper/40 px-6 py-3 text-base font-semibold text-paper transition-colors duration-150 hover:bg-paper/10"
            >
              Request a quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
