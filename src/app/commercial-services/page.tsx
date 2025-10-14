import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Store, UtensilsCrossed, School, Warehouse, HardHat, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Professional Office & Commercial Cleaning in London | Eleventh Hour Cleaning',
  description: 'Maintain a spotless, professional environment with our tailored commercial cleaning and facility management services for offices, shops, and hospitality venues.',
}

export default function CommercialServicesPage() {
  const services = [
    {
      title: 'Office Cleaning',
      description: 'Daily/weekly office contracts with audits & sign-off for consistent quality.',
      icon: Building2,
    },
    {
      title: 'Retail & Showrooms',
      description: 'Front-of-house shine to match your brand and impress customers.',
      icon: Store,
    },
    {
      title: 'Hospitality',
      description: 'Bars, cafés & restaurants—FOH & BOH standards for food safety compliance.',
      icon: UtensilsCrossed,
    },
    {
      title: 'Education',
      description: 'Schools & nurseries with safer products and flexible cleaning rotas.',
      icon: School,
    },
    {
      title: 'Industrial & Warehousing',
      description: 'High-traffic floors, welfare areas & mezzanines cleaned to safety standards.',
      icon: Warehouse,
    },
    {
      title: 'After Builders',
      description: 'Dust control, sparkle cleans & handover for construction completions.',
      icon: HardHat,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900 mb-6">
              Professional Office & <span className="text-gradient">Commercial Cleaning</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed mb-4">
              Our commercial cleaning teams work quietly, efficiently, and after-hours — keeping your workspace spotless and inviting.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We cater to offices, retail stores, restaurants, and more, ensuring your brand looks as polished as your business.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/book" className="btn-primary">
              Book Commercial Clean
            </Link>
            <Link href="/contact" className="rounded-full border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center">
              Get a Site Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Solutions for Your Business</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive commercial cleaning services tailored to your industry and schedule.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={service.title}
                  className="card p-8 group hover:bg-blue-50 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
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
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&crop=center"
                alt="Professional office cleaning"
                className="relative rounded-2xl shadow-xl w-full h-96 object-cover"
              />
            </div>

            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Us for Your Business?</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Dedicated Support</h3>
                    <p className="text-gray-600">Single point of contact with dedicated account management and KPI tracking for your business.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
                    <p className="text-gray-600">Daily, weekly, or out-of-hours contracts tailored to your business operations and workflow.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                    <p className="text-gray-600">Photo reports and detailed sign-off sheets for full transparency and accountability.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
                    <p className="text-gray-600">Choose between fixed-rate contracts or flexible time-and-materials pricing to suit your budget.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by businesses across London for reliable commercial cleaning services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "They scaled from 3 to 5 days/week as we grew—no drop in quality."
              </p>
              <p className="font-medium text-gray-900">Ops Manager, Tech Co.</p>
            </div>

            <div className="card p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "Audits + photos after each visit give us real oversight."
              </p>
              <p className="font-medium text-gray-900">Store Lead, Retail</p>
            </div>

            <div className="card p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "Sparkle cleans before events and quick turnarounds afterwards—reliable."
              </p>
              <p className="font-medium text-gray-900">Venue GM</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-600 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready for a Cleaner Workplace?</h2>
          <p className="text-xl text-brand-100 mb-8">
            Book a site visit or start with a trial clean to experience our professional commercial services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-brand-600 bg-white rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
              Book Commercial Clean
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
