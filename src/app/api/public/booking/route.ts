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
  items?: Array<{
    service_id: string
    qty: number
    unit_price: number
    time_minutes: number
  }>
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
      const msg = 'Missing SUPABASE env (URL or SERVICE ROLE).'
      return new Response(JSON.stringify({ error: { message: msg } }), { status: 500, headers: { 'content-type': 'application/json' } })
    }

    const payload = (await req.json()) as Payload

    // Minimal validation: must have at least phone or email
    if (!payload.phone && !payload.email) {
      return new Response(JSON.stringify({ error: { message: 'Provide at least a phone or an email.' } }), {
        status: 400, headers: { 'content-type': 'application/json' },
      })
    }

    const allowedFreq = new Set(['one_time', 'weekly', 'bi_weekly', 'monthly'])
    if (!allowedFreq.has(payload.frequency)) {
      return new Response(JSON.stringify({ error: { message: `Invalid frequency: ${payload.frequency}` } }), {
        status: 400, headers: { 'content-type': 'application/json' },
      })
    }

    const supabase = createServerSupabase(true)

    const { data: booking, error: insertErr } = await supabase
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
        discount: payload.discount ?? 0,
        admin_time_override: null,
        subtotal: Number(payload.subtotal ?? 0),
        total: Number(payload.total ?? 0),
        total_time_minutes: Number(payload.total_time_minutes ?? 0),
        notes: payload.notes ?? null,
      })
      .select('*')
      .single()

    if (insertErr) {
      return new Response(JSON.stringify({ error: insertErr }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    const items = Array.isArray(payload.items) ? payload.items : []
    if (items.length) {
      const rows = items.map(i => ({
        booking_id: booking!.id,
        service_id: i.service_id,
        qty: Number(i.qty ?? 1),
        unit_price: Number(i.unit_price ?? 0),
        time_minutes: Number(i.time_minutes ?? 0),
      }))
      const { error: itemsErr } = await supabase.from('booking_items').insert(rows)
      if (itemsErr) {
        return new Response(JSON.stringify({ error: itemsErr }), { status: 400, headers: { 'content-type': 'application/json' } })
      }
    }

    return new Response(JSON.stringify({ booking }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: { message: e?.message || 'Unexpected error' } }), {
      status: 500, headers: { 'content-type': 'application/json' },
    })
  }
}
