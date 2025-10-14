import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getId(params: Promise<{ id: string }>) {
  const { id } = await params
  return id
}

// GET /api/admin/invoices/[id]
export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerSupabase(true)
    const id = await getId(ctx.params)

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        bookings(
          id,
          email,
          first_name,
          last_name,
          address,
          city,
          postcode,
          phone,
          service_date,
          subtotal,
          total,
          discount,
          admin_total_override
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Get booking items
    const { data: items, error: itemsError } = await supabase
      .from('booking_items')
      .select('*, services(name)')
      .eq('booking_id', invoice.booking_id)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json({ invoice, items: items || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

// PATCH /api/admin/invoices/[id]
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerSupabase(true)
    const id = await getId(ctx.params)
    const updates = await req.json()

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

// DELETE /api/admin/invoices/[id]
export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerSupabase(true)
    const id = await getId(ctx.params)

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
