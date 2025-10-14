'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

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

export default function BookingEditor() {
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

  useEffect(() => {
    if (!bookingId) return
    let abort = false
    ;(async () => {
      try {
        setLoading(true)
        const [bRes, sRes, iRes] = await Promise.all([
          fetch(`/api/admin/bookings/${bookingId}`).then(r => r.json()),
          fetch('/api/public/services').then(r => r.json()),
          fetch(`/api/admin/invoices?bookingId=${bookingId}`).then(r => r.json()),
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

  function upsertItem(service_id: string, delta: number) {
    setItems(prev => {
      const idx = prev.findIndex(i => i.service_id === service_id)
      if (idx === -1) {
        const svc = services.find(s => s.id === service_id)
        if (!svc) return prev
        const qty = Math.max(0, delta)
        if (qty === 0) return prev
        return [...prev, {
          service_id,
          qty,
          unit_price: Number(svc.price),
          time_minutes: svc.time_minutes,
          name: svc.name,
        }]
      } else {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: Math.max(0, next[idx].qty + delta) }
        if (next[idx].qty === 0) next.splice(idx, 1)
        return next
      }
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
        admin_total_override: booking.admin_total_override, // << NEW
        items: items.map(i => ({
          service_id: i.service_id,
          qty: i.qty,
          unit_price: i.unit_price,
          time_minutes: i.time_minutes,
        })),
      }
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json: { error?: { message?: string } } = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || 'Save failed')
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
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create invoice')

      // Refresh invoices list
      const iRes = await fetch(`/api/admin/invoices?bookingId=${bookingId}`)
      const iData = await iRes.json()
      setInvoices(iData?.data || [])

      // Navigate to the new invoice
      router.push(`/admin/invoices/${data.id}`)
    } catch (e: any) {
      alert(e?.message || 'Failed to create invoice')
    } finally {
      setInvoicing(false)
    }
  }

  async function onDelete() {
    if (!booking) return
    if (!confirm('Delete this booking? This cannot be undone.')) return
    setSaving(true); setErr(null)
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, { method: 'DELETE' })
      const json: { error?: { message?: string } } = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || 'Delete failed')
      router.replace('/admin/dashboard')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  if (!bookingId) return <div className="p-6">Loading route…</div>
  if (loading) return <div className="p-6">Loading…</div>
  if (err) return <div className="p-6 text-red-600">{err}</div>
  if (!booking) return <div className="p-6">Not found</div>

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link className="rounded-full border px-3 py-1" href="/admin/dashboard">← Back</Link>
          <h1 className="text-2xl font-semibold">Edit Booking</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={onDelete} className="rounded-full border px-4 py-2">Delete</button>
          <button onClick={onSave} className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {/* Left */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl border p-4">
            <p className="font-medium mb-3">Customer</p>
            <div className="grid md:grid-cols-2 gap-3">
              <input className="input" value={booking.first_name || ''} onChange={e=>setBooking({...booking, first_name: e.target.value})} placeholder="First name" />
              <input className="input" value={booking.last_name || ''} onChange={e=>setBooking({...booking, last_name: e.target.value})} placeholder="Last name" />
              <input className="input" value={booking.email || ''} onChange={e=>setBooking({...booking, email: e.target.value})} placeholder="Email" />
              <input className="input" value={booking.phone || ''} onChange={e=>setBooking({...booking, phone: e.target.value})} placeholder="Phone" />
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <p className="font-medium mb-3">Address</p>
            <div className="grid md:grid-cols-3 gap-3">
              <input className="input" value={booking.address || ''} onChange={e=>setBooking({...booking, address: e.target.value})} placeholder="Address" />
              <input className="input" value={booking.city || ''} onChange={e=>setBooking({...booking, city: e.target.value})} placeholder="City" />
              <input className="input" value={booking.postcode || ''} onChange={e=>setBooking({...booking, postcode: e.target.value})} placeholder="Postcode" />
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <p className="font-medium mb-3">When</p>
            <div className="grid md:grid-cols-3 gap-3">
              <select className="input" value={booking.frequency} onChange={e=>setBooking({...booking, frequency: e.target.value as Booking['frequency']})}>
                <option value="one_time">one_time</option>
                <option value="weekly">weekly</option>
                <option value="bi_weekly">bi_weekly</option>
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
          </div>

          <div className="rounded-2xl border p-4">
            <p className="font-medium mb-3">Status & Payment</p>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Booking Status</label>
                <select className="input" value={booking.status} onChange={e=>setBooking({...booking, status: e.target.value as Booking['status']})}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Payment Status</label>
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
                <label className="text-xs text-gray-600 mb-1 block">Source</label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium capitalize">
                  {booking.source || 'web'}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Discount (£)</label>
                <input className="input" type="number" step="0.01" placeholder="0.00"
                  value={booking.discount ?? 0}
                  onChange={e=>setBooking({...booking, discount: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Time Override (mins)</label>
                <input className="input" type="number" placeholder="Auto-calculated"
                  value={booking.admin_time_override ?? ''}
                  onChange={e=>setBooking({...booking, admin_time_override: e.target.value === '' ? null : Number(e.target.value)})}
                />
              </div>
            </div>

            {/* Quick payment confirmation buttons for draft bookings */}
            {booking.status === 'draft' && booking.payment_status === 'pending' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Quick Actions for Draft Booking</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBooking({...booking, payment_status: 'paid', status: 'active'})}
                    className="rounded-full bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700"
                  >
                    Mark as Paid & Activate
                  </button>
                  <button
                    onClick={() => setBooking({...booking, status: 'active'})}
                    className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Activate (Keep Payment Pending)
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3">
              <label className="text-xs text-gray-600 mb-1 block">Notes</label>
              <textarea className="input" rows={4} placeholder="Add notes about this booking..."
                value={booking.notes ?? ''} onChange={e=>setBooking({...booking, notes: e.target.value})}/>
            </div>
          </div>
        </div>

        {/* Right */}
        <aside className="space-y-4">
          <div className="rounded-2xl border p-4">
            <p className="font-medium mb-3">Services</p>
            <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
              {services.map(s => {
                const existing = items.find(i => i.service_id === s.id)?.qty || 0
                return (
                  <div key={s.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.name}</p>
                      <p className="text-xs text-slate-600">£{Number(s.price).toFixed(2)} · {s.time_minutes} mins</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-full border w-7 h-7" onClick={()=>upsertItem(s.id, -1)}>-</button>
                      <input className="input w-14 text-center" type="number" min={0} value={existing}
                        onChange={e=>{
                          const qty = Math.max(0, Math.floor(Number(e.target.value) || 0))
                          const current = items.find(i => i.service_id === s.id)
                          if (!current && qty > 0) {
                            setItems(prev => [...prev, { service_id: s.id, qty, unit_price: Number(s.price), time_minutes: s.time_minutes, name: s.name }])
                          } else if (current) {
                            setItems(prev => prev.map(i => i.service_id === s.id ? { ...i, qty } : i).filter(i => i.qty > 0))
                          }
                        }}
                      />
                      <button className="rounded-full border w-7 h-7" onClick={()=>upsertItem(s.id, +1)}>+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <p className="font-medium">Totals</p>
            <div className="mt-2 text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>£{(computed.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Time (calc)</span>
                <span>{computed.time} mins</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Time (final)</span>
                <span>{computed.total_time_minutes} mins</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Final price override</span>
                <input
                  className="input w-32 text-right"
                  type="number" step="0.01" placeholder="£"
                  value={booking.admin_total_override ?? ''}
                  onChange={e => setBooking({
                    ...booking!,
                    admin_total_override: e.target.value === '' ? null : Number(e.target.value)
                  })}
                />
              </div>

              <div className="flex items-center justify-between font-semibold">
                <span>Total (display)</span>
                <span>£{computed.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Invoices section */}
          {invoices.length > 0 && (
            <div className="rounded-2xl border p-4">
              <p className="font-medium mb-3">Invoices</p>
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/admin/invoices/${inv.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-brand-sage/20 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium text-brand-charcoal">{inv.invoice_number || inv.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{new Date(inv.created_at).toLocaleDateString('en-GB')}</p>
                    </div>
                    <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                      inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      inv.status === 'void' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {inv.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
      {/* Actions footer */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={saving || loading || !booking}
            className="rounded-full bg-brand-amber text-white px-5 py-2 text-sm font-semibold hover:bg-brand-amber-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Booking'}
          </button>
          <button
            onClick={onCreateInvoice}
            disabled={invoicing || loading}
            className="rounded-full border px-5 py-2 text-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {invoicing ? 'Creating Invoice…' : 'Create Invoice'}
          </button>
        </div>
        <Link href="/admin/bookings" className="text-sm text-slate-600 hover:underline">Back to list</Link>
      </div>
    </div>
  )
}
