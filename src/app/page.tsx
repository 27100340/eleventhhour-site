'use client'
import { useMode } from '@/components/ModeContext'
import Link from 'next/link'
import { ShieldCheck, Leaf, Clock, Sparkles, Users, CreditCard } from 'lucide-react'

type Tile = { title: string; href: string; img: string; desc: string }

const faqs = [
  { q: 'Do you bring supplies?', a: 'Yes—hospital-grade supplies and eco options on request.' },
  { q: 'Are you insured?', a: 'Fully insured & background-checked operatives.' },
  { q: 'Which areas do you cover?', a: 'Greater London and surrounding areas.' },
  { q: 'Can I reschedule?', a: 'Of course. You can reschedule up to 24h before your appointment.' },
]

const householdTiles: Tile[] = [
  { title: 'Regular Cleaning', href: '/services/cleaning', img: '/hh-regular.jpg', desc: 'Weekly & bi-weekly home cleans with the same pro.' },
  { title: 'Deep Cleaning', href: '/services/cleaning', img: '/hh-deep.jpg', desc: 'Spring clean: skirtings, limescale, inside appliances & more.' },
  { title: 'End of Tenancy', href: '/services/cleaning', img: '/hh-eot.jpg', desc: 'Inventory-ready cleans for tenants & landlords.' },
  { title: 'Carpet & Upholstery', href: '/services/cleaning', img: '/hh-carpet.jpg', desc: 'Hot water extraction for carpets, rugs & sofas.' },
  { title: 'Oven Cleaning', href: '/services/cleaning', img: '/hh-oven.jpg', desc: 'Dip-tank oven cleaning for a showroom shine.' },
  { title: 'Window Cleaning', href: '/services/cleaning', img: '/hh-windows.jpg', desc: 'Streak-free interiors and reachable exteriors.' },
]

const commercialTiles: Tile[] = [
  { title: 'Office Cleaning', href: '/services/cleaning', img: '/com-office.jpg', desc: 'Daily/weekly office contracts with audits & sign-off.' },
  { title: 'Retail & Showrooms', href: '/services/cleaning', img: '/com-retail.jpg', desc: 'Front-of-house shine to match your brand.' },
  { title: 'Hospitality', href: '/services/cleaning', img: '/com-hospitality.jpg', desc: 'Bars, cafés & restaurants—FOH & BOH standards.' },
  { title: 'Education', href: '/services/cleaning', img: '/com-education.jpg', desc: 'Schools & nurseries with safer products and rotas.' },
  { title: 'Industrial & Warehousing', href: '/services/cleaning', img: '/com-industrial.jpg', desc: 'High-traffic floors, welfare areas & mezzanines.' },
  { title: 'After Builders', href: '/services/cleaning', img: '/com-builders.jpg', desc: 'Dust control, sparkle cleans & handover.' },
]

const householdTestimonials = [
  { name: 'Hannah • W4', quote: 'Immaculate every time and so easy to rebook. The deep clean was worth every penny.' },
  { name: 'Josh • E2', quote: 'Turned up on time, friendly, and left the flat spotless—even the oven!' },
  { name: 'Priya • SW9', quote: 'Booking took 2 minutes and they worked around my work-from-home day.' },
]

const commercialTestimonials = [
  { name: 'Ops Manager, Tech Co.', quote: 'They scaled from 3 to 5 days/week as we grew—no drop in quality.' },
  { name: 'Store Lead, Retail', quote: 'Audits + photos after each visit give us real oversight.' },
  { name: 'Venue GM', quote: 'Sparkle cleans before events and quick turnarounds afterwards—reliable.' },
]

export default function HomePage() {
  const { mode } = useMode()
  const isHousehold = mode === 'household'
  const tiles = isHousehold ? householdTiles : commercialTiles
  const testimonials = isHousehold ? householdTestimonials : commercialTestimonials

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {isHousehold ? 'Spotless homes, on your schedule.' : 'Reliable commercial cleaning that scales.'}
            </h1>
            <p className="mt-4 text-lg text-slate-700">
              EleventhHour provides {isHousehold ? 'domestic' : 'commercial'} cleaning across the UK with vetted pros,
              transparent pricing and flexible booking.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/book" className="btn-primary">Book Now</Link>
              <Link href="/services/cleaning" className="rounded-full border px-6 py-3 font-semibold">View Services</Link>
            </div>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm text-slate-700">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-600" /> Fully insured & DBS-checked</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-600" /> Same/next-day slots</li>
              <li className="flex items-center gap-2"><Leaf className="h-4 w-4 text-brand-600" /> Eco-friendly options</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-600" /> 100% satisfaction promise</li>
            </ul>
          </div>
          <div className="grid gap-4">
            <img className="rounded-2xl shadow-xl w-full object-cover"
              src={isHousehold ? '/domestic1.jpg' : '/commercial.jpg'}
              alt={isHousehold ? 'Domestic cleaning' : 'Commercial cleaning'}
            />
            <div className="grid grid-cols-2 gap-4">
              <img className="rounded-xl shadow w-full h-40 object-cover" src={isHousehold ? '/hh-gallery-1.jpg' : '/com-gallery-1.jpg'} alt="Work example 1" />
              <img className="rounded-xl shadow w-full h-40 object-cover" src={isHousehold ? '/hh-gallery-2.jpg' : '/com-gallery-2.jpg'} alt="Work example 2" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">{isHousehold ? 'Popular household services' : 'Solutions for your business'}</h2>
          <Link href="/services/cleaning" className="text-sm font-medium hover:underline">See all services →</Link>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiles.map(t => (
            <Link key={t.title} href={t.href} className="rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow">
              <img src={t.img} alt={t.title} className="h-44 w-full object-cover" />
              <div className="p-4">
                <p className="font-semibold">{t.title}</p>
                <p className="mt-1 text-sm text-slate-600">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-semibold">How booking works</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border p-6">
              <div className="h-10 w-10 grid place-items-center rounded-full bg-brand-50 border border-brand-100">1</div>
              <p className="mt-3 font-medium">Choose your service</p>
              <p className="text-sm text-slate-600 mt-1">{isHousehold ? 'Select a home clean and any extras you’d like.' : 'Pick the service type and scope for your site.'}</p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="h-10 w-10 grid place-items-center rounded-full bg-brand-50 border border-brand-100">2</div>
              <p className="mt-3 font-medium">Pick date & time</p>
              <p className="text-sm text-slate-600 mt-1">{isHousehold ? 'Live availability with morning/afternoon windows.' : 'We agree a schedule that fits your operations.'}</p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="h-10 w-10 grid place-items-center rounded-full bg-brand-50 border border-brand-100">3</div>
              <p className="mt-3 font-medium">We get it done</p>
              <p className="text-sm text-slate-600 mt-1">{isHousehold ? 'Your pro arrives with supplies and gets to work.' : 'Uniformed teams, site inductions and checklists.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold">Why choose EleventhHour</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border p-6">
            <ShieldCheck className="h-6 w-6 text-brand-600" />
            <p className="mt-3 font-medium">Vetted & insured staff</p>
            <p className="text-sm text-slate-600 mt-1">DBS checks, references and ongoing quality audits.</p>
          </div>
          <div className="rounded-2xl border p-6">
            <Clock className="h-6 w-6 text-brand-600" />
            <p className="mt-3 font-medium">Flexible scheduling</p>
            <p className="text-sm text-slate-600 mt-1">{isHousehold ? 'One-off, weekly or bi-weekly visits.' : 'Daily, weekly or out-of-hours contracts.'}</p>
          </div>
          <div className="rounded-2xl border p-6">
            <Leaf className="h-6 w-6 text-brand-600" />
            <p className="mt-3 font-medium">Eco options</p>
            <p className="text-sm text-slate-600 mt-1">Low-VOC products and microfibre systems available.</p>
          </div>
          <div className="rounded-2xl border p-6">
            <Users className="h-6 w-6 text-brand-600" />
            <p className="mt-3 font-medium">{isHousehold ? 'Same cleaner' : 'Dedicated account manager'}</p>
            <p className="text-sm text-slate-600 mt-1">{isHousehold ? 'Where possible we keep the same professional for continuity.' : 'Single point of contact, KPIs and monthly reviews.'}</p>
          </div>
          <div className="rounded-2xl border p-6">
            <Sparkles className="h-6 w-6 text-brand-600" />
            <p className="mt-3 font-medium">Quality checklists</p>
            <p className="text-sm text-slate-600 mt-1">{isHousehold ? 'Room-by-room checklists included.' : 'Sign-off sheets and photo reports on request.'}</p>
          </div>
          <div className="rounded-2xl border p-6">
            <CreditCard className="h-6 w-6 text-brand-600" />
            <p className="mt-3 font-medium">Transparent pricing</p>
            <p className="text-sm text-slate-600 mt-1">{isHousehold ? 'Clear rates with no hidden fees.' : 'Fixed-rate or time-and-materials—your choice.'}</p>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold">We cover Greater London</h2>
            <p className="mt-3 text-slate-700">From Zone 1 to the suburbs—same quality everywhere. We also travel for larger commercial contracts.</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-700">
              <li>Central London</li><li>North London</li><li>East London</li><li>South London</li><li>West London</li><li>Surrey & Kent (select areas)</li>
            </ul>
          </div>
          <img src={isHousehold ? '/coverage-london.jpg' : '/coverage-commercial.jpg'} alt="Service area map" className="rounded-2xl shadow object-cover w-full h-64" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold">{isHousehold ? 'What households say' : 'What our clients say'}</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="rounded-2xl border p-6">
              <p className="text-slate-700">“{t.quote}”</p>
              <p className="mt-3 text-sm font-medium text-slate-600">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing / Quote */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          {isHousehold ? (
            <>
              <h2 className="text-2xl font-semibold">Simple pricing</h2>
              <div className="mt-6 grid md:grid-cols-3 gap-6">
                <div className="rounded-2xl border p-6">
                  <p className="font-semibold">Weekly</p>
                  <p className="text-3xl font-bold mt-2">from £18<span className="text-base font-medium">/hr</span></p>
                  <p className="text-sm text-slate-600 mt-2">Minimum 2 hours. Same cleaner where possible.</p>
                </div>
                <div className="rounded-2xl border p-6">
                  <p className="font-semibold">Bi-Weekly</p>
                  <p className="text-3xl font-bold mt-2">from £19<span className="text-base font-medium">/hr</span></p>
                  <p className="text-sm text-slate-600 mt-2">Flexible rescheduling up to 24h before.</p>
                </div>
                <div className="rounded-2xl border p-6">
                  <p className="font-semibold">One-Off / Deep Clean</p>
                  <p className="text-3xl font-bold mt-2">fixed quote</p>
                  <p className="text-sm text-slate-600 mt-2">We’ll estimate based on size and extras.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">Tailored quotes for every site</h2>
              <p className="mt-3 text-slate-700">Send us your scope and we’ll price fairly—no surprises. We can work around opening hours and security procedures.</p>
            </>
          )}
          <div className="mt-6">
            <Link href="/book" className="btn-primary">Get {isHousehold ? 'your home' : 'a site'} booked</Link>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-semibold">Recent work</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <img
                key={i}
                src={isHousehold ? `/hh-gallery-${(i % 4) + 1}.jpg` : `/com-gallery-${(i % 4) + 1}.jpg`}
                alt="Cleaning example"
                className="rounded-xl object-cover w-full h-40"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-brand-600">
        <div className="mx-auto max-w-6xl px-4 py-10 text-white grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-2xl font-semibold">{isHousehold ? 'Ready to reclaim your free time?' : 'Ready for a cleaner workplace?'}</h2>
            <p className="mt-2 text-brand-100">{isHousehold ? 'Book a trusted professional in minutes.' : 'Book a site visit or start with a trial clean.'}</p>
          </div>
          <div className="md:text-right">
            <Link href="/book" className="inline-block rounded-full bg-white text-brand-600 px-6 py-3 font-semibold shadow hover:bg-brand-50">
              {isHousehold ? 'Book home clean' : 'Book commercial clean'}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs (kept, expanded) */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold">FAQs</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {faqs.map(({ q, a }) => (
            <div key={q} className="rounded-2xl border p-5">
              <p className="font-medium">{q}</p>
              <p className="mt-2 text-slate-700 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
