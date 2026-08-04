'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminFetch } from '@/lib/admin-fetch'
import { useAdminGuard } from '@/lib/use-admin-guard'

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
  useAdminGuard()
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    ;(async () => {
      const qs = new URLSearchParams()
      if (q) qs.set('q', q)
      if (status) qs.set('status', status)
      const res = await adminFetch(`/api/admin/bookings?${qs.toString()}`, { cache: 'no-store' as RequestCache })
      const json = await res.json()
      setRows(json?.data || [])
    })()
  }, [q, status])

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
      <h1 className="text-2xl">Bookings</h1>

      <div className="flex items-center gap-3">
        <input
          className="input max-w-sm"
          placeholder="Search name, email, phone, city…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-(--radius-card) border border-line bg-surface">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line bg-paper">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-faint [&>th]:px-4 [&>th]:py-3">
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
            {rows.map((r) => {
              const name = [r.first_name, r.last_name].filter(Boolean).join(' ').trim() || '—'
              const when = r.service_date ? new Date(r.service_date) : null
              const whenStr = when ? when.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
              const freq = r.frequency.replace('_', ' ')
              const mins = Number(r.total_time_minutes || 0)
              return (
                <tr
                  key={r.id}
                  className="border-t border-line transition-colors duration-150 hover:bg-paper [&>td]:px-4 [&>td]:py-2.5"
                >
                  <td className="font-medium text-ink">{name}</td>
                  <td className="text-ink-soft">
                    <div>{r.email || '—'}</div>
                    <div>{r.phone || '—'}</div>
                  </td>
                  <td>
                    <div>{whenStr}</div>
                    <div className="text-xs text-ink-faint">{[r.postcode, r.city].filter(Boolean).join(', ')}</div>
                  </td>
                  <td>{mins > 0 ? `${mins} mins` : '—'}</td>
                  <td className="capitalize">{freq}</td>
                  <td className="capitalize">{r.status}</td>
                  <td className="text-right font-medium text-ink">£{Number(r.total || 0).toFixed(2)}</td>
                  <td className="text-right">
                    <Link className="font-medium text-accent hover:text-accent-dark" href={`/admin/bookings/${r.id}`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-ink-faint">No bookings</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
