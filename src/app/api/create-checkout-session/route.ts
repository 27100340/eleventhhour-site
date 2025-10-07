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
  customerEmail?: string
  customerName?: string
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
    console.log('📦 Payload received:', { bookingId: payload.bookingId, itemCount: payload.items?.length })

    if (!payload.items || payload.items.length === 0) {
      console.error('❌ No items in payload')
      return NextResponse.json(
        { error: { message: 'No items provided' } },
        { status: 400 }
      )
    }

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = payload.items.map((item) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          description: `${item.time_minutes} minutes`,
        },
        unit_amount: Math.round(item.unit_price * 100), // Convert to pence
      },
      quantity: item.qty,
    }))

    // Get the origin from the request headers
    const origin = req.headers.get('origin') || 'http://localhost:3000'

    // Create Stripe Checkout Session
    console.log('🔄 Creating Stripe session with origin:', origin)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${payload.bookingId}`,
      cancel_url: `${origin}/book?canceled=true`,
      customer_email: payload.customerEmail,
      metadata: {
        bookingId: payload.bookingId,
      },
    })

    console.log('✅ Stripe session created:', session.id)
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
