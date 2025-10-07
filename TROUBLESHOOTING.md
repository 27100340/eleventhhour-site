# Troubleshooting Guide - Stripe Integration

## "An unexpected error occurred" when clicking "Proceed to Payment"

### Step 1: Check Your Terminal/Console Logs

**Open your terminal where `npm run dev` is running** and look for error messages when you click the button. You should see logs like:

```
📝 Creating Stripe checkout session...
📦 Payload received: { bookingId: 'xxx', itemCount: 2 }
🔄 Creating Stripe session with origin: http://localhost:3000
✅ Stripe session created: cs_test_xxx
```

If you see a ❌ error message, that tells you what went wrong.

### Step 2: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Click "Proceed to Payment" again
4. Look for red error messages

Common errors:
- "Failed to fetch" → Server not running or API route issue
- "Network error" → Check if dev server is running
- Stripe errors → Check API keys

### Step 3: Run the Database Migration

**This is the most likely cause!**

If you haven't run the database migration yet, the webhook won't be able to update the booking status (though the payment will still work).

**To fix:**
1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/biacudctwrcjtlmzetlj/sql
2. Copy the contents of `supabase-migration-stripe.sql`
3. Paste and click "Run"

### Step 4: Verify Environment Variables

Run this command:
```bash
node verify-stripe-setup.js
```

You should see all checkmarks ✅. If any are ❌, check your `.env.local` file.

### Step 5: Restart Dev Server

After making changes, restart your server:
```bash
# Press Ctrl+C to stop, then:
npm run dev
```

## Common Issues and Fixes

### Issue: "Stripe secret key not configured"
**Fix:** Check `.env.local` has `STRIPE_SECRET_KEY=sk_live_...`

### Issue: "No items provided"
**Fix:** Make sure you selected at least one service with quantity > 0

### Issue: "Failed to create checkout session"
**Fix:** Check terminal logs for the specific Stripe error

### Issue: Payment succeeds but booking status doesn't update
**Fix:**
1. Run database migration (see Step 3 above)
2. For webhooks to work in production, you need to set up webhook secret

### Issue: "Failed to load payment system"
**Fix:** Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`

## How to Get Detailed Error Info

### 1. Check Server Logs (Terminal)
Look at the terminal where `npm run dev` is running. The API now logs:
- ✅ Success messages (green)
- ❌ Error messages (red)
- 📦 Payload information

### 2. Check Browser Console
Press F12 → Console tab → Look for errors when clicking the button

### 3. Check Network Tab
Press F12 → Network tab → Click "Proceed to Payment" → Look for:
- `/api/public/booking` - Should return 200 with booking ID
- `/api/create-checkout-session` - Should return 200 with session ID

If either returns an error (400, 500), click on it to see the error message.

## Test the Integration Step by Step

### Test 1: Booking Creation
1. Fill out form
2. Select a service
3. Open browser console (F12)
4. Click "Proceed to Payment"
5. Check if booking is created in Supabase database

### Test 2: Stripe Session Creation
1. Check terminal logs after clicking "Proceed to Payment"
2. Should see: "✅ Stripe session created: cs_test_xxx"

### Test 3: Stripe Redirect
1. After Stripe session is created
2. You should be redirected to Stripe's checkout page
3. URL should start with: `https://checkout.stripe.com/`

### Test 4: Payment
1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC
4. Should redirect to success page

## Still Having Issues?

### Check These Files:
1. `.env.local` - Contains correct Stripe keys
2. `package.json` - Has `stripe` and `@stripe/stripe-js` packages
3. `supabase-migration-stripe.sql` - Was run in Supabase

### Get More Details:
1. Look at terminal logs (server-side errors)
2. Look at browser console (client-side errors)
3. Check Network tab in DevTools (API call details)

### Quick Test Command:
```bash
# Verify Stripe configuration
node verify-stripe-setup.js

# Should output:
# ✅ Stripe API connection successful!
```

## Need Help?

When reporting an issue, please provide:
1. Terminal logs (copy the error from where `npm run dev` is running)
2. Browser console logs (F12 → Console → copy the error)
3. Network tab details (F12 → Network → click failed request → copy response)
4. What step you're on (booking creation, payment, redirect, etc.)

---

**Most Common Solution:** Run the database migration in Supabase (see Step 3)!
