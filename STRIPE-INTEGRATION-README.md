# Stripe Integration Setup Guide

## Overview
Your EleventhHour booking system now integrates with Stripe for secure payment processing. When users complete a booking, they will be redirected to Stripe Checkout to pay, and upon successful payment, their booking will be confirmed.

## What Was Added

### 1. New Files Created
- `src/app/api/create-checkout-session/route.ts` - Creates Stripe checkout sessions
- `src/app/api/stripe-webhook/route.ts` - Handles Stripe webhook events (payment confirmations)
- `src/app/booking-success/page.tsx` - Success page after payment
- `supabase-migration-stripe.sql` - Database migration for payment columns

### 2. Modified Files
- `src/app/book/page.tsx` - Updated to redirect to Stripe checkout after booking creation
- `.env.local` - Added Stripe API keys

### 3. Packages Installed
- `stripe` - Server-side Stripe SDK
- `@stripe/stripe-js` - Client-side Stripe SDK

## Setup Instructions

### Step 1: Run Database Migration
1. Go to your Supabase Dashboard: https://biacudctwrcjtlmzetlj.supabase.co
2. Navigate to SQL Editor
3. Open the file `supabase-migration-stripe.sql`
4. Copy the entire content and paste it into the SQL Editor
5. Click "Run" to add the payment columns to your bookings table

### Step 2: Restart Development Server
```bash
npm run dev
```

### Step 3: Test the Booking Flow
1. Go to http://localhost:3000/book
2. Fill out the booking form (Step 1 - Personal info)
3. Select services and complete details (Step 2)
4. Click "Proceed to Payment"
5. You'll be redirected to Stripe Checkout
6. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits
7. Complete the payment
8. You'll be redirected to the success page

## Production Deployment

### Step 1: Set Up Stripe Webhooks
Webhooks allow Stripe to notify your application when payments succeed or fail.

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Add it to your `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### Step 2: Update Environment Variables in Production
Make sure your production environment (Vercel, etc.) has these variables:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (from Step 1)

### Step 3: Test in Production
1. Make a real booking on your live site
2. Complete the payment
3. Check your Supabase database to verify:
   - Booking status is "active"
   - payment_status is "paid"
   - stripe_session_id and stripe_payment_intent are populated

## How It Works

### User Flow
1. User fills out booking form
2. Booking is created in database with status "draft"
3. User is redirected to Stripe Checkout
4. User completes payment
5. Stripe sends webhook to your server
6. Server updates booking status to "active" and payment_status to "paid"
7. User sees success page

### Payment Security
- All payment processing happens on Stripe's secure servers
- Your server never touches credit card data
- Stripe handles PCI compliance
- Live API keys start with `pk_live_` and `sk_live_`

## Testing

### Test Card Numbers
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Viewing Test Payments
- Dashboard: https://dashboard.stripe.com/test/payments
- You can see all test transactions here

## Troubleshooting

### Payment succeeds but booking status doesn't update
- Check webhook is configured correctly
- Check webhook secret in `.env.local`
- View webhook logs in Stripe Dashboard

### "Failed to create checkout session" error
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check server logs for detailed error messages

### Redirect to Stripe doesn't work
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for errors

## Support

### Stripe Resources
- Dashboard: https://dashboard.stripe.com
- Documentation: https://stripe.com/docs
- API Reference: https://stripe.com/docs/api

### Your Integration Details
- Test Mode: Currently enabled (using live keys, but test in development)
- Currency: GBP (British Pounds)
- Payment Methods: Card payments

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env.local` to git
- Keep your `STRIPE_SECRET_KEY` secure
- Use test keys during development
- Webhook secret prevents unauthorized payment notifications

## Next Steps (Optional Enhancements)

1. **Email Notifications**: Send confirmation emails after payment
2. **Refunds**: Add admin interface to process refunds
3. **Subscriptions**: For recurring bookings, use Stripe Subscriptions
4. **Apple Pay / Google Pay**: Enable in Stripe Dashboard
5. **Payment Methods**: Add support for bank transfers, etc.

---

✅ Your Stripe integration is complete and ready to process payments!
