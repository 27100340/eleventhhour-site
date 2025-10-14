import type { Metadata } from 'next'
import { ShieldCheck, Leaf, Clock, PhoneCall } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Eleventh Hour Cleaning | London\'s Trusted Property Care Experts',
  description: 'Learn more about Eleventh Hour Cleaning — London\'s premium cleaning and maintenance service offering exceptional care for homes and businesses.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900 mb-6">
              About <span className="text-gradient">Eleventh Hour Cleaning</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Eleventh Hour Cleaning was founded on a simple idea: <strong>premium service without the premium stress.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  We bring together experienced cleaners, engineers, and maintenance experts under one trusted name — offering reliable, last-minute and scheduled services for homes and businesses that value quality.
                </p>
                <p>
                  From elegant townhouses to bustling offices, we understand what true cleanliness looks like. Our team of vetted professionals handles everything — cleaning, gardening, handyman work, and complete property maintenance — so you can relax and focus on what truly matters.
                </p>
                <p className="text-xl font-semibold text-gray-900 mt-6">
                  When we say "Eleventh Hour," we mean it — we're there when you need us most.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop&crop=center"
                alt="Professional cleaning team"
                className="relative rounded-2xl shadow-xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">We pride ourselves on:</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These are the principles that guide everything we do at Eleventh Hour Cleaning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card p-8 text-center group hover:bg-blue-50 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fully insured & background-checked staff</h3>
              <p className="text-gray-600 leading-relaxed">
                Every team member undergoes thorough vetting, DBS checks, and is fully insured for your peace of mind.
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-emerald-50 transition-colors">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
                <Leaf className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Eco-conscious cleaning methods</h3>
              <p className="text-gray-600 leading-relaxed">
                We use environmentally friendly products and sustainable practices to protect your home and our planet.
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-purple-50 transition-colors">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparent pricing and punctual service</h3>
              <p className="text-gray-600 leading-relaxed">
                No hidden fees, no surprises. We arrive on time and deliver exactly what we promise.
              </p>
            </div>

            <div className="card p-8 text-center group hover:bg-amber-50 transition-colors">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-200 transition-colors">
                <PhoneCall className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 emergency call-outs</h3>
              <p className="text-gray-600 leading-relaxed">
                When emergencies happen, we're ready to respond — day or night, weekday or weekend.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to experience the difference?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers who trust Eleventh Hour Cleaning for their property care needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="btn-primary">
              Book a Service
            </Link>
            <Link href="/contact" className="rounded-full border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
