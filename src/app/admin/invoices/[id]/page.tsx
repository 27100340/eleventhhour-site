'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Printer, ArrowLeft } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { useAdminGuard } from '@/lib/use-admin-guard'
import { useToast } from '@/components/ui/Toast'

type Invoice = {
  id: string
  booking_id: string
  invoice_number: string | null
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'void'
  due_date: string | null
  issued_date: string | null
  notes: string | null
  created_at: string
  bookings: {
    id: string
    email: string
    first_name: string
    last_name: string
    address: string
    city: string
    postcode: string
    phone: string
    service_date: string | null
    subtotal: number
    total: number
    discount: number
    admin_total_override: number | null
  }
}

type Item = {
  id: string
  service_id: string
  qty: number
  unit_price: number
  time_minutes: number
  services: { name: string; parent_id?: string; category_type?: string }
  parent_service_name?: string | null
}

const statusText: Record<Invoice['status'], string> = {
  paid: 'text-accent-dark',
  sent: 'text-ink',
  void: 'text-red-700',
  draft: 'text-ink-soft',
}

export default function InvoiceDetailPage() {
  useAdminGuard()
  const toast = useToast()
  const params = useParams() as { id?: string }
  const invoiceId = (params?.id as string) || ''

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(true)

  useEffect(() => {
    if (!invoiceId) return
    let abort = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await adminFetch(`/api/admin/invoices/${invoiceId}`)
        const json = await res.json()
        if (abort) return
        if (!res.ok) throw new Error(json?.error || 'Failed to load invoice')

        setInvoice(json.invoice)
        setItems(json.items || [])
      } catch (e) {
        if (!abort) setErr(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!abort) setLoading(false)
      }
    })()
    return () => { abort = true }
  }, [invoiceId])

  const handlePrint = () => {
    window.print()
  }

  const handleStatusChange = async (newStatus: Invoice['status']) => {
    if (!invoice) return
    try {
      const res = await adminFetch(`/api/admin/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setInvoice({ ...invoice, status: newStatus })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status')
    }
  }

  if (!invoiceId) return <div className="p-6 text-ink-soft">Loading route…</div>
  if (loading) return <div className="p-6 text-ink-soft">Loading invoice…</div>
  if (err) return <div className="p-6 font-medium text-red-700">{err}</div>
  if (!invoice) return <div className="p-6 text-ink-soft">Invoice not found</div>

  const booking = invoice.bookings
  const finalAmount = typeof booking.admin_total_override === 'number' ? booking.admin_total_override : booking.total

  return (
    <>
      {/* No-print toolbar */}
      <div className="sticky top-0 z-10 border-b border-line bg-surface print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-ink transition-colors duration-150 hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <span className="text-line">|</span>
            <Link
              href={`/admin/bookings/${booking.id}`}
              className="text-sm text-ink-soft transition-colors duration-150 hover:text-accent"
            >
              View booking
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={showBreakdown}
                onChange={(e) => setShowBreakdown(e.target.checked)}
                className="h-4 w-4 accent-(--color-accent)"
              />
              Show item breakdown
            </label>

            <span className="text-line">|</span>

            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value as Invoice['status'])}
              className="input w-auto py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="void">Void</option>
            </select>

            <button onClick={handlePrint} className="btn-primary">
              <Printer className="h-4 w-4" />
              Print invoice
            </button>
          </div>
        </div>
      </div>

      {/* Printable invoice */}
      <div className="min-h-screen py-8 print:bg-white print:py-0">
        <div className="mx-auto max-w-5xl rounded-(--radius-card) border border-line bg-surface p-12 print:rounded-none print:border-0 print:p-0">
          {/* Header */}
          <div className="mb-2 flex items-start justify-between pb-8">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">Eleventh Hour Cleaning</h1>
              <p className="mt-1 text-ink-soft">Premium cleaning services</p>
              <div className="mt-3 space-y-0.5 text-sm text-ink-faint">
                <p>London, UK</p>
                <p>hello@eleventhhourcleaning.co.uk</p>
                <p>Landline: 020 3355 1526</p>
                <p>WhatsApp: 07400 760630</p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-block rounded-full bg-accent-tint px-4 py-1.5 text-sm font-semibold uppercase tracking-wide ${statusText[invoice.status]}`}
              >
                {invoice.status}
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold text-ink">Invoice</h2>
              <p className="text-lg font-semibold text-accent-dark">
                {invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <div aria-hidden="true" className="tick-rule mb-12" />

          {/* Invoice details */}
          <div className="mb-12 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">Bill to</h3>
              <div className="text-ink">
                <p className="text-lg font-semibold">{booking.first_name} {booking.last_name}</p>
                <p className="mt-1 text-ink-soft">{booking.address}</p>
                <p className="text-ink-soft">{booking.city}, {booking.postcode}</p>
                <p className="mt-2 text-ink-soft">{booking.email}</p>
                <p className="text-ink-soft">{booking.phone}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">Invoice details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex gap-8">
                  <span className="w-28 text-ink-soft">Invoice date:</span>
                  <span className="font-medium text-ink">
                    {invoice.issued_date
                      ? new Date(invoice.issued_date).toLocaleDateString('en-GB')
                      : new Date(invoice.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
                {invoice.due_date && (
                  <div className="flex gap-8">
                    <span className="w-28 text-ink-soft">Due date:</span>
                    <span className="font-medium text-ink">{new Date(invoice.due_date).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
                {booking.service_date && (
                  <div className="flex gap-8">
                    <span className="w-28 text-ink-soft">Service date:</span>
                    <span className="font-medium text-ink">{new Date(booking.service_date).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items section - always show, but format depends on showBreakdown */}
          <div className="mb-12">
            {showBreakdown ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-accent">
                    <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Service</th>
                    <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-faint">Qty</th>
                    <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-faint">Unit price</th>
                    <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-faint">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const serviceName = item.services?.name || 'Service'
                    const displayName = item.parent_service_name
                      ? `${item.parent_service_name} - ${serviceName}`
                      : serviceName

                    return (
                      <tr key={item.id} className="border-b border-line">
                        <td className="px-2 py-3.5 text-ink">{displayName}</td>
                        <td className="px-2 py-3.5 text-center text-ink-soft">{item.qty}</td>
                        <td className="px-2 py-3.5 text-right text-ink-soft">£{Number(item.unit_price).toFixed(2)}</td>
                        <td className="px-2 py-3.5 text-right font-medium text-ink">
                          £{(item.qty * Number(item.unit_price)).toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div>
                <h3 className="mb-4 border-b-2 border-accent pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Services
                </h3>
                <ul className="space-y-2">
                  {items.map((item) => {
                    const serviceName = item.services?.name || 'Service'
                    const displayName = item.parent_service_name
                      ? `${item.parent_service_name} - ${serviceName}`
                      : serviceName

                    return (
                      <li key={item.id} className="flex items-center gap-3 border-b border-line py-2">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                        <span className="flex-1 text-ink">{displayName}</span>
                        <span className="text-sm text-ink-soft">Qty: {item.qty}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="mb-12 flex justify-end">
            <div className="w-full md:w-80">
              <div className="space-y-3">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotal:</span>
                  <span>£{Number(booking.subtotal).toFixed(2)}</span>
                </div>
                {booking.discount > 0 && (
                  <div className="flex justify-between text-ink-soft">
                    <span>Discount:</span>
                    <span className="font-medium text-accent">-£{Number(booking.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-accent pt-3 text-xl font-bold text-ink">
                  <span>Total:</span>
                  <span className="text-accent-dark">£{Number(finalAmount).toFixed(2)} {invoice.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8 rounded-(--radius-card) bg-paper p-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">Notes</h3>
              <p className="whitespace-pre-wrap text-ink-soft">{invoice.notes}</p>
            </div>
          )}

          {/* Payment details */}
          <div className="border-t border-line pt-8">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">Payment information</h3>
            <div className="grid gap-6 text-sm text-ink-soft md:grid-cols-2">
              <div>
                <p className="mb-1 font-medium text-ink">Stripe payment &amp; bank transfer:</p>
                <p>Account Title: Eleventh Hour Cleaning and Maintenance Services Ltd.</p>
                <p>Sort Code: XX-XX-XX</p>
                <p>Account Number: XXXXXXXX</p>
              </div>
              <div>
                <p className="mb-1 font-medium text-ink">Terms:</p>
                <p className="mt-2">Reference: {invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 border-t border-line pt-8 text-center text-sm text-ink-faint">
            <p>Thank you for choosing Eleventh Hour Cleaning</p>
            <p className="mt-1">www.eleventhhourcleaning.co.uk</p>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            margin: 1.5cm;
            size: A4;
          }
        }
      `}</style>
    </>
  )
}
