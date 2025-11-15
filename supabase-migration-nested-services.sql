-- Add nested/hierarchical services structure
-- Run this in your Supabase SQL Editor

-- Add parent_id column for hierarchical structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'services' AND column_name = 'parent_id') THEN
    ALTER TABLE services ADD COLUMN parent_id UUID REFERENCES services(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add is_category column to distinguish between categories and actual services
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'services' AND column_name = 'is_category') THEN
    ALTER TABLE services ADD COLUMN is_category BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add category_type column for main category types (regular_cleaning, deep_cleaning, windows, gardening)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'services' AND column_name = 'category_type') THEN
    ALTER TABLE services ADD COLUMN category_type TEXT;
  END IF;
END $$;

-- Add nesting_level for easier querying
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'services' AND column_name = 'nesting_level') THEN
    ALTER TABLE services ADD COLUMN nesting_level INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add per_unit_type for special pricing (e.g., per sqft for windows)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'services' AND column_name = 'per_unit_type') THEN
    ALTER TABLE services ADD COLUMN per_unit_type TEXT DEFAULT 'item'; -- 'item', 'sqft', 'hour', etc.
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_parent_id ON services(parent_id);
CREATE INDEX IF NOT EXISTS idx_services_category_type ON services(category_type);
CREATE INDEX IF NOT EXISTS idx_services_is_category ON services(is_category);

-- Add comments for documentation
COMMENT ON COLUMN services.parent_id IS 'Parent service ID for nested structure (NULL for top-level)';
COMMENT ON COLUMN services.is_category IS 'True if this is a category/folder, false if actual service';
COMMENT ON COLUMN services.category_type IS 'Main category type: regular_cleaning, deep_cleaning, windows, gardening';
COMMENT ON COLUMN services.nesting_level IS 'Depth level in hierarchy (0 = top level, 1 = first child, etc.)';
COMMENT ON COLUMN services.per_unit_type IS 'Unit type for pricing: item, sqft, hour, etc.';
