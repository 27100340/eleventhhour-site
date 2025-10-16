# Discount Codes - Quick Setup Guide

## Step 1: Run Database Migration

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Open the file: `supabase-migration-discount-codes.sql`
4. Copy all contents
5. Paste into SQL Editor
6. Click "Run"
7. Verify success message

## Step 2: Verify Installation

Check that the table was created:

```sql
SELECT * FROM discount_codes;
```

You should see 3 sample codes:
- WELCOME10 (10% off)
- SAVE20 (£20 off orders over £100)
- SPRING25 (25% off)

## Step 3: Access Admin Dashboard

1. Navigate to your site: `http://localhost:3000/admin/dashboard`
2. Login with admin credentials
3. You should now see a **"Discount Codes"** tab
4. Click it to see the discount codes management interface

## Step 4: Create Your First Code

1. Click **"Create Discount Code"** button
2. Fill in the form:
   - **Code:** FIRST10 (will be auto-uppercase)
   - **Description:** First-time customer discount
   - **Type:** Percentage
   - **Value:** 10
   - **Min Order:** 0 (no minimum)
   - **Usage Limit:** 50
   - **Valid Until:** Select a future date
   - **Active:** Checked ✓
3. Click **"Create Code"**
4. Verify it appears in the table

## Step 5: Test Customer Booking

1. Open a new incognito/private window
2. Navigate to: `http://localhost:3000/book`
3. Fill Step 1 (contact information)
4. Click "Continue"
5. Select some services in Step 2
6. Scroll down to **"Have a discount code?"** section
7. Enter: **FIRST10**
8. Click **"Apply"**
9. You should see:
   - ✅ Green success message
   - "FIRST10 Applied!"
   - Discount amount shown
   - Total updated in sidebar

## Step 6: Complete Test Booking

1. Click "Proceed to Payment"
2. Verify Stripe checkout shows the **discounted price**
3. Use test card: `4242 4242 4242 4242`
4. Complete payment
5. Verify booking success page shows correct total

## Step 7: Check Usage Stats

1. Return to Admin Dashboard → Discount Codes
2. Find FIRST10 code
3. Verify "Times Used" increased to 1
4. Usage stats update in real-time

---

## Common Scenarios

### Create a Limited-Time Sale Code

```
Code: FLASH50
Type: Percentage
Value: 50
Min Order: 100
Usage Limit: 20
Valid Until: Tomorrow at midnight
Active: Yes
```

### Create a First-Order Discount

```
Code: WELCOME15
Type: Percentage
Value: 15
Min Order: 0
Usage Limit: 100
Valid Until: +30 days
Active: Yes
```

### Create a Fixed Amount Coupon

```
Code: SAVE25
Type: Fixed Amount
Value: 25
Min Order: 150
Usage Limit: Unlimited (leave empty)
Valid Until: No expiry (leave empty)
Active: Yes
```

---

## Quick Troubleshooting

### "Discount code not found" error
→ Make sure you ran the database migration

### Can't see Discount Codes tab
→ Verify you're logged in as admin (check user metadata)

### Code says "Invalid"
→ Check:
- Code is active ✓
- Not expired ✓
- Usage limit not reached ✓
- Order meets minimum amount ✓

### Discount not applying to total
→ Refresh page and try again
→ Check browser console for errors

---

## Next Steps

- Share your discount codes with customers via:
  - Email campaigns
  - Social media posts
  - Website banners
  - SMS messages

- Monitor performance in Admin Dashboard:
  - View "Total Uses" stats
  - Track "Expiring Soon" codes
  - See active vs inactive codes

- Create seasonal campaigns:
  - Holiday codes (XMAS25, NEWYEAR20)
  - Event-based codes (BLACKFRIDAY, SPRINGCLEAN)
  - Customer appreciation codes (THANKYOU10)

---

## Support

For detailed documentation, see: `DISCOUNT_CODES_FEATURE.md`

For testing instructions, see the Testing Guide section in the main documentation.

Happy discounting! 🎉
