'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import {
  addDays,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import enGB from 'date-fns/locale/en-GB'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useRouter } from 'next/navigation'

type APIRawEvent = {
  id: string
  title: string
  start: string // ISO string from API
  end: string   // ISO string from API
  status?: 'draft' | 'active' | 'cancelled' | 'completed'
  location?: string
}

type RBCEvent = {
  id: string
  title: string
  start: Date
  end: Date
  status?: 'draft' | 'active' | 'cancelled' | 'completed'
  location?: string
}

const locales = { 'en-GB': enGB }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
})

function rangeFor(view: View, date: Date) {
  switch (view) {
    case 'month':
      return {
        start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
      }
    case 'week':
    case 'work_week':
      return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) }
    case 'day':
      return { start: startOfDay(date), end: endOfDay(date) }
    case 'agenda':
      return { start: startOfDay(date), end: endOfDay(addWeeks(date, 1)) }
    default:
      return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) }
  }
}

function toDateSafe(v: string): Date | null {
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

export default function BookingsCalendar() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [{ start, end }, setRange] = useState<{ start: Date; end: Date }>(() => rangeFor('month', new Date()))
  const [events, setEvents] = useState<RBCEvent[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch events whenever the visible range changes
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams({
          start: start.toISOString(),
          end: addDays(end, 1).toISOString(), // include entire last day
          v: String(Date.now()), // cache-bust
        })
        const res = await fetch(`/api/admin/calendar?${qs.toString()}`, { cache: 'no-store' as RequestCache })
        const json = await res.json()

        // Convert ISO strings -> Date objects and drop invalid ones
        const parsed: RBCEvent[] = (json?.events || [])
          .map((e: APIRawEvent) => {
            const s = toDateSafe(e.start)
            const en = toDateSafe(e.end)
            if (!s || !en) return null
            return { ...e, start: s, end: en }
          })
          .filter(Boolean)

        setEvents(parsed as RBCEvent[])
      } catch (e) {
        console.error('calendar fetch failed', e)
        setEvents([])
      } finally {
        setLoading(false)
      }
    })()
  }, [start, end])

  const onNavigate = useCallback(
    (date: Date) => {
      setCurrentDate(date)
      setRange(rangeFor(currentView, date))
    },
    [currentView],
  )

  const onView = useCallback(
    (view: View) => {
      setCurrentView(view)
      setRange(rangeFor(view, currentDate))
    },
    [currentDate],
  )

  const onRangeChange = useCallback(
    (range: any) => {
      // rbc passes an array in month/week views, or an object with {start,end}
      if (Array.isArray(range) && range.length) {
        const start = startOfDay(range[0])
        const end = endOfDay(range[range.length - 1])
        setRange({ start, end })
      } else if (range?.start && range?.end) {
        setRange({ start: startOfDay(range.start), end: endOfDay(range.end) })
      } else {
        setRange(rangeFor(currentView, currentDate))
      }
    },
    [currentDate, currentView],
  )

  const eventPropGetter = useCallback((event: RBCEvent) => {
    let className = ''
    switch (event.status) {
      case 'draft':
        className = 'bg-yellow-100 border-yellow-400'
        break
      case 'active':
        className = 'bg-blue-100 border-blue-400'
        break
      case 'completed':
        className = 'bg-green-100 border-green-500'
        break
      case 'cancelled':
        className = 'bg-red-100 border-red-400 line-through'
        break
    }
    return { className }
  }, [])

  const onSelectEvent = useCallback(
    (ev: RBCEvent) => {
      router.push(`/admin/bookings/${ev.id}`)
    },
    [router],
  )

  const minTime = useMemo(() => {
    const d = new Date()
    d.setHours(7, 0, 0, 0) // earliest hour shown
    return d
  }, [])
  const maxTime = useMemo(() => {
    const d = new Date()
    d.setHours(21, 0, 0, 0) // latest hour shown
    return d
  }, [])

  return (
    <div className="rounded-2xl border p-3">
      {loading && <div className="text-xs text-slate-500 mb-2">Loading…</div>}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={currentView}
        date={currentDate}
        views={['month', 'week', 'day', 'agenda']}
        onView={onView}
        onNavigate={onNavigate}
        onRangeChange={onRangeChange}
        popup
        style={{ height: 700 }}
        min={minTime}
        max={maxTime}
        eventPropGetter={eventPropGetter}
        onSelectEvent={onSelectEvent}
      />
    </div>
  )
}
