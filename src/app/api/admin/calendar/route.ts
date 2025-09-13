// src/app/api/admin/calendar/route.ts
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RBCEvent = {
  id: string           // base booking id (click opens the series editor)
  title: string
  start: string        // ISO
  end: string          // ISO
  status?: 'draft' | 'active' | 'cancelled' | 'completed'
  location?: string
}

function addDaysUTC(d: Date, days: number) {
  const x = new Date(d.getTime())
  x.setUTCDate(x.getUTCDate() + days)
  return x
}
function addMonthsUTC(d: Date, months: number) {
  const x = new Date(d.getTime())
  x.setUTCMonth(x.getUTCMonth() + months)
  return x
}

function firstWeeklyOnOrAfter(base: Date, targetStart: Date, stepDays: number) {
  const msStep = stepDays * 24 * 60 * 60 * 1000
  const diff = targetStart.getTime() - base.getTime()
  const k = Math.max(0, Math.floor(diff / msStep))
  return new Date(base.getTime() + k * msStep)
}

export async function GET(req: Request) {
  try {
    const supabase = createServerSupabase(true)
    const url = new URL(req.url)
    const startISO = url.searchParams.get('start')
    const endISO = url.searchParams.get('end')
    if (!startISO || !endISO) {
      return Response.json({ error: { message: 'Provide start & end ISO query params' } }, { status: 400 })
    }
    const rangeStart = new Date(startISO)
    const rangeEnd = new Date(endISO)

    const events: RBCEvent[] = []

    // 1) One-time bookings in range (base rows only)
    {
      const one = await supabase
        .from('bookings')
        .select('id, status, first_name, last_name, city, postcode, total, service_date, total_time_minutes')
        .is('recurrence_id', null)
        .eq('frequency', 'one_time')
        .neq('status', 'cancelled')
        .gte('service_date', startISO)
        .lt('service_date', endISO)
      if (!one.error && one.data) {
        for (const b of one.data) {
          if (!b.service_date) continue
          const start = new Date(b.service_date)
          const mins = Math.max(Number(b.total_time_minutes || 60), 30)
          const end = new Date(start.getTime() + mins * 60_000)
          const name = [b.first_name, b.last_name].filter(Boolean).join(' ').trim()
          events.push({
            id: b.id,
            title: `${name || 'Booking'} · £${Number(b.total || 0).toFixed(2)}`,
            start: start.toISOString(),
            end: end.toISOString(),
            status: b.status,
            location: [b.postcode, b.city].filter(Boolean).join(', '),
          })
        }
      }
    }

    // 2) Active recurring series → generate occurrences inside [start, end) FOREVER
    //    (ignore any stored child rows to avoid duplicates)
    const rulesRes = await supabase
      .from('recurring_rules')
      .select('id, frequency, start_at, active, base_booking_id')
      .eq('active', true)

    if (rulesRes.error) {
      return Response.json({ error: rulesRes.error }, { status: 400 })
    }

    const baseIds = (rulesRes.data || []).map((r: any) => r.base_booking_id)
    if (baseIds.length) {
      // load base booking rows (status, names, totals, duration)
      const baseRes = await supabase
        .from('bookings')
        .select('id, status, first_name, last_name, city, postcode, total, total_time_minutes')
        .in('id', baseIds)
        .neq('status', 'cancelled')
      const baseById = new Map<string, any>((baseRes.data || []).map((b: any) => [b.id, b]))

      // backfill minutes from items for any base with 0 minutes
      const missing = (baseRes.data || [])
        .filter((b: any) => !b.total_time_minutes || b.total_time_minutes === 0)
        .map((b: any) => b.id)

      const minutesMap = new Map<string, number>()
      if (missing.length) {
        const items = await supabase
          .from('booking_items')
          .select('booking_id, qty, time_minutes')
          .in('booking_id', missing)
        if (!items.error && items.data) {
          for (const it of items.data) {
            const add = Number(it.qty || 0) * Number(it.time_minutes || 0)
            minutesMap.set(it.booking_id as string, (minutesMap.get(it.booking_id as string) || 0) + add)
          }
        }
      }

      for (const rule of rulesRes.data || []) {
        const base = baseById.get(rule.base_booking_id)
        if (!base) continue

        // Series metadata
        const seriesStart = new Date(rule.start_at)
        if (rangeEnd <= seriesStart) {
          // Range ends before series starts → nothing to emit
          continue
        }

        const mins =
          Math.max(Number(base.total_time_minutes || minutesMap.get(base.id) || 60), 30) // default 60
        const name = [base.first_name, base.last_name].filter(Boolean).join(' ').trim()
        const title = `${name || 'Booking'} · £${Number(base.total || 0).toFixed(2)}`
        const loc = [base.postcode, base.city].filter(Boolean).join(', ')

        if (rule.frequency === 'weekly' || rule.frequency === 'bi_weekly') {
          const stepDays = rule.frequency === 'weekly' ? 7 : 14
          let t = firstWeeklyOnOrAfter(seriesStart, rangeStart, stepDays)
          // ensure we don't start before the base series start
          if (t < seriesStart) t = seriesStart

          while (t < rangeEnd) {
            if (t >= rangeStart) {
              const end = new Date(t.getTime() + mins * 60_000)
              events.push({
                id: base.id, // clicking opens the series (base booking)
                title,
                start: t.toISOString(),
                end: end.toISOString(),
                status: base.status,
                location: loc,
              })
            }
            t = addDaysUTC(t, stepDays)
          }
        } else if (rule.frequency === 'monthly') {
          // advance month by month until inside range, then emit until out of range
          let t = new Date(seriesStart.getTime())
          // fast-forward up to start (at most a few dozen loops even for far ranges)
          while (t < rangeStart) t = addMonthsUTC(t, 1)
          // ensure not before seriesStart
          if (t < seriesStart) t = new Date(seriesStart.getTime())

          while (t < rangeEnd) {
            const end = new Date(t.getTime() + mins * 60_000)
            events.push({
              id: base.id,
              title,
              start: t.toISOString(),
              end: end.toISOString(),
              status: base.status,
              location: loc,
            })
            t = addMonthsUTC(t, 1)
          }
        }
      }
    }

    // Sort by start just in case
    events.sort((a, b) => a.start.localeCompare(b.start))

    return Response.json({ events }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return Response.json({ error: { message: e?.message || 'Unexpected error' } }, { status: 500 })
  }
}
