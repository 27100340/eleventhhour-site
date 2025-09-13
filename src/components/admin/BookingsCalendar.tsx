'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { addMinutes, format, parse, startOfWeek, getDay } from 'date-fns'
import enGB from 'date-fns/locale/en-GB'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useRouter } from 'next/navigation'

type BookingRow = {
  id: string
  first_name: string
  last_name: string
  service_date: string | null
  total: number
  admin_total_override: number | null
  total_time_minutes: number | null
  status: string
}

const locales = { 'en-GB': enGB }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

export default function BookingsCalendar() {
  const router = useRouter()
  const [rows, setRows] = useState<BookingRow[]>([])
  const [range, setRange] = useState<{ start: Date; end: Date }>(() => {
    const now = new Date()
    const start = startOfWeek(now, { weekStartsOn: 1 })
    const end = addMinutes(start, 60 * 24 * 7)
    return { start, end }
  })
  const [view, setView] = useState<View>('month')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('from', range.start.toISOString())
    params.set('to', range.end.toISOString())
    const res = await fetch(`/api/admin/bookings?${params.toString()}`)
    const json = await res.json()
    setRows((json?.data || []).filter((b: BookingRow) => !!b.service_date))
    setLoading(false)
  }, [range.start, range.end])

  useEffect(() => {
    load()
  }, [load])

  const events = useMemo(() => {
    return rows.map((b) => {
      const start = new Date(b.service_date!)
      const mins = b.total_time_minutes || 120
      const end = addMinutes(start, mins)
      const titleName = `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'Booking'
      const totalDisplay = typeof b.admin_total_override === 'number' ? b.admin_total_override : b.total || 0
      return {
        id: b.id,
        title: `${titleName} • £${Number(totalDisplay).toFixed(2)}`,
        start,
        end,
        resource: b,
        allDay: false,
      }
    })
  }, [rows])

  return (
    <div className="rounded-2xl border p-3">
      {loading && <p className="text-sm text-slate-600 mb-2">Loading…</p>}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        view={view}
        onView={(v) => setView(v)}
        style={{ height: 650 }}
        popup
        onSelectEvent={(ev: any) => router.push(`/admin/bookings/${ev.id}`)}
        onRangeChange={(r: any) => {
          if (Array.isArray(r)) {
            const start = r[0]
            const end = r[r.length - 1]
            setRange({ start, end })
          } else if (r?.start && r?.end) {
            setRange({ start: r.start, end: r.end })
          }
        }}
      />
    </div>
  )
}
