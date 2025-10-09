'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

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
    const res = await fetch(`/api/admin/bookings?${sp.toString()}`)
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
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name/email/phone/postcode" className="input max-w-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={load} className="btn-primary">Filter</button>

        <div className="ml-auto flex gap-2">
          <button
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-all duration-200 ${
              mode === 'table'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
            onClick={() => setMode('table')}
          >
            Table
          </button>
          <button
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-all duration-200 ${
              mode === 'calendar'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
            onClick={() => setMode('calendar')}
          >
            Calendar
          </button>
        </div>
      </div>

      {mode === 'table' && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Service Date</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Contact</th>
                <th className="py-2 pr-3">Location</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Payment</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={10} className="py-6 text-center text-slate-500">Loading…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={10} className="py-6 text-center text-slate-500">No bookings yet</td></tr>
              )}
              {rows.map((r) => {
                const displayTotal = typeof r.admin_total_override === 'number' ? r.admin_total_override : r.total || 0
                const paymentStatus = r.payment_status || 'pending'
                const paymentColors = {
                  pending: 'bg-yellow-100 text-yellow-800',
                  paid: 'bg-green-100 text-green-800',
                  failed: 'bg-red-100 text-red-800',
                  refunded: 'bg-gray-100 text-gray-800',
                }
                return (
                  <tr key={r.id} className="border-b hover:bg-slate-50">
                    <td className="py-2 pr-3">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-3">{r.service_date ? new Date(r.service_date).toLocaleString() : <span className="text-slate-500">—</span>}</td>
                    <td className="py-2 pr-3">{r.first_name} {r.last_name}</td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-col">
                        <span>{r.email}</span>
                        <span className="text-xs text-slate-600">{r.phone}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-3">{r.postcode} • {r.city}</td>
                    <td className="py-2 pr-3">
                      <span className="capitalize">{r.status}</span>
                      {r.source === 'admin' && (
                        <span className="ml-1 text-xs text-blue-600">(Admin)</span>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[paymentStatus as keyof typeof paymentColors]}`}>
                        {paymentStatus}
                      </span>
                    </td>
                    <td className="py-2 pr-3">£{Number(displayTotal).toFixed(2)}</td>
                    <td className="py-2 pr-3">{r.total_time_minutes || 0} mins</td>
                    <td className="py-2 pr-3">
                      <Link href={`/admin/bookings/${r.id}`} className="rounded-full border px-3 py-1 text-sm">Open</Link>
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
