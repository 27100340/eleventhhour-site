'use client'
import { useMode } from '@/components/ModeContext'
import TopSelectorBar from '@/components/TopSelectorBar'
import Link from 'next/link'
import { ShieldCheck, Leaf, Clock, Sparkles, Users, CreditCard, ArrowRight, Star, MapPin, CheckCircle } from 'lucide-react'

type Tile = { title: string; href: string; img: string; desc: string }

const faqs = [
  { q: 'Do you bring supplies?', a: 'Yes—hospital-grade supplies and eco options on request.' },
  { q: 'Are you insured?', a: 'Fully insured & background-checked operatives.' },
  { q: 'Which areas do you cover?', a: 'Greater London and surrounding areas.' },
  { q: 'Can I reschedule?', a: 'Of course. You can reschedule up to 24h before your appointment.' },
]

const householdTiles: Tile[] = [
  { title: 'Regular Cleaning', href: '/services/cleaning', img: 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/sinksoap.jpg', desc: 'Weekly & bi-weekly home cleans with the same pro.' },
  { title: 'Deep Cleaning', href: '/services/cleaning', img: 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/deepclean.jpg', desc: 'Spring clean: skirtings, limescale, inside appliances & more.' },
  { title: 'End of Tenancy', href: '/services/cleaning', img: 'https://cdn.jsdelivr.net/gh/27100340/eleventhhour-images@master/eotclean.jpg', desc: 'Inventory-ready cleans for tenants & landlords.' },
  { title: 'Carpet & Upholstery', href: '/services/cleaning', img: 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/carp1.jpg', desc: 'Hot water extraction for carpets, rugs & sofas.' },
  { title: 'Oven Cleaning', href: '/services/cleaning', img: 'https://cdn.jsdelivr.net/gh/27100340/eleventhhour-images@master/oven_cleaning.jpg', desc: 'Dip-tanKOk oven cleaning for a showroom shine.' },
  { title: 'Window Cleaning', href: '/services/cleaning', img: 'https://cdn.jsdelivr.net/gh/27100340/eleventhhour-images@master/window.jpg', desc: 'Streak-free interiors and reachable exteriors.' },
]

const commercialTiles: Tile[] = [
  { title: 'Office Cleaning', href: '/services/cleaning', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop&crop=center', desc: 'Daily/weekly office contracts with audits & sign-off.' },
  { title: 'Retail & Showrooms', href: '/services/cleaning', img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=250&fit=crop&crop=center', desc: 'Front-of-house shine to match your brand.' },
  { title: 'Hospitality', href: '/services/cleaning', img: 'https://cdn.jsdelivr.net/gh/27100340/eleventhhour-images@master/resclean.jpg', desc: 'Bars, cafés & restaurants—FOH & BOH standards.' },
  { title: 'Education', href: '/services/cleaning', img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop&crop=center', desc: 'Schools & nurseries with safer products and rotas.' },
  { title: 'Industrial & Warehousing', href: '/services/cleaning', img: 'https://cdn.jsdelivr.net/gh/27100340/eleventhhour-images@master/warehouse.jpg', desc: 'High-traffic floors, welfare areas & mezzanines.' },
  { title: 'After Builders', href: '/services/cleaning', img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop&crop=center', desc: 'Dust control, sparkle cleans & handover.' },
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

function getServiceImage(title: string, isHousehold: boolean): string {
  const serviceImages = {
    household: {
      'Regular Cleaning': '1581578731548-c64695cc6952',
      'Deep Cleaning': '1558618047-3c8c76ca7d13',
      'End of Tenancy': '1584622650111-993a426fbf0a',
      'Carpet & Upholstery': '1586023492304-3b503d85e6ff',
      'Oven Cleaning': '1556909114-f6e7ad7d3136',
      'Window Cleaning': '1527515637462-cfc2a9b22c7e',
    },
    commercial: {
      'Office Cleaning': '1497366216548-37526070297c',
      'Retail & Showrooms': '1497366811353-6870744d04b2',
      'Hospitality': '1414235077428-338989a2e8c0',
      'Education': '1580582932707-520aed937b7b',
      'Industrial & Warehousing': '1586023492304-3b503d85e6ff',
      'After Builders': '1541888946425-d81bb19240f5',
    }
  }

  const images = isHousehold ? serviceImages.household : serviceImages.commercial
  return images[title as keyof typeof images] || '1581578731548-c64695cc6952'
}

export default function HomePage() {
  const { mode } = useMode()
  const isHousehold = mode === 'household'
  const tiles = isHousehold ? householdTiles : commercialTiles
  const testimonials = isHousehold ? householdTestimonials : commercialTestimonials

  return (
    <>
      <TopSelectorBar />
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cream via-white to-brand-sage/20" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-sage/30 text-brand-charcoal text-sm font-medium rounded-full mb-6">
                <Star className="h-4 w-4" fill="currentColor" />
                Trusted by 10,000+ customers
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
                When Time Matters, <span className="text-gradient">Quality Counts.</span>
              </h1>

              <p className="mt-6 text-lg text-gray-600 max-w-lg">
                At Eleventh Hour Cleaning, we take care of your space like it's our own. Whether it's a last-minute home refresh or a full commercial clean, our team delivers spotless results — every time.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/book" className="btn-primary group">
                  Book Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/contact" className="rounded-full border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center">
                  Request a Quote
                </Link>
              </div>

              <div className="mt-10 grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="flex-shrink-0 w-8 h-8 bg-brand-sage/40 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-brand-amber" />
                  </div>
                  <span>Fully insured & DBS-checked</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="flex-shrink-0 w-8 h-8 bg-brand-sage/40 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-brand-amber" />
                  </div>
                  <span>Same/next-day availability</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Leaf className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span>Eco-friendly options</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                  </div>
                  <span>100% satisfaction guarantee</span>
                </div>
              </div>
            </div>

            <div className="animate-slide-up">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-amber/15 to-brand-sage/15 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-2xl p-6 shadow-soft-lg border border-gray-200/50">
                  <img
                    className="rounded-xl w-full h-72 object-cover"
                    src={isHousehold
                      ? 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/window-wom.jpg'
                      : 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/window-wom.jpg'
                    }
                    alt={isHousehold ? 'Professional home cleaning' : 'Commercial office cleaning'}
                  />
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <img
                      className="rounded-lg w-full h-32 object-cover"
                      src={isHousehold
                        ? 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/hazmatdust.jpg'
                        : 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/hazmatdust.jpg'
                      }
                      alt="Service example 1"
                    />
                    <img
                      className="rounded-lg w-full h-32 object-cover"
                      src={isHousehold
                        ? 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/greenshit_vac.jpg'
                        : 'https://biacudctwrcjtlmzetlj.supabase.co/storage/v1/object/public/website-images/greenshit_vac.jpg'
                      }
                      alt="Service example 2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {isHousehold ? 'Popular household services' : 'Solutions for your business'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From elegant townhouses to bustling offices, we understand what true cleanliness looks like. Our team of vetted professionals handles everything — cleaning, gardening, handyman work, and complete property maintenance — so you can relax and focus on what truly matters.
            </p>
            <p className="text-lg text-gray-900 font-semibold mt-4">
              Premium cleaning. Reliable service. Exceptional care.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tiles.map((t, index) => (
              <Link
                key={t.title}
                href={t.href}
                className="group card hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={t.img ? (t.img.startsWith('http') ? t.img : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_BUCKET || 'website-images'}/${t.img}`) : `https://images.unsplash.com/photo-${getServiceImage(t.title, isHousehold)}?w=400&h=250&fit=crop&crop=center`}
                    alt={t.title}
                    className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-brand-charcoal group-hover:text-brand-amber transition-colors">
                    {t.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t.desc}</p>
                  <div className="mt-4 flex items-center text-brand-amber text-sm font-medium">
                    Learn more
                    <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting professional {isHousehold ? 'home' : 'commercial'} services has never been easier. Here's our simple 3-step process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="absolute -inset-2 bg-brand-amber/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Choose your service</h3>
              <p className="text-gray-600 leading-relaxed">
                {isHousehold
                  ? 'Select from our range of home services and any extras you need.'
                  : 'Pick the service type and scope that matches your business needs.'}
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mx-auto w-16 h-16 bg-brand-amber rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="absolute -inset-2 bg-brand-amber/25 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Schedule & book</h3>
              <p className="text-gray-600 leading-relaxed">
                {isHousehold
                  ? 'Pick a convenient time slot with our real-time availability system.'
                  : 'We arrange a schedule that works around your business operations.'}
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="absolute -inset-2 bg-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">We deliver excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                {isHousehold
                  ? 'Our vetted professionals arrive with all supplies and get to work.'
                  : 'Uniformed teams follow strict protocols with quality checklists.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why choose EleventhHour</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to delivering exceptional service with the reliability and professionalism you deserve.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-8 text-center group hover:bg-brand-sage/20">
              <div className="w-12 h-12 bg-brand-sage/40 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-sage/60 transition-colors">
                <ShieldCheck className="h-6 w-6 text-brand-amber" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vetted & insured staff</h3>
              <p className="text-gray-600 text-sm leading-relaxed">All our professionals undergo DBS checks, reference verification, and regular quality audits.</p>
            </div>

            <div className="card p-8 text-center group hover:bg-brand-sage/20">
              <div className="w-12 h-12 bg-brand-sage/40 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-sage/60 transition-colors">
                <Clock className="h-6 w-6 text-brand-amber" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible scheduling</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{isHousehold ? 'One-off, weekly, or bi-weekly visits that fit your lifestyle.' : 'Daily, weekly, or out-of-hours contracts tailored to your business.'}</p>
            </div>

            <div className="card p-8 text-center group hover:bg-emerald-50">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                <Leaf className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Eco-friendly options</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Low-VOC products and sustainable microfibre cleaning systems available on request.</p>
            </div>

            <div className="card p-8 text-center group hover:bg-purple-50">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{isHousehold ? 'Consistent team' : 'Dedicated support'}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{isHousehold ? 'We assign the same professional where possible for continuity and trust.' : 'Single point of contact with dedicated account management and KPI tracking.'}</p>
            </div>

            <div className="card p-8 text-center group hover:bg-amber-50">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality assurance</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{isHousehold ? 'Comprehensive room-by-room checklists ensure nothing is missed.' : 'Photo reports and detailed sign-off sheets for full transparency.'}</p>
            </div>

            <div className="card p-8 text-center group hover:bg-brand-sage/20">
              <div className="w-12 h-12 bg-brand-sage/40 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-sage/60 transition-colors">
                <CreditCard className="h-6 w-6 text-brand-amber" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent pricing</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{isHousehold ? 'Clear, upfront rates with no hidden fees or surprises.' : 'Choose between fixed-rate contracts or flexible time-and-materials pricing.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
                <MapPin className="h-4 w-4" />
                Service Coverage
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">We cover Greater London</h2>
              <p className="text-lg text-gray-600 mb-8">
                From Zone 1 to the suburbs—consistent quality everywhere. We also travel for larger commercial contracts across the UK.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Central London</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>North London</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>East London</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>South London</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>West London</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Surrey & Kent</span>
                </div>
              </div>

            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-3xl blur-2xl" />
              <img
                src="https://cdn.jsdelivr.net/gh/27100340/eleventhhour-images@master/london.jpg"
                alt="London cityscape showing our service coverage area"
                className="relative rounded-2xl shadow-xl w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {isHousehold ? 'What our customers say' : 'What our clients say'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what real customers have to say about our services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <div
                key={t.name}
                className="card p-8 relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t.name.split(' •')[0]}</p>
                    {t.name.includes('•') && (
                      <p className="text-sm text-gray-500">{t.name.split(' •')[1]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                  <p className="text-sm text-slate-600 mt-2">We'll estimate based on size and extras.</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-500">
                <CreditCard className="h-4 w-4" />
                <span>Secure online payments powered by</span>
                <img src="/stripe.png" alt="Stripe" className="h-5 w-auto" />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">Tailored quotes for every site</h2>
              <p className="mt-3 text-slate-700">Send us your scope and we'll price fairly—no surprises. We can work around opening hours and security procedures.</p>
              <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
                <CreditCard className="h-4 w-4" />
                <span>Secure online payments powered by</span>
                <img src="/stripe.png" alt="Stripe" className="h-5 w-auto" />
              </div>
            </>
          )}
          <div className="mt-6">
            <Link href="/book" className="btn-primary">Get {isHousehold ? 'your home' : 'a site'} booked</Link>
          </div>
        </div>
      </section>

      {/* Gallery removed per request */}

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
