// src/app/api/create-checkout-session/route.ts
// Creates a Stripe Checkout session for an existing booking. The booking row
// and its items in the database are the source of truth for the amount
// charged — the client payload only identifies the booking.
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabase } from '@/lib/supabase/server'
import { buildStripeLines, computeBookingTotals } from '@/lib/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CheckoutPayload = {
  bookingId: string
  customerEmail?: string
  customerName?: string
  adminTotalOverride?: number | null
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: { message: 'Stripe secret key not configured' } },
        { status: 500 },
      )
    }

    const payload: CheckoutPayload = await req.json()
    if (!payload.bookingId) {
      return NextResponse.json(
        { error: { message: 'bookingId is required' } },
        { status: 400 },
      )
    }

    const supabase = createServerSupabase(true)

    const [bookingRes, itemsRes, servicesRes] = await Promise.all([
      supabase.from('bookings').select('*').eq('id', payload.bookingId).single(),
      supabase
        .from('booking_items')
        .select('service_id, qty, unit_price, time_minutes')
        .eq('booking_id', payload.bookingId),
      supabase
        .from('services')
        .select('id, name, price, parent_id, is_category, category_type'),
    ])

    if (bookingRes.error || !bookingRes.data) {
      return NextResponse.json(
        { error: { message: 'Booking not found' } },
        { status: 404 },
      )
    }
    if (itemsRes.error) {
      return NextResponse.json({ error: itemsRes.error }, { status: 400 })
    }

    const booking = bookingRes.data
    const items = itemsRes.data || []
    const services = servicesRes.data || []

    if (items.length === 0) {
      return NextResponse.json(
        { error: { message: 'Booking has no items to charge' } },
        { status: 400 },
      )
    }

    const totals = computeBookingTotals(items, services)
    const discount = Math.max(0, Number(booking.discount) || 0)
    const hasAdminOverride =
      typeof payload.adminTotalOverride === 'number' &&
      payload.adminTotalOverride > 0

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]
    let couponId: string | undefined

    if (hasAdminOverride) {
      // Admin set an exact final amount: charge it as a single line, no coupon.
      lineItems = [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: 'Cleaning service — agreed total' },
            unit_amount: Math.round(payload.adminTotalOverride! * 100),
          },
          quantity: 1,
        },
      ]
    } else {
      lineItems = buildStripeLines(items, services).map((line) => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: line.name,
            ...(line.description ? { description: line.description } : {}),
          },
          unit_amount: line.unit_amount_pence,
        },
        quantity: line.quantity,
      }))

      if (discount > 0) {
        const coupon = await stripe.coupons.create({
          amount_off: Math.round(discount * 100),
          currency: 'gbp',
          duration: 'once',
          name: `Discount — £${discount.toFixed(2)}`,
        })
        couponId = coupon.id
      }
    }

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000'

    const chargedTotal = hasAdminOverride
      ? payload.adminTotalOverride!
      : Math.max(0, totals.subtotal - discount)

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${origin}/book?canceled=true`,
      customer_email: booking.email || payload.customerEmail || undefined,
      metadata: {
        bookingId: booking.id,
        discount: discount.toString(),
        subtotal: totals.subtotal.toString(),
        total: chargedTotal.toString(),
      },
    }
    if (couponId) {
      sessionParams.discounts = [{ coupon: couponId }]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Record the session on the booking so the public success page can look
    // the booking up with session-scoped access, and keep DB totals in sync
    // with what Stripe will actually charge.
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        stripe_session_id: session.id,
        subtotal: totals.subtotal,
        total: chargedTotal,
        total_time_minutes: totals.totalTimeMinutes,
      })
      .eq('id', booking.id)
    if (updateError) {
      console.error('Failed to record Stripe session on booking:', updateError)
    }

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create checkout session'
    console.error('Stripe checkout session creation failed:', error)
    return NextResponse.json({ error: { message } }, { status: 500 })
  }
}
