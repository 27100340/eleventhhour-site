import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const supabase = createServerSupabase(true)
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const status = (searchParams.get('status') || '').trim()
    const dateFrom = searchParams.get('from')
    const dateTo = searchParams.get('to')

    let query = supabase
      .from('bookings')
      .select(
        'id, created_at, service_date, status, first_name, last_name, email, phone, postcode, city, total, admin_total_override, total_time_minutes',
      )
      .order('created_at', { ascending: false })
      .limit(500)

    if (status) query = query.eq('status', status)
    if (q) {
      query = query.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,postcode.ilike.%${q}%`,
      )
    }
    if (dateFrom) query = query.gte('service_date', dateFrom)
    if (dateTo) query = query.lte('service_date', dateTo)

    const { data, error } = await query
    if (error) return Response.json({ error }, { status: 400 })
    return Response.json({ data })
  } catch (e: any) {
    return Response.json({ error: { message: e?.message || 'Unexpected error' } }, { status: 500 })
  }
}
