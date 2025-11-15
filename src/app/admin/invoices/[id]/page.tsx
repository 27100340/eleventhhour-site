'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Printer, Download, ArrowLeft, Mail } from 'lucide-react'

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
  services: { name: string }
}

export default function InvoiceDetailPage() {
  const router = useRouter()
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
        const res = await fetch(`/api/admin/invoices/${invoiceId}`)
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
      const res = await fetch(`/api/admin/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setInvoice({ ...invoice, status: newStatus })
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update status')
    }
  }

  if (!invoiceId) return <div className="p-6">Loading route…</div>
  if (loading) return <div className="p-6">Loading invoice…</div>
  if (err) return <div className="p-6 text-red-600">{err}</div>
  if (!invoice) return <div className="p-6">Invoice not found</div>

  const booking = invoice.bookings
  const finalAmount = typeof booking.admin_total_override === 'number' ? booking.admin_total_override : booking.total

  return (
    <>
      {/* No-print toolbar */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-brand-charcoal hover:text-brand-amber transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <span className="text-gray-400">|</span>
            <Link href={`/admin/bookings/${booking.id}`} className="text-sm text-gray-600 hover:text-brand-amber transition-colors">
              View Booking
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showBreakdown}
                onChange={(e) => setShowBreakdown(e.target.checked)}
                className="w-4 h-4 text-brand-amber focus:ring-brand-amber rounded"
              />
              Show Item Breakdown
            </label>

            <span className="text-gray-300">|</span>

            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value as Invoice['status'])}
              className="input text-sm py-2"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="void">Void</option>
            </select>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-brand-amber text-white rounded-xl font-medium hover:bg-brand-amber-dark transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Printable invoice */}
      <div className="min-h-screen bg-gray-50 print:bg-white py-8 print:py-0">
        <div className="mx-auto max-w-5xl bg-white shadow-soft-lg print:shadow-none rounded-2xl print:rounded-none p-12 print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-12 pb-8 border-b-2 border-brand-amber print:border-b">
            <div>
              <h1 className="text-4xl font-bold text-brand-charcoal font-playfair mb-2">
                Eleventh Hour Cleaning
              </h1>
              <p className="text-gray-600">Premium Cleaning Services</p>
              <p className="text-sm text-gray-500 mt-2">London, UK</p>
              <p className="text-sm text-gray-500">hello@eleventhhourcleaning.co.uk</p>
              <p className="text-sm text-gray-500">Landline: 020 3355 1526</p>
              <p className="text-sm text-gray-500">WhatsApp: 07400 760630</p>
            </div>

            <div className="text-right">
              <div className="inline-block px-4 py-2 bg-brand-sage/30 rounded-xl mb-3">
                <span className={`text-sm font-semibold uppercase tracking-wide ${
                  invoice.status === 'paid' ? 'text-green-700' :
                  invoice.status === 'sent' ? 'text-blue-700' :
                  invoice.status === 'void' ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-brand-charcoal font-lora mb-1">INVOICE</h2>
              <p className="text-lg font-semibold text-brand-amber">{invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Invoice details */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Bill To</h3>
              <div className="text-brand-charcoal">
                <p className="font-semibold text-lg">{booking.first_name} {booking.last_name}</p>
                <p className="text-gray-600 mt-1">{booking.address}</p>
                <p className="text-gray-600">{booking.city}, {booking.postcode}</p>
                <p className="text-gray-600 mt-2">{booking.email}</p>
                <p className="text-gray-600">{booking.phone}</p>
              </div>
            </div>

            <div className="text-right md:text-left">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Invoice Details</h3>
              <div className="space-y-1 text-brand-charcoal">
                <div className="flex justify-between md:justify-start md:gap-8">
                  <span className="text-gray-600">Invoice Date:</span>
                  <span className="font-medium">{invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString('en-GB') : new Date(invoice.created_at).toLocaleDateString('en-GB')}</span>
                </div>
                {invoice.due_date && (
                  <div className="flex justify-between md:justify-start md:gap-8">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">{new Date(invoice.due_date).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
                {booking.service_date && (
                  <div className="flex justify-between md:justify-start md:gap-8">
                    <span className="text-gray-600">Service Date:</span>
                    <span className="font-medium">{new Date(booking.service_date).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items table - conditional based on showBreakdown */}
          {showBreakdown && (
            <div className="mb-12">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-brand-amber">
                    <th className="text-left py-4 px-2 text-sm font-semibold text-gray-600 uppercase tracking-wide">Service</th>
                    <th className="text-center py-4 px-2 text-sm font-semibold text-gray-600 uppercase tracking-wide">Qty</th>
                    <th className="text-right py-4 px-2 text-sm font-semibold text-gray-600 uppercase tracking-wide">Unit Price</th>
                    <th className="text-right py-4 px-2 text-sm font-semibold text-gray-600 uppercase tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-4 px-2 text-brand-charcoal">
                        {item.services?.name || 'Service'}
                      </td>
                      <td className="text-center py-4 px-2 text-gray-700">{item.qty}</td>
                      <td className="text-right py-4 px-2 text-gray-700">£{Number(item.unit_price).toFixed(2)}</td>
                      <td className="text-right py-4 px-2 font-medium text-brand-charcoal">£{(item.qty * Number(item.unit_price)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-full md:w-80">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>£{Number(booking.subtotal).toFixed(2)}</span>
                </div>
                {booking.discount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Discount:</span>
                    <span className="text-green-600">-£{Number(booking.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t-2 border-brand-amber pt-3 flex justify-between text-xl font-bold text-brand-charcoal">
                  <span>Total:</span>
                  <span className="text-brand-amber">£{Number(finalAmount).toFixed(2)} {invoice.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8 p-6 bg-brand-cream rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Payment details */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Payment Information</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <p className="font-medium text-brand-charcoal mb-1">Stripe Payment & Bank Transfer:</p>
                <p>Account Title: Eleventh Hour Cleaning and Maintenance Services Ltd.</p>
                <p>Sort Code: XX-XX-XX</p>
                <p>Account Number: XXXXXXXX</p>
              </div>
              <div>
                <p className="font-medium text-brand-charcoal mb-1">Terms:</p>
                <p className="mt-2">Reference: {invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Thank you for choosing Eleventh Hour Cleaning</p>
            <p className="mt-1">www.eleventhhourkleaning.co.uk</p>
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
