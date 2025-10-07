// src/app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabase } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// This is your Stripe CLI webhook secret for testing your endpoint locally.
// You'll need to set this in your .env.local file
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
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
    // Verify webhook signature if secret is configured
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } else {
      // For development without webhook secret
      event = JSON.parse(body)
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
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

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('PaymentIntent succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('PaymentIntent failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
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
