// src/app/api/public/booking/[id]/route.ts
// Read-only booking lookup for the post-checkout success page. Access is scoped
// by the Stripe session id, which only the customer returning from checkout has.
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const sessionId = new URL(req.url).searchParams.get('session_id')?.trim() || ''
    if (!sessionId) {
      return Response.json({ error: { message: 'session_id is required' } }, { status: 400 })
    }

    const supabase = createServerSupabase(true)

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(
        'id, first_name, last_name, email, phone, address, city, postcode, service_date, subtotal, discount, total, payment_status, created_at, stripe_session_id'
      )
      .eq('id', id)
      .single()
    if (error || !booking) {
      return Response.json({ error: { message: 'Not found' } }, { status: 404 })
    }
    if (booking.stripe_session_id !== sessionId) {
      return Response.json({ error: { message: 'Not found' } }, { status: 404 })
    }

    const items = await supabase
      .from('booking_items')
      .select('id, service_id, qty, unit_price, services(name)')
      .eq('booking_id', id)
    if (items.error) {
      return Response.json({ error: { message: items.error.message } }, { status: 400 })
    }

    const { stripe_session_id: _stripeSessionId, ...publicBooking } = booking

    return Response.json(
      { booking: publicBooking, items: items.data || [] },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return Response.json({ error: { message } }, { status: 500 })
  }
}
