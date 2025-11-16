-- Add description column to services table
-- Run this in your Supabase SQL Editor

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'services' AND column_name = 'description') THEN
    ALTER TABLE services ADD COLUMN description TEXT DEFAULT NULL;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN services.description IS 'Service description displayed to customers in booking form';
