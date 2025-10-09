# Booking System Updates

## Overview
This document outlines all the changes made to the booking system to support custom service ordering, configurable question types, improved UI, and terms acceptance.

## Changes Made

### 1. Database Schema Updates
**File:** `supabase-migration-service-ordering.sql`

Added three new columns to the `services` table:
- `order_index` (INTEGER): Controls the display order of services in the booking form
- `question_type` (TEXT): Defines how the service question is presented ('plus_minus', 'checkbox', 'dropdown')
- `dropdown_options` (JSONB): Stores dropdown options as an array of `{label, value}` objects

**To apply:** Run this SQL migration in your Supabase SQL Editor.

### 2. TypeScript Type Updates
**File:** `src/lib/types.ts`

Updated the `Service` type to include:
```typescript
order_index: number
question_type: 'plus_minus' | 'checkbox' | 'dropdown'
dropdown_options: { label: string; value: string | number }[]
```

### 3. API Route Updates
**File:** `src/app/api/public/services/route.ts`

- Updated to select new fields (`order_index`, `question_type`, `dropdown_options`)
- Changed ordering from `name` to `order_index` to respect custom service order

### 4. Admin Services Tab (Complete Rewrite)
**File:** `src/components/admin/ServicesTab.tsx`

**New Features:**
- **Drag-and-drop ordering**: Reorder services by dragging them
- **Question type selector**: Choose between:
  - Plus/Minus (Quantity input with +/- buttons)
  - Checkbox (Yes/No selection)
  - Dropdown (Custom options)
- **Dropdown options manager**: Add/remove dropdown options with labels and values
- **Visual feedback**: Shows question type in service list
- **Real-time updates**: Order changes save immediately to database

### 5. Booking Page Updates
**File:** `src/app/book/page.tsx`

**Major Changes:**

#### A. Service Display (Step 2)
- **Removed price and time from individual service cards** - now only shows service names
- **Dynamic question rendering** based on `question_type`:
  - **Plus/Minus**: Shows quantity input with +/- buttons
  - **Checkbox**: Shows single checkbox for yes/no selection
  - **Dropdown**: Shows dropdown with custom options
- Services now ordered by `order_index` instead of alphabetically

#### B. Booking Summary Sidebar
- **Removed individual service prices** - only shows time duration per service
- **Shows total price only at the bottom** - keeps pricing simple
- **Time display per service**: Shows "X min" for each selected service
- Label shows "Selected" for checkbox-type services instead of quantity

#### C. Terms & Services Acceptance
- **New required checkbox** placed BEFORE the services section
- Links to `/terms` page (opens in new tab)
- Marked as required with red asterisk
- Validated on form submission

### 6. Terms and Services Page
**File:** `src/app/terms/page.tsx`

New page at `/terms` with:
- Professional layout with proper typography
- Comprehensive terms covering:
  - Service Agreement
  - Booking and Payment
  - Cancellation Policy
  - Service Delivery
  - Customer Responsibilities
  - Satisfaction Guarantee
  - Liability
  - Data Protection
  - Contact Information
- Responsive design matching site aesthetics

## How to Use

### Setting Up Services (Admin)

1. **Navigate to Admin > Services tab**
2. **Create/Edit Services:**
   - Enter name, price, and time
   - Select question type:
     - **Plus/Minus**: For quantity-based services (e.g., "Number of Bedrooms")
     - **Checkbox**: For yes/no services (e.g., "Inside Windows")
     - **Dropdown**: For option-based services (e.g., "Property Type")
   - If dropdown: Add options (label + value pairs)
   - Set as Active/Hidden

3. **Reorder Services:**
   - Drag and drop services in the list
   - Order saves automatically
   - This order appears in the booking form

### Customer Booking Flow

1. **Step 1**: Enter contact information
2. **Step 2**:
   - Accept Terms & Services (required)
   - Fill in address and service details
   - Answer service questions (format based on admin configuration)
   - View live summary with time estimates
3. **Proceed to Payment**: Only total price shown at end

### Question Type Examples

**Plus/Minus (Quantity):**
```
[ - ] [ 2 ] [ + ] Number of Bedrooms
```

**Checkbox (Yes/No):**
```
[✓] Include inside windows
```

**Dropdown (Options):**
```
Property Type: [Select...]
  - Studio Flat
  - 1-Bedroom Apartment
  - 2-Bedroom House
  - 3+ Bedroom House
```

## Migration Steps

1. **Run the SQL migration:**
   - Open Supabase SQL Editor
   - Run `supabase-migration-service-ordering.sql`

2. **Deploy code changes:**
   - All TypeScript files have been updated
   - No environment variable changes needed

3. **Configure existing services:**
   - Go to Admin > Services
   - Edit each service to set question type
   - Reorder services as desired

4. **Test the booking flow:**
   - Visit `/book` and test different question types
   - Verify terms checkbox is required
   - Check summary shows only time (not prices per service)

## Technical Notes

- Services are ordered by `order_index` (ascending)
- Checkbox services store `1` for checked, `0` for unchecked
- Dropdown services store the selected value (string or number)
- Plus/minus services store the quantity (number)
- All question types calculate time/price the same way (qty × unit values)
- Terms acceptance is validated before payment processing

## Files Modified

1. `supabase-migration-service-ordering.sql` (new)
2. `src/lib/types.ts`
3. `src/app/api/public/services/route.ts`
4. `src/components/admin/ServicesTab.tsx`
5. `src/app/book/page.tsx`
6. `src/app/terms/page.tsx` (new)
7. `BOOKING_UPDATES.md` (this file)

## Support

For questions or issues, refer to the codebase or contact the development team.
