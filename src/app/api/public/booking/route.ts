// src/app/api/public/booking/route.ts
import { createServerSupabase } from '@/lib/supabase/server'

type Payload = {
  email?: string
  firstName?: string
  lastName?: string
  address?: string
  city?: string
  postcode?: string
  phone?: string
  frequency: 'one_time' | 'weekly' | 'bi_weekly' | 'monthly'
  serviceDate?: string
  arrivalWindow?: 'exact' | 'morning' | 'afternoon'
  discount?: number
  subtotal?: number
  total?: number
  total_time_minutes?: number
  notes?: string
  items?: Array<{ service_id: string; qty: number; unit_price: number; time_minutes: number }>
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function addDaysUTC(iso: string, days: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString()
}
function addMonthsUTC(iso: string, months: number): string {
  const d = new Date(iso)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString()
}

function computeTotalsFromItems(items: Payload['items']) {
  let subtotal = 0
  let minutes = 0
  for (const it of items || []) {
    const qty = Number(it.qty || 0)
    subtotal += qty * Number(it.unit_price || 0)
    minutes += qty * Number(it.time_minutes || 0)
  }
  return { subtotal, minutes }
}

async function createFutureOccurrences(opts: {
  supabase: ReturnType<typeof createServerSupabase> extends infer T ? T : any
  ruleId: string
  payload: Payload
  startAtISO: string
  mode: 'weekly' | 'bi_weekly' | 'monthly'
}) {
  const { supabase, ruleId, payload, startAtISO, mode } = opts
  const items = Array.isArray(payload.items) ? payload.items : []
  const { subtotal, minutes } = computeTotalsFromItems(items)

  const rows: any[] = []
  const count = 6 // ~6 months of occurrences
  for (let i = 1; i <= count; i++) {
    const when =
      mode === 'weekly'
        ? addDaysUTC(startAtISO, 7 * i)
        : mode === 'bi_weekly'
        ? addDaysUTC(startAtISO, 14 * i)
        : addMonthsUTC(startAtISO, i)

    rows.push({
      status: 'active',
      source: 'web',
      email: payload.email || null,
      first_name: payload.firstName || null,
      last_name: payload.lastName || null,
      address: payload.address || null,
      city: payload.city || null,
      postcode: payload.postcode || null,
      phone: payload.phone || null,
      frequency: payload.frequency,
      service_date: when,
      arrival_window: payload.arrivalWindow ?? 'exact',
      discount: Number(payload.discount ?? 0),
      admin_time_override: null,
      subtotal,
      total: subtotal,
      total_time_minutes: minutes,
      notes: payload.notes ?? null,
      recurrence_id: ruleId,
      occurrence_index: i,
    })
  }

  if (!rows.length) return
  const inserted = await supabase.from('bookings').insert(rows).select('id')
  if (inserted.error) throw inserted.error

  if (items.length && inserted.data?.length) {
    const itemRows: any[] = []
    for (const occ of inserted.data) {
      for (const it of items) {
        itemRows.push({
          booking_id: occ.id,
          service_id: it.service_id,
          qty: Number(it.qty || 0),
          unit_price: Number(it.unit_price || 0),
          time_minutes: Number(it.time_minutes || 0),
        })
      }
    }
    const insItems = await supabase.from('booking_items').insert(itemRows)
    if (insItems.error) throw insItems.error
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: { message: 'Missing SUPABASE env' } }), { status: 500 })
    }

    const payload = (await req.json()) as Payload
    if (!payload.phone && !payload.email) {
      return new Response(JSON.stringify({ error: { message: 'Provide at least a phone or an email.' } }), { status: 400 })
    }

    const allowed = new Set(['one_time', 'weekly', 'bi_weekly', 'monthly'])
    if (!allowed.has(payload.frequency)) {
      return new Response(JSON.stringify({ error: { message: `Invalid frequency: ${payload.frequency}` } }), { status: 400 })
    }

    const supabase = createServerSupabase(true)

    // Compute totals server-side to avoid 0s
    const items = Array.isArray(payload.items) ? payload.items : []
    const totals = computeTotalsFromItems(items)

    // Base booking
    const baseRes = await supabase
      .from('bookings')
      .insert({
        status: 'draft',
        source: 'web',
        email: payload.email || null,
        first_name: payload.firstName || null,
        last_name: payload.lastName || null,
        address: payload.address || null,
        city: payload.city || null,
        postcode: payload.postcode || null,
        phone: payload.phone || null,
        frequency: payload.frequency,
        service_date: payload.serviceDate ? new Date(payload.serviceDate).toISOString() : null,
        arrival_window: payload.arrivalWindow ?? 'exact',
        discount: Number(payload.discount ?? 0),
        admin_time_override: null,
        subtotal: totals.subtotal,
        total: totals.subtotal,
        total_time_minutes: totals.minutes,
        notes: payload.notes ?? null,
      })
      .select('*')
      .single()
    if (baseRes.error) return new Response(JSON.stringify({ error: baseRes.error }), { status: 400 })
    const booking = baseRes.data

    if (items.length) {
      const rows = items.map((i) => ({
        booking_id: booking.id,
        service_id: i.service_id,
        qty: Number(i.qty ?? 0),
        unit_price: Number(i.unit_price ?? 0),
        time_minutes: Number(i.time_minutes ?? 0),
      }))
      const insItems = await supabase.from('booking_items').insert(rows)
      if (insItems.error) return new Response(JSON.stringify({ error: insItems.error }), { status: 400 })
    }

    // Recurrence (weekly/bi_weekly/monthly) if we have date
    const freq = booking.frequency
    if (booking.service_date && (freq === 'weekly' || freq === 'bi_weekly' || freq === 'monthly')) {
      const rule = await supabase
        .from('recurring_rules')
        .insert({
          base_booking_id: booking.id,
          frequency: freq,
          start_at: booking.service_date,
          active: true,
        })
        .select('id, start_at, frequency')
        .single()
      if (!rule.error && rule.data?.id) {
        await createFutureOccurrences({
          supabase,
          ruleId: rule.data.id,
          payload,
          startAtISO: rule.data.start_at,
          mode: freq === 'weekly' ? 'weekly' : freq === 'bi_weekly' ? 'bi_weekly' : 'monthly',
        })
      }
    }

    return new Response(JSON.stringify({ booking }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: { message: e?.message || 'Unexpected error' } }), { status: 500 })
  }
}
