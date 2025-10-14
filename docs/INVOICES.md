# Invoice Management System

## Overview
Professional invoice management system for Eleventh Hour Cleaning, fully integrated with the booking system. Features include automatic invoice numbering, professional print templates, and status tracking.

## Features
✅ Automatic invoice number generation (format: INV-YYYYMM-NNNN)
✅ Professional print-friendly invoice template matching site branding
✅ Invoice status management (draft, sent, paid, void)
✅ Automatic amount calculation from bookings
✅ Multiple invoices per booking support
✅ Invoice list view in booking editor
✅ Professional A4 print layout with company branding

## Database Setup

### Step 1: Run the SQL Migration
Run the migration file in your Supabase SQL Editor:

```bash
# The migration file is located at:
supabase-migration-invoices.sql
```

This will create:
- `invoices` table with auto-generated invoice numbers
- Indexes for performance
- Triggers for automatic numbering and timestamps
- Row Level Security policies

### Table Structure
```sql
invoices (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  invoice_number TEXT UNIQUE,          -- Auto-generated: INV-202510-0001
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GBP',
  status TEXT CHECK (status IN ('draft','sent','paid','void')),
  due_date DATE,
  issued_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## API Endpoints

### Create Invoice
```http
POST /api/admin/invoices
Content-Type: application/json

{
  "bookingId": "uuid",
  "amount": 150.00,        // Optional: auto-calculated from booking
  "currency": "GBP",       // Optional: defaults to GBP
  "due_date": "2025-10-28", // Optional
  "notes": "Payment terms..." // Optional
}

Response: { "id": "uuid", "invoice_number": "INV-202510-0001" }
```

### Get Invoices
```http
# Get all invoices
GET /api/admin/invoices

# Get invoices for specific booking
GET /api/admin/invoices?bookingId=uuid

Response: { "data": [...invoices] }
```

### Get Single Invoice
```http
GET /api/admin/invoices/[id]

Response: {
  "invoice": {...invoice with booking details},
  "items": [...booking items with service names]
}
```

### Update Invoice
```http
PATCH /api/admin/invoices/[id]
Content-Type: application/json

{ "status": "paid" }

Response: { "data": {...updated invoice} }
```

### Delete Invoice
```http
DELETE /api/admin/invoices/[id]

Response: { "ok": true }
```

## User Interface

### Booking Editor (`/admin/bookings/[id]`)
- "Create Invoice" button at the bottom of the page
- Lists all existing invoices for the booking in the right sidebar
- Click an invoice to view/print
- Automatically redirects to invoice page after creation

### Invoice Detail Page (`/admin/invoices/[id]`)
**Features:**
- Professional A4 print layout
- Company branding (Eleventh Hour Cleaning)
- Customer billing information
- Service items breakdown
- Subtotal, discount, and total calculation
- Payment terms and bank details
- Status management dropdown (draft/sent/paid/void)
- Print button with browser print dialog
- Links back to booking and dashboard

**Print Layout:**
- Optimized for A4 paper
- Professional typography matching site theme
- Brand colors (amber, charcoal, sage)
- Hidden UI controls when printing
- 1.5cm margins for standard printers

## How to Use

### Creating an Invoice
1. Navigate to a booking: `/admin/bookings/[id]`
2. Click "Create Invoice" button
3. System automatically:
   - Calculates amount from booking total (respects admin overrides)
   - Generates unique invoice number
   - Creates invoice in "draft" status
   - Redirects you to the invoice page

### Printing an Invoice
1. Open invoice: `/admin/invoices/[id]`
2. Click "Print Invoice" button
3. Browser print dialog opens
4. Select printer and confirm
5. Clean, professional A4 invoice prints

### Managing Invoice Status
1. Open invoice page
2. Use status dropdown at top (Draft/Sent/Paid/Void)
3. Status updates immediately
4. Color-coded status badges throughout UI

## Customization

### Update Company Information
Edit the invoice header in:
```
src/app/admin/invoices/[id]/page.tsx
```

Lines to customize:
- Company name (line ~165)
- Company address (line ~167-169)
- Email and phone (line ~170-171)
- Bank details (line ~295-298)
- Payment terms (line ~301-304)

### Update Branding Colors
All colors use the site theme defined in:
```
tailwind.config.ts
src/app/globals.css
```

Brand colors used:
- `brand-amber` (#E2852B) - Primary accent
- `brand-charcoal` (#2C2C2C) - Text
- `brand-cream` (#FAF9F5) - Backgrounds
- `brand-sage` (#D7E1C5) - Highlights

### Logo Integration
To add your logo:
1. Place logo file in `/public/` directory
2. Update invoice template line ~165:
```jsx
<img src="/el_logo.png" alt="Eleventh Hour Cleaning" className="h-16" />
```

## Troubleshooting

### Error: "Could not find table 'public.invoices'"
**Solution:** Run the SQL migration file in Supabase SQL Editor:
```sql
-- Run: supabase-migration-invoices.sql
```

### Invoice Number Not Generating
**Check:** Ensure the trigger is created in Supabase:
```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_generate_invoice_number';
```

### Print Layout Issues
- Ensure browser print settings are set to A4
- Check margins are set to default
- Disable "Headers and Footers" in print dialog
- Use "Save as PDF" to test layout

### Amount Not Calculating
The system uses this priority:
1. `admin_total_override` (if set in booking)
2. `total` (calculated total from booking)
3. Manual amount (if provided in API call)

## Future Enhancements

Possible additions:
- PDF generation and download
- Email invoice to customer
- Payment link integration (Stripe)
- Recurring invoice templates
- Invoice templates for different service types
- Multi-currency support
- Tax/VAT calculations
- Invoice reminders
- Batch invoicing

## Security

- All API routes use service role authentication
- RLS policies enabled on invoices table
- Invoice numbers are unique and sequential
- Soft delete option available (status: 'void')

## Testing

To test the invoice system:

1. Create a test booking
2. Add services and calculate total
3. Click "Create Invoice"
4. Verify invoice number generated
5. Test print functionality
6. Update status to "paid"
7. Verify status update in booking list

## Support

For issues or questions:
- Check Supabase logs for API errors
- Verify database migrations ran successfully
- Ensure service role key is configured
- Check browser console for client-side errors

