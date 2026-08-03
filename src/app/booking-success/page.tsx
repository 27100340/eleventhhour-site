'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, Download, Home, FileText, X } from 'lucide-react'
import { downloadInvoice, viewInvoice } from '@/lib/invoice-generator'
import { Spinner } from '@/components/ui/Spinner'

type BookingData = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  postcode: string
  service_date: string | null
  subtotal: number
  discount: number
  total: number
  payment_status: string
  created_at: string
}

type BookingItem = {
  id: string
  service_id: string
  qty: number
  unit_price: number
  services: {
    name: string
  }
}

const nextSteps = [
  "You'll receive a confirmation email with all the booking details",
  'Our team will contact you 24 hours before your appointment',
  'Our professionals will arrive at your scheduled time',
]

const importantInfo = [
  'Please ensure someone is present at the scheduled time',
  'Our team arrives with all necessary supplies and equipment',
  'You can reschedule up to 24 hours before your appointment',
  'Save your booking reference for future correspondence',
]

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const bookingId = searchParams.get('booking_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([])

  useEffect(() => {
    if (sessionId && bookingId) {
      fetchBookingDetails(bookingId, sessionId)
    } else {
      setError('Missing session information')
      setLoading(false)
    }
  }, [sessionId, bookingId])

  async function fetchBookingDetails(id: string, session: string) {
    try {
      const response = await fetch(
        `/api/public/booking/${id}?session_id=${encodeURIComponent(session)}`
      )
      if (!response.ok) throw new Error('Failed to fetch booking details')

      const data = await response.json()
      setBookingData(data.booking)
      setBookingItems(data.items || [])
      setLoading(false)
    } catch {
      setLoading(false)
      // Don't show error, just proceed without invoice generation
    }
  }

  function buildInvoiceData() {
    if (!bookingData || !bookingId) return null
    return {
      invoice_number: `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${bookingId.slice(0, 4).toUpperCase()}`,
      invoice_date: new Date().toLocaleDateString('en-GB'),
      booking_id: bookingId,
      customer: {
        name: `${bookingData.first_name} ${bookingData.last_name}`,
        email: bookingData.email,
        phone: bookingData.phone,
        address: bookingData.address,
        city: bookingData.city,
        postcode: bookingData.postcode,
      },
      service_date: bookingData.service_date
        ? new Date(bookingData.service_date).toLocaleDateString('en-GB')
        : undefined,
      items: bookingItems.map((item) => ({
        service_name: item.services?.name || 'Service',
        qty: item.qty,
        unit_price: item.unit_price,
        total: item.qty * item.unit_price,
      })),
      subtotal: bookingData.subtotal,
      discount: bookingData.discount,
      total: bookingData.total,
      payment_status: bookingData.payment_status,
    }
  }

  function handleDownloadInvoice() {
    const invoiceData = buildInvoiceData()
    if (invoiceData) downloadInvoice(invoiceData)
  }

  function handleViewInvoice() {
    const invoiceData = buildInvoiceData()
    if (invoiceData) viewInvoice(invoiceData)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-accent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="w-full max-w-md rounded-(--radius-card) border border-line bg-surface p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <X className="h-7 w-7 text-red-700" />
          </div>
          <h1 className="mt-5 text-2xl">Something went wrong</h1>
          <p className="mt-3 text-ink-soft">{error}</p>
          <Link href="/book" className="btn-primary mt-6 inline-flex">
            Return to booking
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-(--radius-card) border border-line bg-surface">
          {/* Success header */}
          <div className="bg-ink px-8 py-12 text-center text-paper">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-paper">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h1 className="mt-5 text-paper">Payment successful</h1>
            <p className="mt-2 text-paper/70">Your booking has been confirmed</p>
          </div>
          <div aria-hidden="true" className="tick-rule" />

          {/* Booking details */}
          <div className="px-6 py-8 md:px-8">
            <div className="rounded-(--radius-card) bg-accent-tint p-6">
              <h2 className="text-lg text-accent-dark">What happens next?</h2>
              <ol className="mt-3 space-y-2.5">
                {nextSteps.map((stepText, i) => (
                  <li key={stepText} className="flex items-start gap-3 text-sm leading-relaxed text-accent-dark/90">
                    <span className="font-display font-semibold tabular-nums text-accent-dark">{i + 1}.</span>
                    {stepText}
                  </li>
                ))}
              </ol>
            </div>

            {/* Booking reference */}
            <div className="mt-6 rounded-(--radius-card) border border-line bg-paper p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Booking reference
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-ink">{bookingId}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Payment ID
                  </p>
                  <p className="mt-1 truncate font-mono text-sm text-ink">{sessionId}</p>
                </div>
              </div>
            </div>

            {/* Important information */}
            <div className="mt-6 rounded-(--radius-card) border border-line p-6">
              <h3 className="text-base">Important information</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
                {importantInfo.map((info) => (
                  <li key={info} className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {info}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/" className="btn-primary">
                <Home className="h-4 w-4" />
                Back to home
              </Link>
              {bookingData && (
                <>
                  <button onClick={handleDownloadInvoice} className="btn-secondary">
                    <Download className="h-4 w-4" />
                    Download invoice
                  </button>
                  <button onClick={handleViewInvoice} className="btn-secondary">
                    <FileText className="h-4 w-4" />
                    View invoice
                  </button>
                </>
              )}
              <button onClick={() => window.print()} className="btn-secondary">
                <Download className="h-4 w-4" />
                Print confirmation
              </button>
            </div>
          </div>

          {/* Contact support */}
          <div className="border-t border-line bg-paper px-8 py-6">
            <p className="text-center text-sm text-ink-soft">
              Need help? Contact us at{' '}
              <a href="mailto:hello@eleventhhourcleaning.co.uk" className="font-medium text-accent hover:text-accent-dark">
                hello@eleventhhourcleaning.co.uk
              </a>{' '}
              or call{' '}
              <a href="tel:+442033551526" className="font-medium text-accent hover:text-accent-dark">
                020 3355 1526
              </a>
            </p>
          </div>
        </div>

        {/* Guarantee */}
        <div className="mt-6 rounded-(--radius-card) border border-line bg-surface p-6">
          <h3 className="text-base">100% satisfaction guarantee</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            We&rsquo;re committed to delivering exceptional service. If you&rsquo;re not completely
            satisfied with our work, we&rsquo;ll make it right or provide a full refund. Your
            happiness is our priority.
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="h-8 w-8 text-accent" />
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookingSuccessContent />
    </Suspense>
  )
}
