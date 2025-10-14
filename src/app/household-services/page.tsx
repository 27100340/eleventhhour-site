import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, Sparkles, Calendar, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Trusted Household Cleaning & Maintenance Services | Eleventh Hour Cleaning',
  description: 'Enjoy a spotless home with our premium household cleaning, gardening, and maintenance services. Discreet, reliable, and tailored for London\'s busy professionals.',
}

export default function HouseholdServicesPage() {
  const services = [
    {
      title: 'Regular Cleaning',
      description: 'Weekly & bi-weekly home cleans with the same professional for consistency and trust.',
      icon: Calendar,
    },
    {
      title: 'Deep Cleaning',
      description: 'Spring clean: skirtings, limescale, inside appliances & more for a thorough refresh.',
      icon: Sparkles,
    },
    {
      title: 'End of Tenancy',
      description: 'Inventory-ready cleans for tenants & landlords to ensure deposit return.',
      icon: Home,
    },
    {
      title: 'Carpet & Upholstery',
      description: 'Hot water extraction for carpets, rugs & sofas to restore freshness.',
      icon: CheckCircle,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cream via-white to-brand-sage/20" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-brand-charcoal mb-6">
              Household Cleaning & <span className="text-gradient">Maintenance Services</span>
            </h1>
            <p className="text-xl text-brand-charcoal/80 leading-relaxed mb-4">
              Your home deserves care, not compromise.
            </p>
            <p className="text-lg text-brand-charcoal/70 leading-relaxed">
              Our domestic cleaning and maintenance experts ensure every corner feels fresh, organized, and comfortable. We handle regular cleans, deep refreshes, and seasonal upkeep — so your home always feels effortlessly pristine.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/book" className="btn-primary">
              Book a Home Clean
            </Link>
            <Link href="/contact" className="rounded-full border-2 border-brand-stone px-8 py-3 font-semibold text-brand-charcoal hover:bg-brand-cream transition-colors text-center">
              Get a Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-brand-cream">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Household Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From one-time deep cleans to regular maintenance, we provide comprehensive home care services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={service.title}
                  className="card p-8 text-center group hover:bg-brand-sage/20 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-brand-sage/40 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-sage/60 transition-colors">
                    <Icon className="h-8 w-8 text-brand-amber" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-charcoal mb-3">{service.title}</h3>
                  <p className="text-brand-charcoal/70 leading-relaxed">{service.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-brand-charcoal mb-6">Why Choose Us for Your Home?</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-sage/40 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-5 w-5 text-brand-amber" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Same Professional Where Possible</h3>
                    <p className="text-gray-600">We assign the same cleaner for continuity and to build trust with your family.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-sage/40 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-5 w-5 text-brand-amber" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
                    <p className="text-gray-600">One-off, weekly, or bi-weekly visits that fit your lifestyle and routine.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-sage/40 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-5 w-5 text-brand-amber" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                    <p className="text-gray-600">Comprehensive room-by-room checklists ensure nothing is missed in your home.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-sage/40 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-5 w-5 text-brand-amber" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
                    <p className="text-gray-600">Clear, upfront rates with no hidden fees or surprises.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-amber/10 to-brand-sage/10 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop&crop=center"
                alt="Professional home cleaning"
                className="relative rounded-2xl shadow-xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-600 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Reclaim Your Free Time?</h2>
          <p className="text-xl text-brand-100 mb-8">
            Book a trusted professional in minutes and enjoy a spotless home without the hassle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-brand-600 bg-white rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
              Book Home Clean
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white/10 transition-colors">
              Request a Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
