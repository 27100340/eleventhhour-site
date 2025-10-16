# Invoice Generation & Admin Payment Features

## Overview

This document outlines the new invoice generation and admin payment processing features implemented for the EleventhHour Cleaning website.

## Features Implemented

### 1. Custom Invoice PDF Generation

**Location:** `src/lib/invoice-generator.ts`

A professional invoice generator that creates beautifully designed PDF invoices with:

- **Professional Design:**
  - Gradient header with company branding
  - Color-coded payment status badges (Paid: Green, Pending: Amber, Failed: Red)
  - Modern layout with rounded corners and proper spacing
  - Print-optimized A4 format

- **Complete Invoice Details:**
  - Company information (Eleventh Hour Cleaning)
  - Invoice number (format: INV-YYYYMM-XXXX)
  - Invoice and service dates
  - Booking reference ID
  - Customer billing information (name, address, email, phone)

- **Service Breakdown:**
  - Itemized services table with quantities and prices
  - Alternating row colors for better readability
  - Subtotal, discount, and total calculations
  - Currency display (GBP)

- **Payment Information:**
  - Bank transfer details
  - Payment terms (14 days)
  - Reference number for payments

- **Professional Footer:**
  - Company website and contact information
  - Thank you message
  - Payment terms reminder

**Functions Available:**
```typescript
// Generate and download invoice PDF
downloadInvoice(invoiceData: InvoiceData)

// Open invoice PDF in new browser tab
viewInvoice(invoiceData: InvoiceData)

// Generate PDF object for custom handling
generateInvoicePDF(invoiceData: InvoiceData): jsPDF
```

---

### 2. User Booking Success Page with Invoice Generation

**Location:** `src/app/booking-success/page.tsx`

Enhanced the booking success page to automatically:

1. **Fetch Complete Booking Details:**
   - Retrieves booking information after successful payment
   - Loads all booking items with service details
   - Handles errors gracefully without breaking the page

2. **Display Invoice Actions:**
   - **Download Invoice Button:** Downloads a PDF invoice to the user's device
   - **View Invoice Button:** Opens the invoice in a new browser tab
   - Both buttons are prominently displayed with professional styling

3. **Professional UI:**
   - Green gradient success header with animated check icon
   - Booking reference and payment ID display
   - "What happens next" information section
   - Important information about the service
   - Contact support information

**User Experience Flow:**
```
User completes Stripe payment
    ↓
Redirected to booking-success page
    ↓
Page fetches booking details automatically
    ↓
User sees:
  • Success confirmation
  • Booking reference
  • Payment ID
  • Download Invoice button (prominent green gradient)
  • View Invoice button (emerald outline)
  • Print Confirmation button
```

---

### 3. Admin Create Booking with Payment & Invoice Options

**Location:** `src/components/admin/CreateBookingTab.tsx`

Enhanced admin booking creation with new checkboxes:

#### **Option 1: Generate Invoice**
- **Default:** Enabled (checked by default)
- **Functionality:** Automatically creates an invoice record in the database when booking is created
- **Benefits:**
  - Invoice is immediately available in the booking editor
  - Can be viewed, printed, or modified later
  - Tracks invoice status (draft, sent, paid, void)

#### **Option 2: Process Stripe Payment**
- **Default:** Disabled (unchecked by default)
- **Functionality:** Redirects admin to Stripe checkout page (same as customer flow)
- **Use Cases:**
  - Admin taking payment over the phone
  - Admin processing payment on behalf of customer
  - Walk-in customer payments

**Enhanced UI Features:**

1. **Payment & Invoice Options Section:**
   - Beautiful gradient background (blue to indigo)
   - Two checkbox options with descriptions
   - Hover effects on each option
   - Warning if email is missing when Stripe payment is selected

2. **Dynamic Button Text:**
   - Normal: "Create Draft Booking"
   - With Stripe payment: "Create Booking & Process Payment"
   - Loading state with spinner animation

3. **Real-time Summary Sidebar:**
   - Shows selected options
   - Displays whether invoice will be generated
   - Shows payment status (Stripe or Pending)
   - Visual indicators with icons

**Admin Workflow:**

**Scenario A: Draft Booking (Default)**
```
Admin fills booking form
    ↓
Both checkboxes: Generate Invoice ✓, Process Stripe Payment ✗
    ↓
Clicks "Create Draft Booking"
    ↓
System:
  • Creates booking (status: draft, payment: pending)
  • Creates booking items
  • Generates invoice automatically
  • Redirects to booking editor page
```

**Scenario B: Booking with Immediate Payment**
```
Admin fills booking form
    ↓
Checks "Process Stripe Payment" checkbox
    ↓
Clicks "Create Booking & Process Payment"
    ↓
System:
  • Creates booking (status: draft, payment: pending)
  • Creates booking items
  • Generates invoice automatically
  • Creates Stripe checkout session
  • Redirects admin to Stripe checkout page
    ↓
Admin completes payment on Stripe
    ↓
Stripe webhook updates booking:
  • status: active
  • payment_status: paid
    ↓
Admin redirected to booking-success page
    ↓
Can download/view invoice immediately
```

---

## Technical Implementation Details

### Invoice Number Format

The invoice generator creates invoice numbers in this format:
```
INV-YYYYMM-XXXX

Examples:
INV-202510-A7B3
INV-202511-F9D2
```

- `YYYYMM`: Current year and month
- `XXXX`: First 4 characters of booking ID (uppercase)

### Database Integration

**Invoice Creation:**
```typescript
POST /api/admin/invoices
{
  "bookingId": "uuid",
  "amount": 150.00,
  "currency": "GBP"
}
```

The system uses the existing invoice API endpoints:
- `POST /api/admin/invoices` - Create invoice
- `GET /api/admin/invoices/{id}` - Get invoice details
- `PATCH /api/admin/invoices/{id}` - Update invoice status
- `DELETE /api/admin/invoices/{id}` - Delete invoice

### Stripe Integration

The admin booking Stripe payment uses the exact same flow as customer bookings:

1. **Create Checkout Session:**
   - Endpoint: `/api/create-checkout-session`
   - Creates line items from selected services
   - Includes customer email and name
   - Sets success URL to `/booking-success?session_id={SESSION}&booking_id={ID}`

2. **Webhook Updates:**
   - Endpoint: `/api/stripe-webhook`
   - Listens for `checkout.session.completed` event
   - Updates booking status to 'active'
   - Updates payment_status to 'paid'

3. **Return Flow:**
   - Admin sees exact same success page as customers
   - Can download/view invoice immediately
   - Can navigate back to admin dashboard

---

## UI/UX Enhancements

### Booking Success Page

**Before:**
- Basic success message
- Booking reference display
- Print confirmation button

**After:**
- ✓ All previous features retained
- ✓ Prominent "Download Invoice" button (green gradient)
- ✓ "View Invoice" button (opens in new tab)
- ✓ Automatic booking data fetching
- ✓ Professional invoice generation

### Admin Create Booking Tab

**Before:**
- Create draft bookings only
- Manual invoice creation required
- No payment processing option

**After:**
- ✓ All previous features retained
- ✓ "Generate Invoice" checkbox (default: enabled)
- ✓ "Process Stripe Payment" checkbox (default: disabled)
- ✓ Dynamic button text based on selections
- ✓ Real-time sidebar showing selected options
- ✓ Email warning for Stripe payments
- ✓ Loading state with spinner animation

---

## Invoice Design Features

### Header Section
- Gradient green background (matching success page)
- Large company name in white
- "INVOICE" title on the right
- Auto-generated invoice number
- Color-coded status badge

### Customer Information
- "BILL TO" section with light gray background
- Customer name (bold)
- Full address
- Email and phone

### Items Table
- Clean table design with amber header
- Service name, quantity, unit price, total
- Alternating row backgrounds for readability
- Automatic page breaks for long service lists

### Totals Section
- Subtotal display
- Discount (if applicable, shown in green)
- Bold total with amber accent color
- Currency displayed (GBP)

### Payment Information Box
- Yellow background for visibility
- Bank transfer details
- Payment terms
- Reference number (invoice number)

### Footer
- Professional thank you message
- Website, email, and phone
- Payment terms reminder
- Consistent branding

---

## Files Created/Modified

### New Files:
1. `src/lib/invoice-generator.ts` - Invoice PDF generation utility

### Modified Files:
1. `src/app/booking-success/page.tsx` - Added invoice download/view functionality
2. `src/components/admin/CreateBookingTab.tsx` - Added payment and invoice options

---

## Dependencies

All required dependencies are already installed in the project:

- `jspdf` (v2.5.2) - PDF generation library
- `stripe` (v19.1.0) - Payment processing
- `lucide-react` - Icons (Download, FileText, Home)
- `react` & `next` - Framework

---

## Testing Instructions

### Test 1: User Booking with Invoice

1. Go to `/book` page
2. Fill out booking form (Steps 1-2)
3. Click "Proceed to Payment"
4. Complete Stripe payment (use test card: `4242 4242 4242 4242`)
5. Verify redirect to booking-success page
6. Click "Download Invoice" button
7. Verify PDF downloads with correct:
   - Customer information
   - Service breakdown
   - Totals and discount
   - Professional design
8. Click "View Invoice" button
9. Verify PDF opens in new tab

### Test 2: Admin Draft Booking with Invoice

1. Login to admin portal
2. Go to "Create Booking" tab
3. Fill out customer and service information
4. Verify "Generate Invoice" is checked by default
5. Verify "Process Stripe Payment" is unchecked
6. Click "Create Draft Booking"
7. Verify redirect to booking editor
8. Verify invoice appears in the "Invoices" sidebar
9. Click invoice link to view/print

### Test 3: Admin Booking with Stripe Payment

1. Login to admin portal
2. Go to "Create Booking" tab
3. Fill out all required information including email
4. Check "Process Stripe Payment" checkbox
5. Verify button text changes to "Create Booking & Process Payment"
6. Verify sidebar shows "Will redirect to Stripe payment"
7. Click button
8. Verify redirect to Stripe checkout page
9. Complete payment with test card
10. Verify redirect back to booking-success page
11. Verify invoice download/view buttons work
12. Navigate back to admin dashboard
13. Verify booking status is "active" and payment status is "paid"

### Test 4: Invoice PDF Quality

1. Generate an invoice (either method)
2. Download the PDF
3. Verify:
   - ✓ All text is readable and properly formatted
   - ✓ Colors match brand guidelines
   - ✓ No text overflow or clipping
   - ✓ Tables are properly aligned
   - ✓ Status badge displays correct color
   - ✓ Company logo/branding is clear
   - ✓ Footer is properly positioned
   - ✓ Print quality is professional

---

## Future Enhancements (Optional)

1. **Email Invoice:**
   - Add "Email Invoice" button on success page
   - Send PDF as attachment to customer email

2. **Invoice Customization:**
   - Allow admin to add logo image to invoice header
   - Customize bank transfer details via admin settings
   - Add company registration/VAT numbers

3. **Invoice Templates:**
   - Multiple invoice design templates
   - Admin can select preferred template
   - Save template preference per booking

4. **Batch Invoice Generation:**
   - Generate invoices for multiple bookings at once
   - Export invoices as ZIP file
   - Bulk email invoices to customers

5. **Invoice Reminders:**
   - Automatic email reminders for unpaid invoices
   - Schedule reminders (7 days before due, on due date, 7 days after)
   - Track reminder history

---

## Support & Troubleshooting

### Invoice Not Downloading?

**Possible Causes:**
- Browser blocking pop-ups/downloads
- Missing booking data
- jsPDF library not loaded

**Solution:**
1. Check browser console for errors
2. Verify jsPDF is imported correctly
3. Allow downloads/pop-ups for the site
4. Try "View Invoice" button instead

### Stripe Payment Not Working?

**Possible Causes:**
- Missing Stripe environment variables
- Invalid Stripe keys
- Webhook not configured

**Solution:**
1. Verify `.env.local` has correct Stripe keys
2. Check Stripe dashboard for webhook status
3. Review server logs for Stripe errors
4. Test with Stripe test cards

### Invoice Data Missing?

**Possible Causes:**
- Booking API endpoint failing
- Database permissions issue
- Booking items not created

**Solution:**
1. Check network tab for failed API calls
2. Verify booking exists in database
3. Check booking_items table for related items
4. Review server logs for SQL errors

---

## Security Considerations

1. **Admin Authentication:**
   - All admin endpoints require authentication
   - Role-based access control (admin role required)

2. **API Endpoints:**
   - Booking details API requires auth for admin endpoints
   - Customer booking data is only exposed to authenticated admins

3. **Stripe Security:**
   - Webhook signature verification enabled
   - Stripe keys stored in environment variables
   - Payment intent validation before updating booking

4. **Invoice Access:**
   - Invoices linked to bookings (requires booking ID)
   - No direct public access to invoice API endpoints
   - Admin authentication required for invoice management

---

## Conclusion

The new invoice generation and admin payment features provide:

✓ Professional, branded invoices for all bookings
✓ Seamless invoice download/view on booking success page
✓ Flexible admin booking creation with payment options
✓ Automatic invoice generation to save time
✓ Stripe payment processing for admin bookings
✓ Consistent user experience across all booking flows
✓ Professional design matching brand guidelines

These features significantly enhance the booking experience for both customers and administrators, providing professional invoicing and flexible payment processing options.
