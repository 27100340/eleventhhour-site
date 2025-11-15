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

    // Get booking items with parent service info
    const { data: items, error: itemsError } = await supabase
      .from('booking_items')
      .select('*, services(name, parent_id, category_type)')
      .eq('booking_id', invoice.booking_id)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Fetch parent services for items that have parents
    const parentIds = items?.map(i => i.services?.parent_id).filter(Boolean) || []
    let parentServices = []
    if (parentIds.length > 0) {
      const { data: parents } = await supabase
        .from('services')
        .select('id, name, category_type')
        .in('id', parentIds)
      parentServices = parents || []
    }

    // Enrich items with parent names
    const enrichedItems = items?.map(item => ({
      ...item,
      parent_service_name: item.services?.parent_id
        ? parentServices.find(p => p.id === item.services.parent_id)?.name || null
        : null
    })) || []

    return NextResponse.json({ invoice, items: enrichedItems })
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
