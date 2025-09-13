// src/app/api/public/booking/route.ts
import { createServerSupabase } from '@/lib/supabase/server'

type Payload = {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  postcode: string
  phone: string
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

export async function POST(req: Request) {
  try {
    // Ensure env is present
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
      const msg = 'Missing SUPABASE env (URL or SERVICE ROLE). Did you restart dev after editing .env.local?'
      console.error(msg)
      return new Response(JSON.stringify({ error: { message: msg } }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      })
    }

    const payload = (await req.json()) as Payload

    // Basic validation
    const required: (keyof Payload)[] = [
      'email', 'firstName', 'lastName', 'address', 'city', 'postcode', 'phone', 'frequency',
    ]
    for (const k of required) {
      if (!payload?.[k]) {
        const msg = `Missing required field: ${k}`
        console.error(msg, payload)
        return new Response(JSON.stringify({ error: { message: msg } }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      }
    }

    // Optional: normalise frequency for DB
    const allowedFreq = new Set(['one_time', 'weekly', 'bi_weekly', 'monthly'])
    if (!allowedFreq.has(payload.frequency)) {
      const msg = `Invalid frequency: "${payload.frequency}". Allowed: one_time | weekly | bi_weekly | monthly`
      console.error(msg)
      return new Response(JSON.stringify({ error: { message: msg } }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    // Use the service-role key on the server so RLS does not block inserts
    // (ensure SUPABASE_SERVICE_ROLE is set in [.env.local](.env.local))
    const supabase = createServerSupabase(true)

    // Insert booking and return row (service role bypasses RLS)
    const { data: booking, error: insertErr } = await supabase
      .from('bookings')
      .insert({
        status: 'draft',
        source: 'web',
        email: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName,
        address: payload.address,
        city: payload.city,
        postcode: payload.postcode,
        phone: payload.phone,
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
      console.error('bookings insert error ->', insertErr)
      return new Response(JSON.stringify({ error: insertErr }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    // Insert items (if any)
    const items = Array.isArray(payload.items) ? payload.items : []
    if (items.length) {
      const rows = items.map((i) => ({
        booking_id: booking!.id,
        service_id: i.service_id,
        qty: Number(i.qty ?? 1),
        unit_price: Number(i.unit_price ?? 0),
        time_minutes: Number(i.time_minutes ?? 0),
      }))

      const { error: itemsErr } = await supabase.from('booking_items').insert(rows)

      if (itemsErr) {
        console.error('booking_items insert error ->', itemsErr)
        return new Response(JSON.stringify({ error: itemsErr }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ booking }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (e: any) {
    // This catches network/timeout/etc. and returns a clear error to the client
    console.error('api/public/booking fatal ->', e)
    return new Response(JSON.stringify({ error: { message: e?.message || 'Unexpected error' } }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
