'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { useAdminGuard } from '@/lib/use-admin-guard'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { QtyStepper } from '@/components/booking/QtyStepper'

type Service = { id: string; name: string; price: number; time_minutes: number }
type Item = { service_id: string; qty: number; unit_price: number; time_minutes: number; name?: string }
type Booking = {
  id: string
  status: 'draft'|'active'|'cancelled'|'completed'
  source: 'web'|'admin'
  email: string
  first_name: string
  last_name: string
  address: string
  city: string
  postcode: string
  phone: string
  frequency: 'one_time'|'weekly'|'bi_weekly'|'monthly'
  service_date: string | null
  arrival_window: 'exact'|'morning'|'afternoon'
  discount: number | null
  admin_time_override: number | null
  admin_total_override: number | null
  subtotal: number
  total: number
  total_time_minutes: number
  payment_status?: 'pending'|'paid'|'failed'|'refunded'
  notes: string | null
}

const invoiceStatusTones = {
  paid: 'success',
  sent: 'accent',
  void: 'danger',
  draft: 'neutral',
} as const

function EditorCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-(--radius-card) border border-line bg-surface p-5">
      <p className="mb-3 font-medium text-ink">{title}</p>
      {children}
    </div>
  )
}

export default function BookingEditor() {
  useAdminGuard()
  const toast = useToast()
  const router = useRouter()
  const params = useParams() as { id?: string }
  const bookingId = (params?.id as string) || ''

  const [booking, setBooking] = useState<Booking | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [invoicing, setInvoicing] = useState(false)
  const [invoices, setInvoices] = useState<Array<{ id: string; invoice_number: string | null; status: string; created_at: string }>>([])
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    if (!bookingId) return
    let abort = false
    ;(async () => {
      try {
        setLoading(true)
        const [bRes, sRes, iRes] = await Promise.all([
          adminFetch(`/api/admin/bookings/${bookingId}`).then(r => r.json()),
          fetch('/api/public/services').then(r => r.json()),
          adminFetch(`/api/admin/invoices?bookingId=${bookingId}`).then(r => r.json()),
        ])
        if (abort) return
        if (bRes?.error) throw new Error(bRes.error.message || 'Failed to load booking')

        const svc: Service[] = sRes?.data || []
        setServices(svc)

        const b: Booking = bRes.booking
        const its: Item[] = (bRes.items || []).map((it: Record<string, unknown>) => ({
          service_id: typeof it.service_id === 'string' ? it.service_id : '',
          qty: typeof it.qty === 'number' ? it.qty : 0,
          unit_price: typeof it.unit_price === 'number' ? it.unit_price : 0,
          time_minutes: typeof it.time_minutes === 'number' ? it.time_minutes : 0,
          name: typeof it.services === 'object' && it.services !== null && 'name' in it.services
            ? (it.services as { name?: string }).name
            : svc.find(s => s.id === it.service_id)?.name,
        }))
        setBooking(b)
        setItems(its)
        setInvoices(iRes?.data || [])
      } catch (e) {
        if (!abort) setErr(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!abort) setLoading(false)
      }
    })()
    return () => { abort = true }
  }, [bookingId])

  function setItemQty(service_id: string, qty: number) {
    const clamped = Math.max(0, Math.floor(qty))
    setItems(prev => {
      const current = prev.find(i => i.service_id === service_id)
      if (!current && clamped > 0) {
        const svc = services.find(s => s.id === service_id)
        if (!svc) return prev
        return [...prev, {
          service_id,
          qty: clamped,
          unit_price: Number(svc.price),
          time_minutes: svc.time_minutes,
          name: svc.name,
        }]
      }
      if (current) {
        return prev
          .map(i => (i.service_id === service_id ? { ...i, qty: clamped } : i))
          .filter(i => i.qty > 0)
      }
      return prev
    })
  }

  const computed = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.qty * i.unit_price, 0)
    const time = items.reduce((sum, i) => sum + i.qty * i.time_minutes, 0)
    const overrideTime = booking?.admin_time_override
    const total_time_minutes = typeof overrideTime === 'number' ? overrideTime : time
    const discount = Number(booking?.discount || 0)
    const total = Math.max(0, subtotal - discount)
    const finalTotal = typeof booking?.admin_total_override === 'number' ? booking.admin_total_override : total
    return { subtotal, time, total_time_minutes, total, finalTotal }
  }, [items, booking?.discount, booking?.admin_time_override, booking?.admin_total_override])

  async function onSave() {
    if (!booking) return
    setSaving(true); setErr(null)
    try {
      const payload = {
        ...booking,
        subtotal: computed.subtotal,
        total: computed.total, // keep the calculated total in DB
        total_time_minutes: computed.total_time_minutes,
        admin_total_override: booking.admin_total_override,
        items: items.map(i => ({
          service_id: i.service_id,
          qty: i.qty,
          unit_price: i.unit_price,
          time_minutes: i.time_minutes,
        })),
      }
      const res = await adminFetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json: { error?: { message?: string } } = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || 'Save failed')
      toast.success('Booking saved')
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function onCreateInvoice() {
    if (!bookingId) return
    try {
      setInvoicing(true)
      const res = await adminFetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create invoice')

      // Refresh invoices list
      const iRes = await adminFetch(`/api/admin/invoices?bookingId=${bookingId}`)
      const iData = await iRes.json()
      setInvoices(iData?.data || [])

      // Navigate to the new invoice
      router.push(`/admin/invoices/${data.id}`)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create invoice')
    } finally {
      setInvoicing(false)
    }
  }

  async function onProcessStripePayment() {
    if (!booking) return
    if (!booking.email) {
      toast.error('Please add a customer email before processing payment')
      return
    }

    try {
      setProcessingPayment(true)

      // The endpoint loads the booking and its items from the DB itself
      const payload = {
        bookingId: booking.id,
        customerEmail: booking.email,
        customerName: `${booking.first_name || ''} ${booking.last_name || ''}`.trim(),
        adminTotalOverride: booking.admin_total_override ?? undefined,
      }

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create payment session')

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No payment URL received')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to process payment')
      setProcessingPayment(false)
    }
  }

  async function onDelete() {
    if (!booking) return
    if (!confirm('Delete this booking? This cannot be undone.')) return
    setSaving(true); setErr(null)
    try {
      const res = await adminFetch(`/api/admin/bookings/${booking.id}`, { method: 'DELETE' })
      const json: { error?: { message?: string } } = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || 'Delete failed')
      router.replace('/admin/dashboard')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  if (!bookingId) return <div className="p-6 text-ink-soft">Loading route…</div>
  if (loading) return <div className="p-6 text-ink-soft">Loading…</div>
  if (err && !booking) return <div className="p-6 font-medium text-red-700">{err}</div>
  if (!booking) return <div className="p-6 text-ink-soft">Not found</div>

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            className="flex items-center gap-1.5 rounded-(--radius-ctl) border border-line px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:bg-ink/5"
            href="/admin/dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl">Edit booking</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={onDelete} className="btn-secondary text-red-700 border-red-700/60 hover:bg-red-700 hover:text-white">
            Delete
          </button>
          <button onClick={onSave} className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {err && <p className="mt-3 text-sm font-medium text-red-700">{err}</p>}

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {/* Left */}
        <div className="space-y-4 md:col-span-2">
          <EditorCard title="Customer">
            <div className="grid gap-3 md:grid-cols-2">
              <input className="input" value={booking.first_name || ''} onChange={e=>setBooking({...booking, first_name: e.target.value})} placeholder="First name" />
              <input className="input" value={booking.last_name || ''} onChange={e=>setBooking({...booking, last_name: e.target.value})} placeholder="Last name" />
              <input className="input" value={booking.email || ''} onChange={e=>setBooking({...booking, email: e.target.value})} placeholder="Email" />
              <input className="input" value={booking.phone || ''} onChange={e=>setBooking({...booking, phone: e.target.value})} placeholder="Phone" />
            </div>
          </EditorCard>

          <EditorCard title="Address">
            <div className="grid gap-3 md:grid-cols-3">
              <input className="input" value={booking.address || ''} onChange={e=>setBooking({...booking, address: e.target.value})} placeholder="Address" />
              <input className="input" value={booking.city || ''} onChange={e=>setBooking({...booking, city: e.target.value})} placeholder="City" />
              <input className="input" value={booking.postcode || ''} onChange={e=>setBooking({...booking, postcode: e.target.value})} placeholder="Postcode" />
            </div>
          </EditorCard>

          <EditorCard title="When">
            <div className="grid gap-3 md:grid-cols-3">
              <select className="input" value={booking.frequency} onChange={e=>setBooking({...booking, frequency: e.target.value as Booking['frequency']})}>
                <option value="one_time">one time</option>
                <option value="weekly">weekly</option>
                <option value="bi_weekly">bi weekly</option>
                <option value="monthly">monthly</option>
              </select>
              <select className="input" value={booking.arrival_window} onChange={e=>setBooking({...booking, arrival_window: e.target.value as Booking['arrival_window']})}>
                <option value="exact">exact</option>
                <option value="morning">morning</option>
                <option value="afternoon">afternoon</option>
              </select>
              <input className="input" type="datetime-local"
                value={booking.service_date ? new Date(booking.service_date).toISOString().slice(0,16) : ''}
                onChange={e=>setBooking({...booking, service_date: e.target.value ? new Date(e.target.value).toISOString() : null})}
              />
            </div>
          </EditorCard>

          <EditorCard title="Status & payment">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">Booking status</label>
                <select className="input" value={booking.status} onChange={e=>setBooking({...booking, status: e.target.value as Booking['status']})}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">Payment status</label>
                <select
                  className="input"
                  value={booking.payment_status || 'pending'}
                  onChange={e=>setBooking({...booking, payment_status: e.target.value as Booking['payment_status']})}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">Source</label>
                <div className="rounded-(--radius-ctl) bg-paper px-3.5 py-2.5 text-sm font-medium capitalize text-ink">
                  {booking.source || 'web'}
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">Discount (£)</label>
                <input className="input" type="number" step="0.01" placeholder="0.00"
                  value={booking.discount ?? 0}
                  onChange={e=>setBooking({...booking, discount: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">Time override (mins)</label>
                <input className="input" type="number" placeholder="Auto-calculated"
                  value={booking.admin_time_override ?? ''}
                  onChange={e=>setBooking({...booking, admin_time_override: e.target.value === '' ? null : Number(e.target.value)})}
                />
              </div>
            </div>

            {/* Quick payment confirmation buttons for draft bookings */}
            {booking.status === 'draft' && booking.payment_status === 'pending' && (
              <div className="mt-4 rounded-(--radius-ctl) bg-accent-tint p-3.5">
                <p className="mb-2 text-sm font-medium text-accent-dark">Quick actions for draft booking</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setBooking({...booking, payment_status: 'paid', status: 'active'})}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Mark as paid &amp; activate
                  </button>
                  <button
                    onClick={() => setBooking({...booking, status: 'active'})}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    Activate (keep payment pending)
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Notes</label>
              <textarea className="input" rows={4} placeholder="Add notes about this booking..."
                value={booking.notes ?? ''} onChange={e=>setBooking({...booking, notes: e.target.value})}/>
            </div>
          </EditorCard>
        </div>

        {/* Right */}
        <aside className="space-y-4">
          <EditorCard title="Services">
            <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
              {services.map(s => {
                const existing = items.find(i => i.service_id === s.id)?.qty || 0
                return (
                  <div key={s.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                      <p className="text-xs text-ink-soft">£{Number(s.price).toFixed(2)} · {s.time_minutes} mins</p>
                    </div>
                    <QtyStepper qty={existing} onChange={(qty) => setItemQty(s.id, qty)} compact />
                  </div>
                )
              })}
            </div>
          </EditorCard>

          <EditorCard title="Totals">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Subtotal</span>
                <span className="text-ink">£{(computed.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Time (calc)</span>
                <span className="text-ink">{computed.time} mins</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Time (final)</span>
                <span className="text-ink">{computed.total_time_minutes} mins</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-ink-soft">Final price override</span>
                <input
                  className="input w-28 text-right"
                  type="number" step="0.01" placeholder="£"
                  value={booking.admin_total_override ?? ''}
                  onChange={e => setBooking({
                    ...booking!,
                    admin_total_override: e.target.value === '' ? null : Number(e.target.value)
                  })}
                />
              </div>

              <div className="flex items-center justify-between border-t border-line pt-2 font-semibold">
                <span className="text-ink">Total (display)</span>
                <span className="font-display text-lg text-accent-dark">£{computed.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </EditorCard>

          {/* Invoices section */}
          {invoices.length > 0 && (
            <EditorCard title="Invoices">
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/admin/invoices/${inv.id}`}
                    className="flex items-center justify-between rounded-(--radius-ctl) bg-paper p-3 transition-colors duration-150 hover:bg-accent-tint"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{inv.invoice_number || inv.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-ink-faint">{new Date(inv.created_at).toLocaleDateString('en-GB')}</p>
                    </div>
                    <Badge tone={invoiceStatusTones[inv.status as keyof typeof invoiceStatusTones] ?? 'neutral'} className="uppercase">
                      {inv.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            </EditorCard>
          )}
        </aside>
      </div>

      {/* Actions footer */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSave}
            disabled={saving || loading || !booking}
            className="btn-primary"
          >
            {saving ? 'Saving…' : 'Save booking'}
          </button>
          <button
            onClick={onCreateInvoice}
            disabled={invoicing || loading}
            className="btn-secondary"
          >
            {invoicing ? 'Creating invoice…' : 'Create invoice'}
          </button>
          {booking?.payment_status === 'pending' && (
            <button
              onClick={onProcessStripePayment}
              disabled={processingPayment || loading}
              className="btn-primary"
            >
              {processingPayment ? 'Processing…' : 'Process Stripe payment'}
            </button>
          )}
        </div>
        <Link href="/admin/bookings" className="text-sm font-medium text-accent hover:text-accent-dark">Back to list</Link>
      </div>
    </div>
  )
}
