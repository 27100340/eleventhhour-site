'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Download, Home } from 'lucide-react'

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const bookingId = searchParams.get('booking_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId && bookingId) {
      // Optional: Verify payment status with your backend
      setLoading(false)
    } else {
      setError('Missing session information')
      setLoading(false)
    }
  }, [sessionId, bookingId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/book" className="btn-primary inline-block">
            Return to Booking
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-50 text-lg">Your booking has been confirmed</p>
          </div>

          {/* Booking Details */}
          <div className="px-8 py-8">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-lg mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">What happens next?</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>You'll receive a confirmation email with all the booking details</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Our team will contact you 24 hours before your appointment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Our professionals will arrive at your scheduled time</span>
                </li>
              </ul>
            </div>

            {/* Booking Reference */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
                  <p className="font-mono font-semibold text-gray-900">{bookingId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment ID</p>
                  <p className="font-mono text-sm text-gray-900 truncate">{sessionId}</p>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Important Information
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Please ensure someone is present at the scheduled time</li>
                <li>• Our team arrives with all necessary supplies and equipment</li>
                <li>• You can reschedule up to 24 hours before your appointment</li>
                <li>• Save your booking reference for future correspondence</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="btn-primary flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
              <button
                onClick={() => window.print()}
                className="rounded-full border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Print Confirmation
              </button>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gray-50 px-8 py-6 border-t">
            <p className="text-center text-sm text-gray-600">
              Need help? Contact us at{' '}
              <a href="mailto:hello@eleventhhour.co.uk" className="text-blue-600 font-medium hover:underline">
                hello@eleventhhour.co.uk
              </a>{' '}
              or call{' '}
              <a href="tel:02080000000" className="text-blue-600 font-medium hover:underline">
                020 8000 0000
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">100% Satisfaction Guarantee</h3>
          <p className="text-gray-600 text-sm">
            We're committed to delivering exceptional service. If you're not completely satisfied with our work,
            we'll make it right or provide a full refund. Your happiness is our priority.
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}

// Main export wrapped in Suspense
export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookingSuccessContent />
    </Suspense>
  )
}
