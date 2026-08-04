'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { adminFetch } from '@/lib/admin-fetch'
import { Badge } from '@/components/ui/Badge'

type Row = {
  id: string
  created_at: string
  service_date: string | null
  status: string
  source: string
  payment_status: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  postcode: string
  city: string
  total: number
  admin_total_override: number | null
  total_time_minutes: number
}

const BookingsCalendar = dynamic(() => import('./BookingsCalendar'), { ssr: false })

const paymentTones = {
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'neutral',
} as const

export default function BookingsTab() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'table' | 'calendar'>('table')

  async function load() {
    setLoading(true)
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (status) sp.set('status', status)
    const res = await adminFetch(`/api/admin/bookings?${sp.toString()}`)
    const json = await res.json()
    setRows(json.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name/email/phone/postcode"
          className="input max-w-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={load} className="btn-primary">Filter</button>

        <div className="ml-auto inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5">
          {(['table', 'calendar'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors duration-150 ${
                mode === m ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === 'table' && (
        <div className="mt-4 overflow-x-auto rounded-(--radius-card) border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-paper text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Service date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={10} className="px-4 py-6 text-center text-ink-faint">Loading…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-6 text-center text-ink-faint">No bookings yet</td></tr>
              )}
              {rows.map((r) => {
                const displayTotal = typeof r.admin_total_override === 'number' ? r.admin_total_override : r.total || 0
                const paymentStatus = (r.payment_status || 'pending') as keyof typeof paymentTones
                return (
                  <tr key={r.id} className="border-b border-line transition-colors duration-150 last:border-b-0 hover:bg-paper">
                    <td className="px-4 py-2.5 text-ink-soft">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      {r.service_date ? new Date(r.service_date).toLocaleString() : <span className="text-ink-faint">—</span>}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-ink">{r.first_name} {r.last_name}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span>{r.email}</span>
                        <span className="text-xs text-ink-faint">{r.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">{r.postcode} · {r.city}</td>
                    <td className="px-4 py-2.5">
                      <span className="capitalize">{r.status}</span>
                      {r.source === 'admin' && (
                        <span className="ml-1 text-xs text-accent">(admin)</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={paymentTones[paymentStatus] ?? 'neutral'}>{paymentStatus}</Badge>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-ink">£{Number(displayTotal).toFixed(2)}</td>
                    <td className="px-4 py-2.5">{r.total_time_minutes || 0} mins</td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/bookings/${r.id}`}
                        className="rounded-(--radius-ctl) border border-line px-3 py-1 text-sm font-medium transition-colors duration-150 hover:bg-ink/5"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'calendar' && (
        <div className="mt-4">
          <BookingsCalendar />
        </div>
      )}
    </div>
  )
}
