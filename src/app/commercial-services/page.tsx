import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Store, UtensilsCrossed, School, Warehouse, HardHat, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Professional Office & Commercial Cleaning in London | Eleventh Hour Cleaning',
  description: 'Maintain a spotless, professional environment with our tailored commercial cleaning and facility management services for offices, shops, and hospitality venues.',
}

const services = [
  {
    title: 'Office Cleaning',
    description: 'Daily/weekly office contracts with audits & sign-off for consistent quality.',
    Icon: Building2,
  },
  {
    title: 'Retail & Showrooms',
    description: 'Front-of-house shine to match your brand and impress customers.',
    Icon: Store,
  },
  {
    title: 'Hospitality',
    description: 'Bars, cafés & restaurants — FOH & BOH standards for food safety compliance.',
    Icon: UtensilsCrossed,
  },
  {
    title: 'Education',
    description: 'Schools & nurseries with safer products and flexible cleaning rotas.',
    Icon: School,
  },
  {
    title: 'Industrial & Warehousing',
    description: 'High-traffic floors, welfare areas & mezzanines cleaned to safety standards.',
    Icon: Warehouse,
  },
  {
    title: 'After Builders',
    description: 'Dust control, sparkle cleans & handover for construction completions.',
    Icon: HardHat,
  },
]

const reasons = [
  {
    title: 'Dedicated support',
    desc: 'Single point of contact with dedicated account management and KPI tracking for your business.',
  },
  {
    title: 'Flexible scheduling',
    desc: 'Daily, weekly, or out-of-hours contracts tailored to your business operations and workflow.',
  },
  {
    title: 'Quality assurance',
    desc: 'Photo reports and detailed sign-off sheets for full transparency and accountability.',
  },
  {
    title: 'Transparent pricing',
    desc: 'Choose between fixed-rate contracts or flexible time-and-materials pricing to suit your budget.',
  },
]

const testimonials = [
  { name: 'Ops Manager', place: 'Tech Co.', quote: 'They scaled from 3 to 5 days/week as we grew — no drop in quality.' },
  { name: 'Store Lead', place: 'Retail', quote: 'Audits + photos after each visit give us real oversight.' },
  { name: 'Venue GM', place: 'Events', quote: 'Sparkle cleans before events and quick turnarounds afterwards — reliable.' },
]

export default function CommercialServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">For your business</p>
            <h1 className="mt-4">
              Office & <span className="text-accent">commercial cleaning</span>
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-ink-soft">
              Our commercial cleaning teams work quietly, efficiently, and after-hours — keeping your
              workspace spotless and inviting.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              We cater to offices, retail stores, restaurants, and more, ensuring your brand looks as
              polished as your business.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="btn-primary px-6 py-3 text-base">
              Book commercial clean
            </Link>
            <Link href="/contact" className="btn-secondary px-6 py-3 text-base">
              Get a site quote
            </Link>
          </div>
        </div>
        <div aria-hidden="true" className="tick-rule" />
      </section>

      {/* Services grid */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">What we cover</p>
            <h2 className="mt-3">Solutions for your business</h2>
            <p className="mt-4 text-lg text-ink-soft">
              Comprehensive commercial cleaning services tailored to your industry and schedule.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <img
              src="/images/office.jpg"
              alt="Professional office cleaning"
              className="order-2 aspect-[3/2] w-full rounded-(--radius-card) border border-line object-cover lg:order-1"
              loading="lazy"
            />
            <div className="order-1 lg:order-2">
              <p className="eyebrow">Why choose us</p>
              <h2 className="mt-3">Why choose us for your business?</h2>
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
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">In their words</p>
            <h2 className="mt-3">What our clients say</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="card flex flex-col p-7">
                <span aria-hidden="true" className="font-display text-4xl leading-none text-accent">
                  &ldquo;
                </span>
                <blockquote className="mt-2 flex-1 leading-relaxed text-ink">{t.quote}</blockquote>
                <figcaption className="mt-6 border-t border-line pt-4 text-sm">
                  <span className="font-semibold text-ink">{t.name}</span>
                  <span className="text-ink-faint"> · {t.place}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-paper">
        <div aria-hidden="true" className="tick-rule opacity-40" />
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-paper">Ready for a cleaner workplace?</h2>
          <p className="mx-auto mt-3 max-w-xl text-paper/70">
            Book a site visit or start with a trial clean to experience our professional commercial
            services.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 rounded-(--radius-ctl) bg-paper px-6 py-3 text-base font-semibold text-ink transition-colors duration-150 hover:bg-white"
            >
              Book commercial clean
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
