// src/app/api/admin/bookings/[id]/route.ts
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Helper to consistently await params in Next 15 route handlers
async function getId(params: Promise<{ id: string }>) {
  const { id } = await params
  return id
}

type Item = { service_id: string; qty: number; unit_price: number; time_minutes: number }

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerSupabase(true)
    const id = await getId(ctx.params)

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return Response.json({ error }, { status: 404 })

    const { data: items, error: e2 } = await supabase
      .from('booking_items')
      .select('id, service_id, qty, unit_price, time_minutes, services(name)')
      .eq('booking_id', id)
    if (e2) return Response.json({ error: e2 }, { status: 400 })

    return Response.json({ booking, items })
  } catch (e: any) {
    return Response.json({ error: { message: e?.message || 'Unexpected error' } }, { status: 500 })
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerSupabase(true)
    const id = await getId(ctx.params)
    const payload = await req.json()

    const allowedStatuses = new Set(['draft', 'active', 'cancelled', 'completed'])
    const status = allowedStatuses.has(payload.status) ? payload.status : 'draft'

    const { error: e1 } = await supabase
      .from('bookings')
      .update({
        status,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        address: payload.address,
        city: payload.city,
        postcode: payload.postcode,
        phone: payload.phone,
        frequency: payload.frequency,
        service_date: payload.service_date ? new Date(payload.service_date).toISOString() : null,
        arrival_window: payload.arrival_window ?? 'exact',
        discount: Number(payload.discount ?? 0),
        admin_time_override: payload.admin_time_override ?? null,
        admin_total_override: payload.admin_total_override ?? null, // allow final price override
        subtotal: Number(payload.subtotal ?? 0),
        total: Number(payload.total ?? 0),
        total_time_minutes: Number(payload.total_time_minutes ?? 0),
        notes: payload.notes ?? null,
      })
      .eq('id', id)
    if (e1) return Response.json({ error: e1 }, { status: 400 })

    if (Array.isArray(payload.items)) {
      const { error: dErr } = await supabase.from('booking_items').delete().eq('booking_id', id)
      if (dErr) return Response.json({ error: dErr }, { status: 400 })

      if (payload.items.length) {
        const rows: Item[] = payload.items.map((i: any) => ({
          service_id: i.service_id,
          qty: Number(i.qty ?? 1),
          unit_price: Number(i.unit_price ?? 0),
          time_minutes: Number(i.time_minutes ?? 0),
        }))
        const { error: iErr } = await supabase
          .from('booking_items')
          .insert(rows.map((r) => ({ booking_id: id, ...r })))
        if (iErr) return Response.json({ error: iErr }, { status: 400 })
      }
    }

    return Response.json({ ok: true })
  } catch (e: any) {
    return Response.json({ error: { message: e?.message || 'Unexpected error' } }, { status: 500 })
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerSupabase(true)
    const id = await getId(ctx.params)
    await supabase.from('booking_items').delete().eq('booking_id', id)
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (error) return Response.json({ error }, { status: 400 })
    return Response.json({ ok: true })
  } catch (e: any) {
    return Response.json({ error: { message: e?.message || 'Unexpected error' } }, { status: 500 })
  }
}
