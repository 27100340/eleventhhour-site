# Discount Codes Feature Documentation

## Overview

A complete discount codes management system has been implemented, allowing admins to create promotional codes that customers can apply during the booking process to receive discounts.

## Features Implemented

### 1. Database Schema
**File:** `supabase-migration-discount-codes.sql`

Created a `discount_codes` table with the following features:
- **Code Management:** Unique discount codes (auto-converted to uppercase)
- **Discount Types:**
  - **Percentage:** X% off (e.g., 10% off)
  - **Fixed Amount:** £X off (e.g., £20 off)
- **Restrictions:**
  - Minimum order amount requirement
  - Maximum discount cap (for percentage discounts)
  - Usage limits (total number of times code can be used)
  - Date validity (valid from/until dates)
- **Tracking:**
  - Times used counter
  - Active/inactive status
  - Created and updated timestamps

**Table Structure:**
```sql
discount_codes (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE,           -- e.g., "SAVE20", "WELCOME10"
  description TEXT,                   -- Optional description
  discount_type VARCHAR(20),          -- 'percentage' or 'fixed'
  discount_value DECIMAL(10, 2),      -- 10 for 10% or £10
  min_order_amount DECIMAL(10, 2),    -- Minimum order required
  max_discount_amount DECIMAL(10, 2), -- Cap for percentage discounts
  usage_limit INTEGER,                -- Max uses (NULL = unlimited)
  times_used INTEGER DEFAULT 0,       -- Current usage count
  valid_from TIMESTAMPTZ,             -- Start date
  valid_until TIMESTAMPTZ,            -- End date (NULL = no expiry)
  active BOOLEAN DEFAULT true,        -- Enable/disable code
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### 2. Admin API Routes

**Created Files:**
- `src/app/api/admin/discount-codes/route.ts` - List and create codes
- `src/app/api/admin/discount-codes/[id]/route.ts` - Get, update, delete codes

**Endpoints:**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/discount-codes` | List all discount codes | Admin |
| POST | `/api/admin/discount-codes` | Create new discount code | Admin |
| GET | `/api/admin/discount-codes/[id]` | Get single discount code | Admin |
| PUT | `/api/admin/discount-codes/[id]` | Update discount code | Admin |
| DELETE | `/api/admin/discount-codes/[id]` | Delete discount code | Admin |

**Features:**
- Admin authentication check
- Automatic code normalization (uppercase)
- Duplicate code prevention
- Validation of required fields

### 3. Public Validation API

**File:** `src/app/api/public/validate-discount/route.ts`

**Endpoint:** `POST /api/public/validate-discount`

**Request Body:**
```json
{
  "code": "SAVE20",
  "orderAmount": 150.00
}
```

**Response (Success):**
```json
{
  "valid": true,
  "code": "SAVE20",
  "description": "£20 off orders over £100",
  "discount_type": "fixed",
  "discount_value": 20,
  "discount_amount": 20.00,
  "min_order_amount": 100,
  "max_discount_amount": null
}
```

**Response (Error):**
```json
{
  "valid": false,
  "error": "This discount code has expired"
}
```

**Validation Checks:**
1. Code exists and is active
2. Current date is within valid date range
3. Usage limit not exceeded
4. Order meets minimum amount requirement
5. Calculates actual discount amount with caps

### 4. Admin Dashboard Tab

**File:** `src/components/admin/DiscountCodesTab.tsx`

**Features:**

#### Stats Dashboard
- **Total Codes:** All discount codes
- **Active Codes:** Currently valid and active codes
- **Total Uses:** Sum of all code usages
- **Expiring Soon:** Codes expiring within 7 days

#### Codes Table
Displays all codes with:
- Code name (with inactive badge if disabled)
- Description
- Discount value (formatted as % or £)
- Usage stats (used / limit)
- Valid until date (with expired indicator)
- Status badge (Active/Inactive)
- Edit and delete actions

#### Create/Edit Modal
Comprehensive form with:
- **Code Input:** Auto-converts to uppercase
- **Description:** Optional promotional text
- **Discount Type:** Percentage or Fixed amount dropdown
- **Discount Value:** Numeric input
- **Min Order Amount:** Optional minimum
- **Max Discount Amount:** Cap for percentage discounts
- **Usage Limit:** Max uses (leave empty for unlimited)
- **Valid From:** Start date/time
- **Valid Until:** End date/time (optional)
- **Active Status:** Enable/disable checkbox

#### Visual Indicators
- Color-coded status badges
- Usage progress tracking
- Expiry warnings
- Limit reached notifications

### 5. Customer Booking Form Integration

**File:** `src/app/book/page.tsx`

**Features:**

#### Discount Code Input Section
Located in Step 2 of booking form, after service selection:

**Before Applying:**
- Input field (auto-uppercase)
- "Apply" button with loading state
- Placeholder text: "Enter code (e.g., SAVE20)"

**After Applying Successfully:**
- Green success box with checkmark icon
- Code name displayed prominently
- Description (if available)
- Savings amount highlighted
- Remove button (X icon)

**Error States:**
- Red error box with clear error message
- Examples:
  - "Invalid discount code"
  - "This discount code has expired"
  - "Minimum order amount of £100.00 required"
  - "This discount code has reached its usage limit"

#### Booking Summary Sidebar Updates
Shows discount breakdown:
- **Subtotal:** Original price
- **Discount (CODE):** Amount saved in green
- **Estimated Time:** Service duration
- **Total:** Final price after discount
- **Savings Badge:** "You're saving £X.XX!" in green box

#### Payment Integration
- Discount amount passed to Stripe checkout
- Booking database stores discount value
- Email notification includes discount information
- Invoice generation includes discount line item

---

## How It Works

### Admin Workflow

1. **Create Discount Code:**
   ```
   Admin Dashboard → Discount Codes tab → Create Discount Code button
   ```

2. **Fill Form:**
   - Enter code (e.g., "SUMMER25")
   - Choose type (percentage or fixed)
   - Set discount value (e.g., 25 for 25%)
   - Optionally set minimum order, max discount, usage limit, dates
   - Mark as active
   - Save

3. **Share Code:**
   - Code is immediately available for customer use
   - Share code via email, social media, website banner, etc.

4. **Monitor Usage:**
   - View times used in admin dashboard
   - Track when limit is reached
   - See expiry dates
   - Edit or deactivate codes as needed

### Customer Workflow

1. **Start Booking:**
   ```
   Customer fills booking form → Selects services
   ```

2. **Apply Discount:**
   - Sees "Have a discount code?" section
   - Enters code (e.g., "SAVE20")
   - Clicks "Apply"
   - System validates code in real-time

3. **See Results:**
   - **Valid:** Green success message with savings amount
   - **Invalid:** Red error message explaining why
   - Sidebar updates to show discounted total

4. **Complete Booking:**
   - Proceeds to payment with discounted price
   - Stripe checkout shows final amount
   - Booking record includes discount details

---

## Discount Types Explained

### Percentage Discount
**Example:** 10% off

**Settings:**
- `discount_type`: "percentage"
- `discount_value`: 10
- `min_order_amount`: 0 (optional)
- `max_discount_amount`: 50 (optional cap)

**Calculation:**
```
Order: £200
Discount: £200 × 10% = £20
Final: £180

With cap of £50:
Order: £600
Discount: £600 × 10% = £60 → capped at £50
Final: £550
```

### Fixed Amount Discount
**Example:** £20 off

**Settings:**
- `discount_type`: "fixed"
- `discount_value`: 20
- `min_order_amount`: 100 (optional)

**Calculation:**
```
Order: £150
Discount: £20
Final: £130

If order < min_order_amount:
Order: £80
Error: "Minimum order amount of £100.00 required"
```

---

## Sample Discount Codes

The migration includes sample codes for testing:

### WELCOME10
- **Type:** Percentage
- **Value:** 10% off
- **Min Order:** None
- **Usage Limit:** 100 uses
- **Valid:** 90 days from creation
- **Description:** "10% off for new customers"

### SAVE20
- **Type:** Fixed Amount
- **Value:** £20 off
- **Min Order:** £100
- **Usage Limit:** 50 uses
- **Valid:** 60 days from creation
- **Description:** "£20 off orders over £100"

### SPRING25
- **Type:** Percentage
- **Value:** 25% off
- **Min Order:** £50
- **Usage Limit:** Unlimited
- **Valid:** 30 days from creation
- **Description:** "25% off Spring Cleaning"

---

## Testing Guide

### Setup
1. Run the SQL migration in Supabase SQL Editor:
   ```bash
   # Execute: supabase-migration-discount-codes.sql
   ```

2. Verify table created:
   ```sql
   SELECT * FROM discount_codes;
   ```

3. Check sample codes are present

### Test Admin Dashboard

1. **Access Admin Portal:**
   - Navigate to `/admin/dashboard`
   - Login as admin
   - Click "Discount Codes" tab

2. **View Stats:**
   - Verify stats cards display correct numbers
   - Check "Total Codes" shows 3 (sample codes)
   - Verify "Active Codes" count

3. **Create New Code:**
   - Click "Create Discount Code"
   - Fill form:
     - Code: TEST10
     - Type: Percentage
     - Value: 10
     - Min Order: 50
     - Usage Limit: 10
     - Valid Until: 30 days from now
   - Click "Create Code"
   - Verify code appears in table

4. **Edit Code:**
   - Click edit icon on TEST10
   - Change discount value to 15
   - Click "Update Code"
   - Verify changes saved

5. **Delete Code:**
   - Click delete icon
   - Confirm deletion
   - Verify code removed from table

### Test Customer Booking

1. **Start Booking:**
   - Navigate to `/book`
   - Fill Step 1 (contact info)
   - Continue to Step 2

2. **Select Services:**
   - Add services totaling > £50 (for WELCOME10 test)
   - Verify subtotal displays correctly

3. **Test Valid Code:**
   - Scroll to "Have a discount code?" section
   - Enter: WELCOME10
   - Click "Apply"
   - **Expected:**
     - Green success box appears
     - Shows "WELCOME10 Applied!"
     - Shows savings amount
     - Sidebar updates with discount line
     - Total is reduced by 10%

4. **Test Invalid Code:**
   - Remove current discount
   - Enter: INVALID123
   - Click "Apply"
   - **Expected:**
     - Red error box appears
     - Message: "Invalid discount code"
     - No discount applied

5. **Test Minimum Order:**
   - Remove all services, add only small service (< £50)
   - Try code: SPRING25
   - **Expected:**
     - Error: "Minimum order amount of £50.00 required"

6. **Test Expired Code:**
   - Create expired code in admin (valid_until in past)
   - Try to apply
   - **Expected:**
     - Error: "This discount code has expired"

7. **Test Usage Limit:**
   - Create code with usage_limit: 1
   - Use it once successfully
   - Try to use again
   - **Expected:**
     - Error: "This discount code has reached its usage limit"

8. **Complete Payment:**
   - Apply valid code
   - Click "Proceed to Payment"
   - Verify Stripe checkout shows discounted amount
   - Complete payment
   - Verify booking record has discount value

### Test Edge Cases

1. **Case Sensitivity:**
   - Enter code in lowercase: "welcome10"
   - Should auto-convert to uppercase and work

2. **Whitespace:**
   - Enter code with spaces: " WELCOME10 "
   - Should trim and work correctly

3. **No Services:**
   - Try to apply code before selecting services
   - Should show error: "Please select services first"

4. **Maximum Discount Cap:**
   - Create 50% off code with £20 max
   - Order £100 item
   - Discount should be £20 (not £50)

5. **Remove and Reapply:**
   - Apply code
   - Remove it (X button)
   - Reapply same code
   - Should work both times

---

## API Examples

### Create Discount Code (Admin)
```javascript
const response = await fetch('/api/admin/discount-codes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'SUMMER25',
    description: 'Summer sale - 25% off',
    discount_type: 'percentage',
    discount_value: 25,
    min_order_amount: 50,
    max_discount_amount: 100,
    usage_limit: 100,
    valid_from: new Date().toISOString(),
    valid_until: new Date('2025-08-31').toISOString(),
    active: true
  })
})
```

### Validate Discount Code (Public)
```javascript
const response = await fetch('/api/public/validate-discount', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'SAVE20',
    orderAmount: 150.00
  })
})

const data = await response.json()
if (data.valid) {
  console.log('Discount:', data.discount_amount)
} else {
  console.error('Error:', data.error)
}
```

### Update Discount Code (Admin)
```javascript
const response = await fetch(`/api/admin/discount-codes/${codeId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    active: false  // Deactivate code
  })
})
```

---

## Security Considerations

1. **Admin Authentication:**
   - All admin endpoints require authentication
   - Role-based access control enforced
   - Only admins can create/edit/delete codes

2. **Code Validation:**
   - Prevents duplicate codes (unique constraint)
   - Case-insensitive validation
   - Whitespace trimming

3. **Rate Limiting:**
   - Consider implementing rate limiting on validation endpoint
   - Prevent brute-force code guessing

4. **Database Security:**
   - Row-level security (RLS) policies enabled
   - Public can only read active codes
   - Admins have full CRUD access

5. **Usage Tracking:**
   - Times_used counter prevents over-use
   - Usage limit enforcement
   - Atomic increment operations

---

## Customization Options

### Email Notifications
Add discount code to confirmation emails:
```javascript
// In booking confirmation email template
if (booking.discount > 0) {
  emailBody += `\nDiscount Applied: £${booking.discount.toFixed(2)}`
}
```

### Analytics Tracking
Track discount code performance:
```javascript
// Add to admin analytics
const popularCodes = await supabase
  .from('discount_codes')
  .select('code, times_used, discount_value')
  .order('times_used', { ascending: false })
  .limit(10)
```

### Auto-Apply Codes
Allow URL parameters to auto-apply codes:
```javascript
// In booking form
const searchParams = new URLSearchParams(window.location.search)
const urlCode = searchParams.get('discount')
if (urlCode) {
  setDiscountCode(urlCode)
  validateDiscountCode()
}

// Usage: /book?discount=SAVE20
```

### Bulk Code Generation
Create multiple codes at once:
```javascript
// Generate codes like XMAS001, XMAS002, etc.
for (let i = 1; i <= 100; i++) {
  const code = `XMAS${i.toString().padStart(3, '0')}`
  // Create discount code
}
```

---

## Troubleshooting

### Code not validating
- Check code is active in database
- Verify valid_from/valid_until dates
- Check usage_limit not exceeded
- Ensure minimum order amount is met

### Discount not applying to total
- Verify discount calculation logic
- Check total is being passed to Stripe correctly
- Ensure booking database stores discount value

### Admin can't see tab
- Verify admin role in user metadata
- Check authentication token is valid
- Ensure DiscountCodesTab imported correctly

### Database errors
- Run migration SQL again
- Check RLS policies are enabled
- Verify Supabase connection

---

## Future Enhancements

1. **Customer-Specific Codes:**
   - Link codes to specific customer emails
   - One-time use per customer

2. **Product-Specific Codes:**
   - Restrict codes to specific services
   - Category-based discounts

3. **Automatic Codes:**
   - Auto-apply best discount
   - Smart code recommendations

4. **Code Analytics:**
   - Revenue impact tracking
   - Conversion rate analysis
   - Popular code reports

5. **Multi-Use Codes:**
   - Track individual uses
   - Customer history

6. **Tiered Discounts:**
   - Progressive discounts (spend more, save more)
   - Bundle discounts

7. **Referral Codes:**
   - Give referrer and referee discounts
   - Track referral chains

---

## Summary

A complete discount code system has been implemented with:

✅ Database schema with comprehensive validation rules
✅ Admin dashboard tab for code management
✅ Real-time code validation API
✅ Customer-facing discount input with feedback
✅ Integration with booking and payment flows
✅ Usage tracking and limits
✅ Date-based validity
✅ Percentage and fixed discounts
✅ Minimum order requirements
✅ Maximum discount caps

The system is production-ready and fully integrated with the existing booking flow. Admins can create codes immediately and customers can start using them right away.

---

**Implementation Date:** October 2025
**Version:** 1.0
**Status:** Production Ready
