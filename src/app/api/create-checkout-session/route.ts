// src/app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CheckoutItem = {
  service_id: string
  name: string
  qty: number
  unit_price: number
  time_minutes: number
}

type CheckoutPayload = {
  bookingId: string
  items: CheckoutItem[]
  total: number
  subtotal?: number
  discount?: number
  customerEmail?: string
  customerName?: string
  adminTotalOverride?: number | null
}

export async function POST(req: NextRequest) {
  try {
    console.log('📝 Creating Stripe checkout session...')

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment')
      return NextResponse.json(
        { error: { message: 'Stripe secret key not configured' } },
        { status: 500 }
      )
    }

    const payload: CheckoutPayload = await req.json()
    console.log('📦 Payload received:', {
      bookingId: payload.bookingId,
      itemCount: payload.items?.length,
      total: payload.total,
      discount: payload.discount
    })

    if (!payload.items || payload.items.length === 0) {
      console.error('❌ No items in payload')
      return NextResponse.json(
        { error: { message: 'No items provided' } },
        { status: 400 }
      )
    }

    // Calculate subtotal from items
    const calculatedSubtotal = payload.items.reduce(
      (sum, item) => sum + (item.unit_price * item.qty),
      0
    )
    const subtotal = payload.subtotal || calculatedSubtotal
    const discount = payload.discount || 0
    const calculatedTotal = subtotal - discount
    const total = payload.total || calculatedTotal

    // Determine if we need to apply proportional price adjustment for admin override
    const hasAdminOverride = typeof payload.adminTotalOverride === 'number'
    const priceMultiplier = hasAdminOverride && calculatedTotal > 0
      ? payload.adminTotalOverride! / calculatedTotal
      : 1

    if (hasAdminOverride) {
      console.log('🔧 Admin override detected. Calculated total:', calculatedTotal, 'Override:', payload.adminTotalOverride, 'Multiplier:', priceMultiplier)
    }

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    // Add service items with proportional pricing if override exists
    payload.items.forEach((item) => {
      const adjustedPrice = item.unit_price * priceMultiplier
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.name,
            description: `${item.time_minutes} minutes`,
          },
          unit_amount: Math.round(adjustedPrice * 100), // Convert to pence
        },
        quantity: item.qty,
      })
    })

    // Get the origin from the request headers
    const origin = req.headers.get('origin') || 'http://localhost:3000'

    // Create a coupon for the discount if applicable
    let couponId: string | undefined
    if (discount > 0) {
      console.log('🎟️ Creating discount coupon for:', discount, 'GBP')
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100), // Convert to pence
        currency: 'gbp',
        duration: 'once',
        name: `Discount - ${discount.toFixed(2)} GBP`,
      })
      couponId = coupon.id
      console.log('✅ Coupon created:', couponId)
    }

    // Create Stripe Checkout Session
    console.log('🔄 Creating Stripe session with origin:', origin)
    console.log('💰 Subtotal:', subtotal, 'GBP | Discount:', discount, 'GBP | Total:', total, 'GBP')

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${payload.bookingId}`,
      cancel_url: `${origin}/book?canceled=true`,
      customer_email: payload.customerEmail,
      metadata: {
        bookingId: payload.bookingId,
        discount: discount.toString(),
        subtotal: subtotal.toString(),
        total: total.toString(),
      },
    }

    // Add discount coupon if applicable
    if (couponId) {
      sessionParams.discounts = [{ coupon: couponId }]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log('✅ Stripe session created:', session.id)
    console.log('💳 Checkout URL:', session.url)
    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('❌ Stripe checkout session creation failed:', error)
    console.error('Error details:', {
      message: error?.message,
      type: error?.type,
      code: error?.code,
      statusCode: error?.statusCode,
    })
    return NextResponse.json(
      { error: { message: error?.message || 'Failed to create checkout session', details: error?.type } },
      { status: 500 }
    )
  }
}
