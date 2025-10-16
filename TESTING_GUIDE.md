# Quick Testing Guide - Invoice & Payment Features

## Test Scenarios

### Scenario 1: Customer Books Service (User Flow)
**Time Required:** 3-5 minutes

1. Navigate to http://localhost:3000/book
2. Fill out contact information (Step 1)
3. Fill out service details and select services (Step 2)
4. Click "Proceed to Payment"
5. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
6. Complete payment
7. **Expected Result:**
   - Redirected to `/booking-success` page
   - See green success header
   - See "Download Invoice" button (green gradient)
   - See "View Invoice" button (emerald outline)
8. Click "Download Invoice"
   - **Expected:** PDF downloads with booking details
9. Click "View Invoice"
   - **Expected:** PDF opens in new browser tab

**What to Verify in Invoice PDF:**
- ✓ Header shows "Eleventh Hour Cleaning"
- ✓ Invoice number format: INV-202510-XXXX
- ✓ Customer name and address correct
- ✓ All selected services listed with quantities
- ✓ Prices match booking
- ✓ Subtotal, discount (if any), and total are correct
- ✓ Payment status badge shows "PAID" in green
- ✓ Professional design with colors and spacing

---

### Scenario 2: Admin Creates Draft Booking (No Payment)
**Time Required:** 2-3 minutes

1. Login to admin portal at http://localhost:3000/admin/login
2. Navigate to "Create Booking" tab
3. Fill out customer information:
   - First name, last name
   - Email, phone
   - Address, city, postcode
4. Select service date and services
5. **Verify Checkboxes:**
   - ✓ "Generate Invoice" is checked (default)
   - ✓ "Process Stripe Payment" is unchecked
6. **Verify Sidebar Shows:**
   - "Invoice will be generated"
   - "Payment status: Pending"
7. Click "Create Draft Booking"
8. **Expected Result:**
   - Redirected to booking editor page
   - Booking status: "draft"
   - Payment status: "pending"
   - Invoice appears in "Invoices" sidebar on the right
9. Click invoice link in sidebar
   - **Expected:** Opens invoice detail page
   - Can print invoice
   - Can change invoice status

---

### Scenario 3: Admin Creates Booking with Stripe Payment
**Time Required:** 3-5 minutes

1. Login to admin portal
2. Navigate to "Create Booking" tab
3. Fill out ALL customer information (including email - recommended for receipts)
4. Select services
5. **Check BOTH checkboxes:**
   - ✓ "Generate Invoice"
   - ✓ "Process Stripe Payment"
6. **Verify Sidebar Shows:**
   - "Invoice will be generated"
   - "Will redirect to Stripe payment"
7. **Verify Button Text:**
   - Should say "Create Booking & Process Payment"
8. Click the button
9. **Expected Result:**
   - Booking created in database
   - Redirected to Stripe checkout page
10. Complete payment with test card `4242 4242 4242 4242`
11. **Expected Result:**
    - Redirected to `/booking-success` page (same as customer flow)
    - Can download/view invoice
12. Navigate back to admin dashboard
13. Open the booking in booking editor
14. **Expected Result:**
    - Booking status: "active"
    - Payment status: "paid"
    - Invoice exists in sidebar

---

### Scenario 4: Invoice Quality Check
**Time Required:** 2 minutes

Generate an invoice using any method above, then verify:

**Visual Design:**
- [ ] Green gradient header at top
- [ ] Company name "Eleventh Hour Cleaning" in white
- [ ] "INVOICE" title on right side
- [ ] Status badge (PAID/PENDING/etc.) with correct color
- [ ] Customer information in gray box

**Content Accuracy:**
- [ ] Invoice number format: INV-YYYYMM-XXXX
- [ ] Invoice date matches today
- [ ] Customer name matches booking
- [ ] Address, city, postcode match
- [ ] Email and phone match
- [ ] Service date shown (if applicable)

**Services Table:**
- [ ] Amber header row
- [ ] All services listed
- [ ] Quantities correct
- [ ] Unit prices correct
- [ ] Totals calculated correctly
- [ ] Rows have alternating backgrounds

**Totals Section:**
- [ ] Subtotal correct
- [ ] Discount shown (if applicable, in green)
- [ ] Total is bold with amber color
- [ ] Currency shows "GBP"

**Footer:**
- [ ] Payment information section (yellow background)
- [ ] Bank transfer details shown
- [ ] Reference number matches invoice number
- [ ] Company website and contact info
- [ ] Professional footer message

**Print Quality:**
- [ ] Open PDF in viewer
- [ ] Click print/save
- [ ] Verify it looks professional on paper
- [ ] No text cutoffs or overlaps
- [ ] Margins are appropriate

---

## Stripe Test Cards

Use these test cards for testing different scenarios:

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| 4242 4242 4242 4242 | Success | Payment succeeds |
| 4000 0000 0000 0002 | Decline | Card declined |
| 4000 0000 0000 9995 | Insufficient funds | Payment fails |
| 4000 0025 0000 3155 | 3D Secure required | Additional authentication |

For all cards:
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

---

## Expected Behavior Summary

### User Booking Success Page
**URL:** `/booking-success?session_id={SESSION}&booking_id={ID}`

**Elements Present:**
1. Green gradient header with checkmark icon
2. "Payment Successful!" title
3. Booking reference ID
4. Payment ID (Stripe session)
5. "What happens next?" section
6. Important information section
7. **"Download Invoice" button (green gradient)**
8. **"View Invoice" button (emerald outline)**
9. "Print Confirmation" button
10. "Back to Home" button
11. Contact support section
12. Satisfaction guarantee section

### Admin Create Booking Tab
**Location:** Admin Dashboard → Create Booking Tab

**New Elements:**
1. **Payment & Invoice Options section** (gradient blue background)
   - Checkbox: "Generate Invoice" (default: checked)
   - Checkbox: "Process Stripe Payment" (default: unchecked)
   - Warning if email missing when Stripe checked
2. **Sidebar updates:**
   - Shows "Invoice will be generated" if checked
   - Shows "Will redirect to Stripe payment" or "Payment status: Pending"
3. **Button text changes:**
   - Normal: "Create Draft Booking"
   - With Stripe: "Create Booking & Process Payment"
   - Loading: Spinner with "Creating Booking..."

---

## Common Issues & Solutions

### Issue: Invoice buttons don't appear on success page

**Possible Causes:**
- Booking data fetch failed
- API endpoint not accessible
- JavaScript error in console

**Check:**
1. Open browser console (F12)
2. Look for red errors
3. Check Network tab for failed API calls
4. Verify booking ID in URL

**Solution:**
- If `bookingData` is null, buttons won't show
- Check that `/api/admin/bookings/{id}` endpoint works
- Verify booking exists in database

---

### Issue: Stripe payment checkbox doesn't redirect

**Possible Causes:**
- Stripe keys not configured
- Network error
- Invalid checkout session

**Check:**
1. Verify `.env.local` has:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
2. Check browser console for errors
3. Check server logs for Stripe API errors

**Solution:**
- Restart dev server after adding env variables
- Verify Stripe keys are correct in Stripe dashboard
- Test with simple checkout first

---

### Issue: PDF doesn't download/open

**Possible Causes:**
- Browser blocking pop-ups
- jsPDF not loaded
- Data missing

**Check:**
1. Browser allows downloads from localhost
2. No popup blocker active
3. Console shows no jsPDF errors

**Solution:**
- Allow pop-ups for the site
- Try different browser
- Check that all invoice data is present

---

### Issue: Invoice creation fails in admin

**Possible Causes:**
- API endpoint error
- Database permissions
- Missing booking ID

**Check:**
1. Network tab shows POST to `/api/admin/invoices`
2. Response status (should be 200)
3. Server logs for database errors

**Solution:**
- Verify invoice API route exists
- Check database has invoices table
- Verify admin authentication works

---

## Quick Debugging Commands

### Check if booking exists:
```sql
SELECT * FROM bookings WHERE id = 'YOUR_BOOKING_ID';
```

### Check booking items:
```sql
SELECT bi.*, s.name
FROM booking_items bi
JOIN services s ON bi.service_id = s.id
WHERE bi.booking_id = 'YOUR_BOOKING_ID';
```

### Check invoices for booking:
```sql
SELECT * FROM invoices WHERE booking_id = 'YOUR_BOOKING_ID';
```

### Check Stripe webhook events:
- Go to Stripe Dashboard
- Click "Developers" → "Webhooks"
- View recent events
- Check for `checkout.session.completed` events

---

## Success Criteria

All features are working correctly if:

✅ User booking flow generates and displays invoice download buttons
✅ Invoice PDF downloads with correct data and professional design
✅ Invoice PDF opens in new tab when "View Invoice" clicked
✅ Admin can create draft bookings with auto-generated invoices
✅ Admin can process Stripe payments from create booking form
✅ Stripe payment redirects admin to checkout page
✅ After Stripe payment, admin sees same success page as customers
✅ Webhook updates booking to "active" and "paid" after payment
✅ All checkboxes and options work as described
✅ Sidebar in admin booking form shows correct status
✅ Button text changes based on selected options
✅ No console errors or broken functionality

---

## Performance Notes

**Expected Load Times:**
- Booking success page fetch: < 1 second
- Invoice PDF generation: < 2 seconds
- Invoice download: Instant
- Stripe redirect: < 1 second
- Admin booking creation: < 2 seconds

**Browser Compatibility:**
- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Mobile browsers: ✓ Should work (test on device)

---

## Final Checklist

Before considering testing complete, verify:

- [ ] User booking generates invoice on success page
- [ ] Download button works and PDF looks professional
- [ ] View button opens PDF in new tab
- [ ] Admin draft booking creates invoice automatically
- [ ] Admin can opt out of invoice generation
- [ ] Admin Stripe payment checkbox works
- [ ] Admin redirect to Stripe checkout functions
- [ ] Payment completion returns to success page
- [ ] Webhook updates booking status correctly
- [ ] All invoice data is accurate
- [ ] Invoice design is professional and branded
- [ ] No console errors in any flow
- [ ] All buttons and UI elements function
- [ ] Mobile responsive (if applicable)
- [ ] Documentation is clear and helpful

---

## Need Help?

If you encounter issues not covered in this guide:

1. Check browser console for errors
2. Review server logs for backend issues
3. Verify environment variables are set
4. Test with Stripe test mode
5. Check database for data integrity
6. Review the main documentation: `INVOICE_AND_ADMIN_PAYMENT_FEATURES.md`

Happy testing!
