'use client'
import { useMode } from '@/components/ModeContext'
import TopSelectorBar from '@/components/TopSelectorBar'
import Link from 'next/link'
import { ShieldCheck, Leaf, Clock, Sparkles, Users, CreditCard, ArrowRight, MapPin } from 'lucide-react'

type Tile = { title: string; href: string; img: string; desc: string }

const faqs = [
  { q: 'Do you bring supplies?', a: 'Yes — hospital-grade supplies, with eco options on request.' },
  { q: 'Are you insured?', a: 'Fully insured and background-checked operatives on every job.' },
  { q: 'Which areas do you cover?', a: 'Greater London and surrounding areas.' },
  { q: 'Can I reschedule?', a: 'Of course. Reschedule up to 24 hours before your appointment.' },
]

const householdTiles: Tile[] = [
  { title: 'Regular Cleaning', href: '/services/cleaning', img: 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/sinksoap.jpg', desc: 'Weekly & bi-weekly home cleans with the same pro.' },
  { title: 'Deep Cleaning', href: '/services/cleaning', img: 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/deepclean.jpg', desc: 'Spring clean: skirtings, limescale, inside appliances & more.' },
  { title: 'Gardening', href: '/services/gardening', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop', desc: 'Lawn care, hedge trimming, planting & garden clearance.' },
  { title: 'Handyman', href: '/services/handyman', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop', desc: 'Painting, furniture assembly, wall mounting & minor repairs.' },
  { title: 'Plumbing & Heating', href: '/services/plumbing-heating', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=250&fit=crop', desc: 'Pipe repairs, boiler servicing, radiators & bathroom fittings.' },
  { title: 'Electrical', href: '/services/electrical', img: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=250&fit=crop', desc: 'Lighting installations and small electrical jobs.' },
]

const commercialTiles: Tile[] = [
  { title: 'Office Cleaning', href: '/services/cleaning', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop&crop=center', desc: 'Daily/weekly office contracts with audits & sign-off.' },
  { title: 'Retail & Showrooms', href: '/services/cleaning', img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=250&fit=crop&crop=center', desc: 'Front-of-house shine to match your brand.' },
  { title: 'Landscaping', href: '/services/landscaping', img: '/landscaping.jpg', desc: 'Hard & soft landscaping projects, design to build.' },
  { title: 'Plumbing & Heating', href: '/services/plumbing-heating', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=250&fit=crop', desc: 'Commercial pipe repairs, boiler servicing & installations.' },
  { title: 'Electrical', href: '/services/electrical', img: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=250&fit=crop', desc: 'Commercial lighting installations & electrical work.' },
  { title: 'Handyman', href: '/services/handyman', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=250&fit=crop', desc: 'Facility repairs, maintenance & commercial odd jobs.' },
]

const householdTestimonials = [
  { name: 'Hannah', place: 'W4', quote: 'Immaculate every time and so easy to rebook. The deep clean was worth every penny.' },
  { name: 'Josh', place: 'E2', quote: 'Turned up on time, friendly, and left the flat spotless — even the oven!' },
  { name: 'Priya', place: 'SW9', quote: 'Booking took 2 minutes and they worked around my work-from-home day.' },
]

const commercialTestimonials = [
  { name: 'Ops Manager', place: 'Tech Co.', quote: 'They scaled from 3 to 5 days/week as we grew — no drop in quality.' },
  { name: 'Store Lead', place: 'Retail', quote: 'Audits + photos after each visit give us real oversight.' },
  { name: 'Venue GM', place: 'Events', quote: 'Sparkle cleans before events and quick turnarounds afterwards — reliable.' },
]

const heroImages = {
  household: {
    main: 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/window-wom.jpg',
    secondary1: 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/hazmatdust.jpg',
    secondary2: 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/greenshit_vac.jpg',
  },
  commercial: {
    main: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&crop=center',
    secondary1: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=250&fit=crop&crop=center',
    secondary2: 'https://cdn.jsdelivr.net/gh/27100340/eleventhhour-images@master/warehouse.jpg',
  },
}

const coverageAreas = ['Central London', 'North London', 'East London', 'South London', 'West London', 'Surrey & Kent']

function SectionHeader({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3">{title}</h2>
      {lede && <p className="mt-4 text-lg text-ink-soft">{lede}</p>}
    </div>
  )
}

function HeroSection({ isHousehold }: { isHousehold: boolean }) {
  const images = isHousehold ? heroImages.household : heroImages.commercial
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="animate-fade-in">
            <p className="eyebrow">
              {isHousehold ? 'Household cleaning & maintenance' : 'Commercial cleaning & facilities'}
            </p>
            <h1 className="mt-4">
              {isHousehold ? (
                <>When time matters, <span className="text-accent">quality counts.</span></>
              ) : (
                <>Professional spaces, <span className="text-accent">pristine results.</span></>
              )}
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink-soft">
              {isHousehold
                ? "We take care of your home like it's our own. From last-minute refreshes to regular maintenance, our team delivers spotless results — every time."
                : 'Your business environment matters. From offices to retail spaces, our professional teams deliver consistent, reliable service that keeps your workplace pristine.'}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="btn-primary group px-6 py-3 text-base">
                Book now
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
              <Link href="/contact" className="btn-secondary px-6 py-3 text-base">
                Request a quote
              </Link>
            </div>

            <ul className="mt-10 grid gap-x-6 gap-y-3 text-sm text-ink-soft sm:grid-cols-2">
              {[
                isHousehold ? 'Fully insured & DBS-checked' : 'Fully insured & vetted teams',
                isHousehold ? 'Same/next-day availability' : 'Flexible scheduling & contracts',
                'Eco-friendly options',
                isHousehold ? '100% satisfaction guarantee' : 'Quality audits & reporting',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-slide-up">
            <div className="overflow-hidden rounded-(--radius-card) border border-line">
              <img
                className="aspect-[3/2] w-full object-cover"
                src={images.main}
                alt={isHousehold ? 'Professional home cleaning' : 'Commercial office cleaning'}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <img
                className="aspect-[8/5] w-full rounded-(--radius-card) border border-line object-cover"
                src={images.secondary1}
                alt=""
                loading="lazy"
              />
              <img
                className="aspect-[8/5] w-full rounded-(--radius-card) border border-line object-cover"
                src={images.secondary2}
                alt=""
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="tick-rule" />
    </section>
  )
}

function ServicesSection({ isHousehold }: { isHousehold: boolean }) {
  const tiles = isHousehold ? householdTiles : commercialTiles
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow={isHousehold ? 'For your home' : 'For your business'}
            title={isHousehold ? 'Popular household services' : 'Solutions for your business'}
            lede={
              isHousehold
                ? 'Vetted professionals for cleaning, gardening, handyman work and complete property maintenance — so you can focus on what matters.'
                : 'Consistent, reliable service with detailed reporting and flexible scheduling — keeping your business looking its best.'
            }
          />
          <Link
            href={isHousehold ? '/household-services' : '/commercial-services'}
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent transition-colors duration-150 hover:text-accent-dark"
          >
            {isHousehold ? 'All household services' : 'All commercial services'}
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t) => (
            <Link key={t.title} href={t.href} className="card group overflow-hidden">
              <div className="overflow-hidden border-b border-line">
                <img
                  src={t.img}
                  alt={t.title}
                  className="aspect-[8/5] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-6">
                <h3 className="transition-colors duration-150 group-hover:text-accent">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection({ isHousehold }: { isHousehold: boolean }) {
  const steps = [
    {
      title: 'Choose your service',
      desc: isHousehold
        ? 'Select from our range of home services and any extras you need.'
        : 'Pick the service type and scope that matches your business needs.',
    },
    {
      title: 'Schedule & book',
      desc: isHousehold
        ? 'Pick a convenient time slot and pay securely online.'
        : 'We arrange a schedule that works around your business operations.',
    },
    {
      title: 'We deliver',
      desc: isHousehold
        ? 'Our vetted professionals arrive with all supplies and get to work.'
        : 'Uniformed teams follow strict protocols with quality checklists.',
    },
  ]
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="How it works"
          title="Booked in minutes, done in hours"
          lede={`Getting professional ${isHousehold ? 'home' : 'commercial'} services has never been easier.`}
        />
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="border-t-2 border-accent pt-5">
              <span className="font-display text-sm font-semibold tabular-nums text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function WhyChooseUsSection({ isHousehold }: { isHousehold: boolean }) {
  const points = [
    {
      Icon: ShieldCheck,
      title: 'Vetted & insured staff',
      desc: 'All our professionals undergo DBS checks, reference verification, and regular quality audits.',
    },
    {
      Icon: Clock,
      title: 'Flexible scheduling',
      desc: isHousehold
        ? 'One-off, weekly, or bi-weekly visits that fit your lifestyle.'
        : 'Daily, weekly, or out-of-hours contracts tailored to your business.',
    },
    {
      Icon: Leaf,
      title: 'Eco-friendly options',
      desc: 'Low-VOC products and sustainable microfibre cleaning systems available on request.',
    },
    {
      Icon: Users,
      title: isHousehold ? 'Consistent team' : 'Dedicated support',
      desc: isHousehold
        ? 'We assign the same professional where possible for continuity and trust.'
        : 'Single point of contact with dedicated account management and KPI tracking.',
    },
    {
      Icon: Sparkles,
      title: 'Quality assurance',
      desc: isHousehold
        ? 'Comprehensive room-by-room checklists ensure nothing is missed.'
        : 'Photo reports and detailed sign-off sheets for full transparency.',
    },
    {
      Icon: CreditCard,
      title: 'Transparent pricing',
      desc: isHousehold
        ? 'Clear, upfront rates with no hidden fees or surprises.'
        : 'Fixed-rate contracts or flexible time-and-materials pricing.',
    },
  ]
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Why Eleventh Hour"
          title="Reliability you can measure"
          lede="Exceptional service with the professionalism you deserve — and the paperwork to prove it."
        />
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {points.map(({ Icon, title, desc }) => (
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
  )
}

function CoverageSection() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Coverage
            </p>
            <h2 className="mt-3">We cover Greater London</h2>
            <p className="mt-4 text-lg text-ink-soft">
              From Zone 1 to the suburbs — consistent quality everywhere. We also travel for larger
              commercial contracts across the UK.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-3 text-sm text-ink">
              {coverageAreas.map((area) => (
                <li key={area} className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
          <img
            src="https://cdn.jsdelivr.net/gh/27100340/eleventhhour-images@master/london.jpg"
            alt="London cityscape showing our service coverage area"
            className="aspect-[3/2] w-full rounded-(--radius-card) border border-line object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection({ isHousehold }: { isHousehold: boolean }) {
  const testimonials = isHousehold ? householdTestimonials : commercialTestimonials
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="In their words"
          title={isHousehold ? 'What our customers say' : 'What our clients say'}
        />
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
  )
}

function PricingSection({ isHousehold }: { isHousehold: boolean }) {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        {isHousehold ? (
          <>
            <SectionHeader eyebrow="Pricing" title="Simple pricing" />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="card p-7">
                <p className="text-sm font-semibold text-ink-soft">Weekly</p>
                <p className="mt-3 font-display text-3xl font-semibold text-ink">
                  from £18<span className="text-base font-medium text-ink-soft">/hr</span>
                </p>
                <p className="mt-3 text-sm text-ink-soft">Minimum 2 hours. Same cleaner where possible.</p>
              </div>
              <div className="card p-7">
                <p className="text-sm font-semibold text-ink-soft">Bi-weekly</p>
                <p className="mt-3 font-display text-3xl font-semibold text-ink">
                  from £19<span className="text-base font-medium text-ink-soft">/hr</span>
                </p>
                <p className="mt-3 text-sm text-ink-soft">Flexible rescheduling up to 24h before.</p>
              </div>
              <div className="card p-7">
                <p className="text-sm font-semibold text-ink-soft">One-off / deep clean</p>
                <p className="mt-3 font-display text-3xl font-semibold text-ink">Fixed quote</p>
                <p className="mt-3 text-sm text-ink-soft">We&rsquo;ll estimate based on size and extras.</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <SectionHeader
              eyebrow="Pricing"
              title="Tailored quotes for every site"
              lede="Send us your scope and we'll price fairly — no surprises. We can work around opening hours and security procedures."
            />
          </>
        )}
        <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/book" className="btn-primary px-6 py-3 text-base">
            {isHousehold ? 'Get your home booked' : 'Get a site booked'}
          </Link>
          <div className="flex items-center gap-2.5 text-sm text-ink-faint">
            <CreditCard className="h-4 w-4" />
            <span>Secure online payments powered by</span>
            <img src="/stripe.png" alt="Stripe" className="h-5 w-auto" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader eyebrow="Questions" title="FAQs" />
        <dl className="mt-10 grid gap-x-10 md:grid-cols-2">
          {faqs.map(({ q, a }) => (
            <div key={q} className="border-t border-line py-5">
              <dt className="font-semibold text-ink">{q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function CtaBand({ isHousehold }: { isHousehold: boolean }) {
  return (
    <section className="bg-ink text-paper">
      <div aria-hidden="true" className="tick-rule opacity-40" />
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 py-14 md:grid-cols-2">
        <div>
          <h2 className="text-paper">
            {isHousehold ? 'Ready to reclaim your free time?' : 'Ready for a cleaner workplace?'}
          </h2>
          <p className="mt-2 text-paper/70">
            {isHousehold
              ? 'Book a trusted professional in minutes.'
              : 'Book a site visit or start with a trial clean.'}
          </p>
        </div>
        <div className="md:text-right">
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 rounded-(--radius-ctl) bg-paper px-6 py-3 text-base font-semibold text-ink transition-colors duration-150 hover:bg-white"
          >
            {isHousehold ? 'Book home clean' : 'Book commercial clean'}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { mode } = useMode()
  const isHousehold = mode === 'household'

  return (
    <>
      <TopSelectorBar />
      <HeroSection isHousehold={isHousehold} />
      <ServicesSection isHousehold={isHousehold} />
      <HowItWorksSection isHousehold={isHousehold} />
      <WhyChooseUsSection isHousehold={isHousehold} />
      <CoverageSection />
      <TestimonialsSection isHousehold={isHousehold} />
      <PricingSection isHousehold={isHousehold} />
      <FaqSection />
      <CtaBand isHousehold={isHousehold} />
    </>
  )
}
