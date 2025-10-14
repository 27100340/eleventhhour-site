import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/admin/invoices?bookingId=xxx
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase(true)
    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get('bookingId')

    if (bookingId) {
      // Get invoices for specific booking
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data })
    } else {
      // Get all invoices
      const { data, error } = await supabase
        .from('invoices')
        .select('*, bookings(id, email, first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

// POST /api/admin/invoices
// Body: { bookingId: string, amount?: number, currency?: string, due_date?: string, notes?: string }
export async function POST(req: NextRequest) {
  try {
    const { bookingId, amount, currency = 'GBP', due_date, notes } = await req.json()
    if (!bookingId) return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })

    const supabase = createServerSupabase(true)

    // If amount not provided, compute from booking (prefer admin_total_override)
    let finalAmount = amount
    if (typeof finalAmount !== 'number') {
      const { data: booking, error: bErr } = await supabase
        .from('bookings')
        .select('id, total, admin_total_override')
        .eq('id', bookingId)
        .single()
      if (bErr || !booking) {
        return NextResponse.json({ error: bErr?.message || 'Booking not found' }, { status: 404 })
      }
      finalAmount = typeof booking.admin_total_override === 'number' && !isNaN(booking.admin_total_override)
        ? booking.admin_total_override
        : (typeof booking.total === 'number' ? booking.total : 0)
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        booking_id: bookingId,
        amount: finalAmount,
        currency,
        status: 'draft',
        due_date,
        notes
      })
      .select('id, invoice_number')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data.id, invoice_number: data.invoice_number })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

