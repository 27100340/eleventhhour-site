# 🚀 Quick Start - Stripe Payment Integration

## ✅ What's Done
Your booking system now redirects users to Stripe Checkout for secure payment processing!

## 📋 Before You Test - Run Database Migration

**IMPORTANT**: You must add payment columns to your database first!

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/biacudctwrcjtlmzetlj/sql/new
2. Or navigate: Dashboard → SQL Editor → New Query

### Step 2: Run Migration
Copy and paste the content from `supabase-migration-stripe.sql` and click "Run"

This adds:
- `payment_status` column (pending/paid/failed/refunded)
- `stripe_session_id` column
- `stripe_payment_intent` column

## 🧪 Testing Locally

### 1. Start the development server:
```bash
npm run dev
```

### 2. Open your browser:
```
http://localhost:3000/book
```

### 3. Complete a test booking:
- Fill in personal details (Step 1)
- Select services (Step 2)
- Click "Proceed to Payment"
- You'll be redirected to Stripe Checkout

### 4. Use test card details:
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

### 5. Success!
After payment, you'll see the booking success page.

## 🎯 What Happens During Booking

1. **User fills form** → Booking created in Supabase (status: "draft")
2. **Stripe Checkout opens** → User enters payment info
3. **Payment succeeds** → Stripe webhook notifies your server
4. **Booking updated** → Status: "active", payment_status: "paid"
5. **Success page** → User sees confirmation

## 🔧 Files Modified/Created

### New API Endpoints:
- [/api/create-checkout-session/route.ts](src/app/api/create-checkout-session/route.ts)
- [/api/stripe-webhook/route.ts](src/app/api/stripe-webhook/route.ts)

### New Pages:
- [/booking-success/page.tsx](src/app/booking-success/page.tsx)

### Updated:
- [/book/page.tsx](src/app/book/page.tsx) - Now redirects to Stripe
- [.env.local](.env.local) - Contains your Stripe keys

## 🌐 Production Setup

When you deploy to production:

1. **Set up webhook endpoint** in Stripe Dashboard
2. **Add webhook secret** to environment variables
3. **Update environment variables** on your hosting platform (Vercel, etc.)

See [STRIPE-INTEGRATION-README.md](STRIPE-INTEGRATION-README.md) for detailed production setup.

## 🐛 Troubleshooting

### "Failed to create checkout session"
- Check that database migration was run
- Verify Stripe keys in `.env.local`
- Check console/terminal for errors

### Payment succeeds but booking not updated
- Webhook secret needs to be configured for production
- In development, webhook updates may not work (this is normal)
- You can manually update booking status in Supabase

### Can't redirect to checkout
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for JavaScript errors

## 📚 Resources

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Test Cards**: https://stripe.com/docs/testing
- **Full Documentation**: See [STRIPE-INTEGRATION-README.md](STRIPE-INTEGRATION-README.md)

## ✨ Current Configuration

✅ Stripe Live Keys (Configured)
✅ Supabase Database (Connected)
✅ Payment Processing (Ready)
⏳ Webhook Secret (Optional for dev, required for production)

---

**Ready to test?** Just run the database migration and start the dev server!
