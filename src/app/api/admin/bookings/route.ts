// src/app/api/admin/bookings/route.ts
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const supabase = createServerSupabase(true)
    const url = new URL(req.url)
    const q = url.searchParams.get('q')?.trim() || ''
    const status = url.searchParams.get('status')?.trim() || ''
    const limit = Math.min(Number(url.searchParams.get('limit') || 100), 500)

    let query = supabase
      .from('bookings')
      .select(
        'id, status, email, first_name, last_name, phone, city, postcode, frequency, service_date, total, total_time_minutes, created_at'
      )
      .is('recurrence_id', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)
    if (q) {
      query = query.or(
        [
          `email.ilike.%${q}%`,
          `first_name.ilike.%${q}%`,
          `last_name.ilike.%${q}%`,
          `phone.ilike.%${q}%`,
          `city.ilike.%${q}%`,
          `postcode.ilike.%${q}%`,
        ].join(',')
      )
    }

    const { data, error } = await query
    if (error) return Response.json({ error }, { status: 400 })
    const rows = data || []

    // back-fill duration for any 0 values
    const missing = rows.filter((r) => !r.total_time_minutes || r.total_time_minutes === 0).map((r) => r.id)
    if (missing.length) {
      const items = await supabase
        .from('booking_items')
        .select('booking_id, qty, time_minutes')
        .in('booking_id', missing)
      if (!items.error && items.data) {
        const map = new Map<string, number>()
        for (const it of items.data) {
          const key = it.booking_id as string
          const add = Number(it.qty || 0) * Number(it.time_minutes || 0)
          map.set(key, (map.get(key) || 0) + add)
        }
        for (const r of rows) {
          if (!r.total_time_minutes || r.total_time_minutes === 0) {
            r.total_time_minutes = map.get(r.id) || 0
          }
        }
      }
    }

    return Response.json({ data: rows }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return Response.json({ error: { message: e?.message || 'Unexpected error' } }, { status: 500 })
  }
}
