import { notFound } from 'next/navigation'
import { getService } from '@/lib/services'
import Link from 'next/link'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function ServicePage({ params }: { params: { slug: string } }) {
  const svc = getService(params.slug)
  if (!svc) return notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="text-5xl font-bold text-black mb-4">{svc.name}</h1>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl">{svc.blurb}</p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/book" className="btn-primary">
              Book {svc.name} Service
            </Link>
            <Link href="/contact" className="rounded-full border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center">
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Sub-services Section */}
      {svc.subServices && svc.subServices.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Services Include:</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {svc.subServices.map((subService) => (
                <div key={subService} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-800 font-medium">{subService}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Special Note */}
      {svc.specialNote && (
        <section className="py-8 bg-blue-50">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-start gap-4 bg-blue-100 p-6 rounded-xl border border-blue-200">
              <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Important Note</h3>
                <p className="text-blue-800">{svc.specialNote}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Images Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">See Our Work</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {svc.images.map(src => (
              <img key={src} src={src} alt={svc.name} className="rounded-2xl shadow-lg w-full h-80 object-cover" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-600 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your {svc.name} Service?</h2>
          <p className="text-xl text-brand-100 mb-8">
            Get started today with professional service from trusted experts.
          </p>
          <Link href="/book" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-brand-600 bg-white rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
            Book Now
          </Link>
        </div>
      </section>
    </div>
  )
}
