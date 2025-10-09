# Admin Booking System

## Overview
This document outlines the admin booking creation and management system that allows administrators to create manual bookings, track payment status, and manage draft bookings.

## Features Implemented

### 1. Manual Booking Creation
Administrators can now create bookings manually through the admin portal.

**Location:** Admin Dashboard > Create Booking tab

**Features:**
- Create draft bookings without payment
- Full customer information form
- Service selection with all question types (plus/minus, checkbox, dropdown)
- Apply custom discounts
- Add notes and special instructions
- Real-time booking summary with totals
- Automatic redirect to booking detail page after creation

**Booking Status:**
- **Draft**: Initial status for admin-created bookings
- **Active**: Confirmed booking ready for scheduling
- **Completed**: Service has been delivered
- **Cancelled**: Booking was cancelled

### 2. Payment Status Tracking
All bookings now track payment status independently of booking status.

**Payment Statuses:**
- **Pending**: Payment not yet received (default for admin bookings)
- **Paid**: Payment received and confirmed
- **Failed**: Payment attempt failed
- **Refunded**: Payment was refunded to customer

### 3. Quick Payment Confirmation
Special quick action buttons for draft bookings with pending payment.

**Actions Available:**
- **Mark as Paid & Activate**: Sets payment to "paid" and booking to "active" in one click
- **Activate (Keep Payment Pending)**: Activates booking without confirming payment

### 4. Enhanced Booking Management

**Booking Detail Page Updates:**
- Payment status dropdown (separate from booking status)
- Source indicator (Web/Admin)
- Payment status badges in booking list
- Quick action buttons for draft bookings
- Better organized status and payment section

**Bookings List Updates:**
- New "Payment" column with color-coded badges
- Source indicator for admin-created bookings
- Enhanced filtering options

## Usage Guide

### Creating a Manual Booking

1. **Navigate to Admin Dashboard**
   - Log in to admin portal
   - Click "Create Booking" tab

2. **Enter Customer Information**
   - First Name* (required)
   - Last Name* (required)
   - Email
   - Phone* (required)

3. **Add Service Location**
   - Address
   - City
   - Postcode

4. **Configure Service Details**
   - Service Date & Time
   - Frequency (One Time, Weekly, Bi-Weekly, Monthly)
   - Arrival Window (Exact, Morning, Afternoon)
   - Discount amount (£)

5. **Select Services**
   - Choose from available services
   - Question types render automatically:
     - **Plus/Minus**: Adjust quantity with +/- buttons
     - **Checkbox**: Simple yes/no selection
     - **Dropdown**: Select from predefined options

6. **Add Notes** (optional)
   - Special instructions
   - Customer preferences
   - Internal notes

7. **Create Booking**
   - Review summary sidebar
   - Click "Create Draft Booking"
   - Automatically redirected to booking detail page

### Managing Draft Bookings

#### Confirming Payment for Draft Booking

**Method 1: Quick Actions (Recommended)**
1. Open the draft booking
2. In "Status & Payment" section, you'll see quick action buttons
3. Click "Mark as Paid & Activate" to confirm payment and activate booking

**Method 2: Manual Status Update**
1. Open the draft booking
2. Change "Payment Status" to "Paid"
3. Change "Booking Status" to "Active"
4. Click "Save"

#### Activating Without Payment
Useful for bookings where payment will be collected later:
1. Open the draft booking
2. Click "Activate (Keep Payment Pending)"
3. Or manually change "Booking Status" to "Active"
4. Click "Save"

### Viewing Bookings with Payment Status

**In Bookings List:**
- Payment status shown with color-coded badges:
  - **Yellow**: Pending
  - **Green**: Paid
  - **Red**: Failed
  - **Gray**: Refunded
- Admin-created bookings show "(Admin)" label
- Filter by booking status (Draft, Active, Cancelled, Completed)

**In Booking Detail:**
- View payment status in "Status & Payment" section
- See booking source (Web or Admin)
- Quick actions available for draft/pending bookings

## Workflow Examples

### Example 1: Phone Booking with Immediate Payment
```
1. Customer calls to book service
2. Admin creates booking through "Create Booking" tab
3. Customer provides payment over phone
4. Admin opens booking and clicks "Mark as Paid & Activate"
5. Booking is now active and paid
```

### Example 2: Quote/Estimate Booking
```
1. Customer requests quote
2. Admin creates draft booking with services
3. Booking remains in "Draft" status with "Pending" payment
4. Send quote to customer
5. When customer confirms:
   - Receive payment
   - Mark as "Paid & Activate"
6. Schedule service delivery
```

### Example 3: Cash on Delivery
```
1. Customer books service, will pay cash on delivery
2. Admin creates booking
3. Click "Activate (Keep Payment Pending)"
4. Booking is "Active" but payment is still "Pending"
5. After service delivery and payment collection:
   - Change payment status to "Paid"
   - Change booking status to "Completed"
```

## Database Schema Changes

### Required Migration
The `payment_status` field should already exist if you ran the Stripe migration. If not, run:

```sql
-- Add payment_status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
    ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Add index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
```

## Files Modified/Created

### New Files:
1. `src/components/admin/CreateBookingTab.tsx` - Manual booking creation interface

### Modified Files:
1. `src/lib/types.ts` - Added payment_status to Booking type
2. `src/app/admin/dashboard/page.tsx` - Added "Create Booking" tab
3. `src/app/admin/bookings/[id]/page.tsx` - Added payment status management
4. `src/components/admin/BookingsTab.tsx` - Added payment status display
5. `ADMIN_BOOKING_SYSTEM.md` - This documentation file

## API Endpoints Used

The system uses existing Supabase direct client calls:
- `supabase.from('bookings').insert()` - Create booking
- `supabase.from('booking_items').insert()` - Create booking items
- `supabase.from('bookings').update()` - Update booking status/payment

## Best Practices

### When to Use Draft Status
- Taking phone orders
- Creating quotes/estimates
- Pre-scheduling future bookings
- Bookings pending customer confirmation

### When to Use Different Payment Statuses
- **Pending**: Default for new admin bookings, payment not collected
- **Paid**: Payment confirmed (card, cash, bank transfer)
- **Failed**: Payment attempt failed (for web bookings)
- **Refunded**: Service cancelled and payment returned

### Booking Status vs Payment Status
These are independent:
- Booking can be "Active" with "Pending" payment (pay on delivery)
- Booking can be "Draft" with "Paid" payment (prepaid quote)
- Usually: Active = Paid, Draft = Pending

### Notes Field Usage
Add useful information like:
- Special customer requests
- Access instructions
- Parking information
- Equipment requirements
- Follow-up actions needed

## Troubleshooting

### Booking not appearing in list
- Check status filter (may be showing only "Active" bookings)
- Refresh the page
- Verify booking was created successfully

### Cannot activate draft booking
- Ensure at least one service is selected
- Check that required customer fields are filled
- Save changes before activating

### Payment status not updating
- Click "Save" after changing status
- Check for error messages
- Verify admin permissions

## Future Enhancements

Potential improvements:
- Email notifications when booking status changes
- SMS notifications for customers
- Payment integration for admin bookings
- Recurring booking automation
- Customer portal for booking management
- Invoice generation
- Receipt generation and emailing

## Support

For questions or issues:
1. Check this documentation
2. Review the codebase
3. Check Supabase logs for errors
4. Contact development team
