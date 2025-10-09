-- Add service ordering and question type configuration
-- Run this in your Supabase SQL Editor

-- Add order_index column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'services' AND column_name = 'order_index') THEN
    ALTER TABLE services ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add question_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'services' AND column_name = 'question_type') THEN
    ALTER TABLE services ADD COLUMN question_type TEXT DEFAULT 'plus_minus';
  END IF;
END $$;

-- Add dropdown_options column if it doesn't exist (JSONB for flexibility)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'services' AND column_name = 'dropdown_options') THEN
    ALTER TABLE services ADD COLUMN dropdown_options JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Set initial order_index values based on current order
UPDATE services SET order_index = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM services
) AS subquery
WHERE services.id = subquery.id AND services.order_index = 0;

-- Add index on order_index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_services_order_index ON services(order_index);

-- Add comments for documentation
COMMENT ON COLUMN services.order_index IS 'Display order in booking form (lower numbers appear first)';
COMMENT ON COLUMN services.question_type IS 'Type of question input: plus_minus, checkbox, dropdown';
COMMENT ON COLUMN services.dropdown_options IS 'Array of options for dropdown type questions: [{label: string, value: string}]';
