// src/app/api/admin/bookings/[id]/route.ts
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Supa = ReturnType<typeof createServerSupabase> extends infer T ? T : any
type Status = 'draft' | 'active' | 'cancelled' | 'completed'
type Frequency = 'one_time' | 'weekly' | 'bi_weekly' | 'monthly'

async function getId(params: Promise<{ id: string }>) {
  const { id } = await params
  return id
}
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

async function listFutureOccurrenceIds(supabase: Supa, ruleId: string, afterISO: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('recurrence_id', ruleId)
    .gt('service_date', afterISO)
  if (error) throw error
  return (data || []).map((r: any) => r.id)
}
async function listAllOccurrenceIds(supabase: Supa, ruleId: string) {
  const { data, error } = await supabase.from('bookings').select('id').eq('recurrence_id', ruleId)
  if (error) throw error
  return (data || []).map((r: any) => r.id)
}
async function deleteBookingsByIds(supabase: Supa, ids: string[]) {
  if (!ids.length) return
  const di = await supabase.from('booking_items').delete().in('booking_id', ids)
  if (di.error) throw di.error
  const db = await supabase.from('bookings').delete().in('id', ids)
  if (db.error) throw db.error
}

async function computeTotalsForBooking(supabase: Supa, bookingId: string) {
  const { data, error } = await supabase
    .from('booking_items')
    .select('qty, unit_price, time_minutes')
    .eq('booking_id', bookingId)
  if (error) throw error
  let subtotal = 0
  let minutes = 0
  for (const it of data || []) {
    const qty = Number(it.qty || 0)
    subtotal += qty * Number(it.unit_price || 0)
    minutes += qty * Number(it.time_minutes || 0)
  }
  return { subtotal, minutes }
}

async function createFutureOccurrences(opts: {
  supabase: Supa
  ruleId: string
  template: any
  items: Array<{ service_id: string; qty: number; unit_price: number; time_minutes: number }>
  frequency: Frequency
}) {
  const { supabase, ruleId, template, items, frequency } = opts
  const { subtotal, minutes } = await computeTotalsForBooking(supabase, template.id)

  const rows: any[] = []
  const count = 6
  for (let i = 1; i <= count; i++) {
    const when =
      frequency === 'weekly'
        ? addDaysUTC(template.service_date, 7 * i)
        : frequency === 'bi_weekly'
        ? addDaysUTC(template.service_date, 14 * i)
        : addMonthsUTC(template.service_date, i)

    rows.push({
      status: 'active',
      source: 'web',
      email: template.email,
      first_name: template.first_name,
      last_name: template.last_name,
      address: template.address,
      city: template.city,
      postcode: template.postcode,
      phone: template.phone,
      frequency: template.frequency,
      service_date: when,
      arrival_window: template.arrival_window ?? 'exact',
      discount: template.discount ?? 0,
      admin_time_override: null,
      subtotal,
      total: subtotal,
      total_time_minutes: minutes,
      notes: template.notes ?? null,
      recurrence_id: ruleId,
      occurrence_index: i,
    })
  }
  if (!rows.length) return

  const created = await supabase.from('bookings').insert(rows).select('id')
  if (created.error) throw created.error
  const createdIds = (created.data || []).map((r: any) => r.id)
  if (!items?.length || !createdIds.length) return

  const itemRows: any[] = []
  for (const occId of createdIds) {
    for (const it of items) {
      itemRows.push({
        booking_id: occId,
        service_id: it.service_id,
        qty: Number(it.qty || 0),
        unit_price: Number(it.unit_price || 0),
        time_minutes: Number(it.time_minutes || 0),
      })
    }
  }
  const ie = await supabase.from('booking_items').insert(itemRows)
  if (ie.error) throw ie.error
}

/* GET */
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerSupabase(true)
    const id = await getId(ctx.params)

    const { data: booking, error } = await supabase.from('bookings').select('*').eq('id', id).single()
    if (error) return Response.json({ error }, { status: 404 })

    const items = await supabase
      .from('booking_items')
      .select('id, service_id, qty, unit_price, time_minutes, services(name)')
      .eq('booking_id', id)
    if (items.error) return Response.json({ error: items.error }, { status: 400 })

    return Response.json({ booking, items: items.data })
  } catch (e: any) {
    return Response.json({ error: { message: e?.message || 'Unexpected error' } }, { status: 500 })
  }
}

/* PUT */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerSupabase(true)
    const id = await getId(ctx.params)
    const payload = await req.json()

    const allowedStatuses = new Set<Status>(['draft', 'active', 'cancelled', 'completed'])
    const status: Status = allowedStatuses.has(payload.status) ? payload.status : 'draft'

    // Update booking core fields
    const updateRes = await supabase
      .from('bookings')
      .update({
        status,
        email: payload.email ?? null,
        first_name: payload.first_name ?? null,
        last_name: payload.last_name ?? null,
        address: payload.address ?? null,
        city: payload.city ?? null,
        postcode: payload.postcode ?? null,
        phone: payload.phone ?? null,
        frequency: payload.frequency as Frequency,
        service_date: payload.service_date ? new Date(payload.service_date).toISOString() : null,
        arrival_window: payload.arrival_window ?? 'exact',
        discount: Number(payload.discount ?? 0),
        admin_time_override: payload.admin_time_override ?? null,
        admin_total_override: payload.admin_total_override ?? null,
        notes: payload.notes ?? null,
      })
      .eq('id', id)
      .select('*')
      .single()
    if (updateRes.error) return Response.json({ error: updateRes.error }, { status: 400 })
    let updated = updateRes.data

    // Replace items
    if (Array.isArray(payload.items)) {
      const d = await supabase.from('booking_items').delete().eq('booking_id', id)
      if (d.error) return Response.json({ error: d.error }, { status: 400 })

      if (payload.items.length) {
        const rows = payload.items.map((i: any) => ({
          booking_id: id,
          service_id: i.service_id,
          qty: Number(i.qty || 0),
          unit_price: Number(i.unit_price || 0),
          time_minutes: Number(i.time_minutes || 0),
        }))
        const ins = await supabase.from('booking_items').insert(rows)
        if (ins.error) return Response.json({ error: ins.error }, { status: 400 })
      }
    }

    // Recompute totals from items (so minutes aren't 0)
    const totals = await computeTotalsForBooking(supabase, id)
    const totUpd = await supabase
      .from('bookings')
      .update({ subtotal: totals.subtotal, total: totals.subtotal, total_time_minutes: totals.minutes })
      .eq('id', id)
      .select('*')
      .single()
    if (!totUpd.error) updated = totUpd.data

    // Recurrence handling (weekly, bi_weekly, monthly)
    const isRecurring = updated.frequency === 'weekly' || updated.frequency === 'bi_weekly' || updated.frequency === 'monthly'
    const hasStart = !!updated.service_date

    // locate rule by base booking OR this occurrence
    const ruleLookup = await supabase
      .from('recurring_rules')
      .select('id, base_booking_id, active, frequency, start_at')
      .or(
        [
          `base_booking_id.eq.${id}`,
          updated.recurrence_id ? `id.eq.${updated.recurrence_id}` : `id.eq.00000000-0000-0000-0000-000000000000`,
        ].join(',')
      )
      .maybeSingle()
    const existingRule = ruleLookup.data || null

    if (isRecurring && hasStart) {
      // upsert rule
      let ruleId = existingRule?.id as string | undefined
      if (!ruleId) {
        const cr = await supabase
          .from('recurring_rules')
          .insert({ base_booking_id: id, frequency: updated.frequency, start_at: updated.service_date, active: true })
          .select('id')
          .single()
        if (cr.error) return Response.json({ error: cr.error }, { status: 400 })
        ruleId = cr.data.id
      } else {
        const ur = await supabase
          .from('recurring_rules')
          .update({ frequency: updated.frequency, start_at: updated.service_date, active: true })
          .eq('id', ruleId)
        if (ur.error) return Response.json({ error: ur.error }, { status: 400 })
      }

      // clear future then regenerate
      const nowISO = new Date().toISOString()
      const futureIds = await listFutureOccurrenceIds(supabase, ruleId!, nowISO)
      await deleteBookingsByIds(supabase, futureIds)

      const baseItems = await supabase
        .from('booking_items')
        .select('service_id, qty, unit_price, time_minutes')
        .eq('booking_id', id)
      if (baseItems.error) return Response.json({ error: baseItems.error }, { status: 400 })

      await createFutureOccurrences({
        supabase,
        ruleId: ruleId!,
        template: updated,
        items: baseItems.data || [],
        frequency: updated.frequency,
      })
    } else {
      // turn off recurrence
      if (existingRule?.id) {
        await supabase.from('recurring_rules').update({ active: false }).eq('id', existingRule.id)
        const nowISO = new Date().toISOString()
        const futureIds = await listFutureOccurrenceIds(supabase, existingRule.id, nowISO)
        await deleteBookingsByIds(supabase, futureIds)
      }
    }

    return Response.json({ ok: true })
  } catch (e: any) {
    return Response.json({ error: { message: e?.message || 'Unexpected error' } }, { status: 500 })
  }
}

/* DELETE */
export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerSupabase(true)
    const id = await getId(ctx.params)

    const bRes = await supabase.from('bookings').select('id, recurrence_id').eq('id', id).single()
    if (bRes.error) return Response.json({ error: bRes.error }, { status: 404 })
    const isOccurrence = !!bRes.data.recurrence_id

    if (isOccurrence) {
      await supabase.from('booking_items').delete().eq('booking_id', id)
      const del = await supabase.from('bookings').delete().eq('id', id)
      if (del.error) return Response.json({ error: del.error }, { status: 400 })
      return Response.json({ ok: true })
    }

    const ruleRes = await supabase.from('recurring_rules').select('id').eq('base_booking_id', id).maybeSingle()
    const ruleId = ruleRes.data?.id || null

    if (ruleId) {
      const occIds = await listAllOccurrenceIds(supabase, ruleId)
      await deleteBookingsByIds(supabase, occIds)
      const dr = await supabase.from('recurring_rules').delete().eq('id', ruleId)
      if (dr.error) return Response.json({ error: dr.error }, { status: 400 })
    }

    await supabase.from('booking_items').delete().eq('booking_id', id)
    const dbBase = await supabase.from('bookings').delete().eq('id', id)
    if (dbBase.error) return Response.json({ error: dbBase.error }, { status: 400 })

    return Response.json({ ok: true })
  } catch (e: any) {
    return Response.json({ error: { message: e?.message || 'Unexpected error' } }, { status: 500 })
  }
}
