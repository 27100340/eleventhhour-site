# Nested Services Setup Guide

## Database Migration Steps

To enable the new nested services structure, you need to run the following SQL files in your Supabase SQL Editor **in this order**:

### 1. Run the Migration (Adds new columns)
File: `supabase-migration-nested-services.sql`

This adds the following columns to the `services` table:
- `parent_id` - For parent-child relationships
- `is_category` - Distinguishes categories from actual services
- `category_type` - Main category types (regular_cleaning, deep_cleaning, windows, gardening)
- `nesting_level` - Depth in hierarchy (0 = top level)
- `per_unit_type` - For special pricing (item, sqft, hour)

### 2. Seed the Data (Creates the service hierarchy)
File: `supabase-seed-nested-services.sql`

This creates your service structure:

#### Main Categories:
1. **Regular Cleaning**
   - 1 Bedroom Regular Clean
   - 2 Bedroom Regular Clean
   - 3 Bedroom Regular Clean
   - 4 Bedroom Regular Clean
   - Kitchen Clean
   - Bathroom Clean
   - Living Room Clean

2. **Deep Cleaning / End of Tenancy**
   - Bedroom
   - Bathroom
   - Toilets
   - Kitchen (category with sub-items)
     - Oven Deep Clean
     - Fridge Deep Clean
     - Dishwasher Clean
     - Microwave Deep Clean
   - Reception
   - Staircase
   - Study Room
   - Conservatory
   - Utility / Box Room
   - Extras (category with sub-items)
     - Carpet Deep Clean
     - Oven Deep Clean
     - Fridge Deep Clean
     - Washing Machine Clean
     - Dishwasher Clean
     - Microwave Deep Clean
     - Upholstery / Sofa Deep Clean
     - Mould Removal
     - Windows Inside

3. **Windows (Outside)**
   - Priced per square foot (£2.50/sqft)

4. **Gardening**
   - Weeding
   - Grass Cutting / Trimming
   - Garden Cleaning
   - Pressure Washing

## API Changes

### Services API
The `/api/public/services` endpoint now supports hierarchical data:

**Flat list (default):**
```
GET /api/public/services
```

**Hierarchical structure:**
```
GET /api/public/services?hierarchical=true
```

Returns services with nested `children` arrays.

## TypeScript Types Updated

The `Service` type now includes:
- `parent_id?: string | null`
- `is_category?: boolean`
- `category_type?: 'regular_cleaning' | 'deep_cleaning' | 'windows' | 'gardening' | null`
- `nesting_level?: number`
- `per_unit_type?: 'item' | 'sqft' | 'hour'`
- `children?: Service[]`

## Next Steps

1. Run both SQL files in Supabase
2. Test the API endpoints
3. The booking form will be updated to show the new category-based UI
4. Admin panel will be updated for drag-and-drop nested service management
