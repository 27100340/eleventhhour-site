'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Row = {
  id: string
  status: 'draft' | 'active' | 'cancelled' | 'completed'
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  city: string | null
  postcode: string | null
  frequency: 'one_time' | 'weekly' | 'bi_weekly' | 'monthly'
  service_date: string | null
  total: number | null
  total_time_minutes: number | null
  created_at: string
}

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    ;(async () => {
      const qs = new URLSearchParams()
      if (q) qs.set('q', q)
      if (status) qs.set('status', status)
      const res = await fetch(`/api/admin/bookings?${qs.toString()}`, { cache: 'no-store' as RequestCache })
      const json = await res.json()
      setRows(json?.data || [])
    })()
  }, [q, status])

  const visible = useMemo(() => rows, [rows])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Bookings</h1>

      <div className="flex gap-3 items-center">
        <input className="input" placeholder="Search name, email, phone, city…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>Customer</th>
              <th>Contact</th>
              <th>When</th>
              <th>Duration</th>
              <th>Frequency</th>
              <th>Status</th>
              <th className="text-right">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const name = [r.first_name, r.last_name].filter(Boolean).join(' ').trim() || '—'
              const when = r.service_date ? new Date(r.service_date) : null
              const whenStr = when ? when.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
              const freq = r.frequency.replace('_', ' ')
              const mins = Number(r.total_time_minutes || 0)
              return (
                <tr key={r.id} className="[&>td]:px-3 [&>td]:py-2 border-t">
                  <td>{name}</td>
                  <td className="text-slate-600">
                    <div>{r.email || '—'}</div>
                    <div>{r.phone || '—'}</div>
                  </td>
                  <td>
                    <div>{whenStr}</div>
                    <div className="text-slate-500 text-xs">{[r.postcode, r.city].filter(Boolean).join(', ')}</div>
                  </td>
                  <td>{mins > 0 ? `${mins} mins` : '—'}</td>
                  <td className="capitalize">{freq}</td>
                  <td className="capitalize">{r.status}</td>
                  <td className="text-right">£{Number(r.total || 0).toFixed(2)}</td>
                  <td className="text-right">
                    <Link className="text-blue-600 hover:underline" href={`/admin/bookings/${r.id}`}>Edit</Link>
                  </td>
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr><td colSpan={8} className="text-center text-slate-500 py-10">No bookings</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
