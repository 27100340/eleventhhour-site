// src/app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabase } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured; rejecting webhook')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid signature'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Update booking status to 'active' or 'paid'
        const bookingId = session.metadata?.bookingId

        if (bookingId) {
          const supabase = createServerSupabase(true)

          const { error } = await supabase
            .from('bookings')
            .update({
              status: 'active',
              payment_status: 'paid',
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent as string,
            })
            .eq('id', bookingId)

          if (error) {
            console.error('Failed to update booking:', error)
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('PaymentIntent failed:', paymentIntent.id)
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Error handling webhook event:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
