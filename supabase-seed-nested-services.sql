-- Seed nested services structure based on business requirements
-- Run this AFTER running supabase-migration-nested-services.sql
-- This will create the hierarchical service structure

-- IMPORTANT: This will clear existing services and create new ones
-- Backup your data before running if needed

-- Clear existing services (optional - remove this if you want to keep existing data)
-- TRUNCATE services CASCADE;

-- Insert main categories first
INSERT INTO services (id, name, price, time_minutes, active, order_index, question_type, is_category, category_type, nesting_level)
VALUES
  -- Main Category 1: Regular Cleaning
  (gen_random_uuid(), 'Regular Cleaning', 0, 0, true, 1, 'plus_minus', true, 'regular_cleaning', 0),

  -- Main Category 2: Deep Cleaning / End of Tenancy
  (gen_random_uuid(), 'Deep Cleaning / End of Tenancy', 0, 0, true, 2, 'plus_minus', true, 'deep_cleaning', 0)
ON CONFLICT DO NOTHING;

-- Get IDs for reference (in actual implementation, you'd use the UUIDs returned above)
-- For Deep Cleaning category, we'll add sub-services

-- Deep Cleaning Sub-services (Level 1)
WITH deep_cleaning_cat AS (
  SELECT id FROM services WHERE name = 'Deep Cleaning / End of Tenancy' AND is_category = true LIMIT 1
)
INSERT INTO services (id, name, price, time_minutes, active, order_index, question_type, is_category, category_type, nesting_level, parent_id)
SELECT
  gen_random_uuid(),
  name,
  price,
  time_minutes,
  true,
  order_index,
  'plus_minus',
  is_category,
  'deep_cleaning',
  1,
  (SELECT id FROM deep_cleaning_cat)
FROM (VALUES
  ('Bedroom', 80, 120, 1, false),
  ('Bathroom', 70, 90, 2, false),
  ('Toilets', 40, 45, 3, false),
  ('Kitchen', 90, 120, 4, true), -- This is a category with sub-items
  ('Reception', 60, 90, 5, false),
  ('Staircase', 50, 60, 6, false),
  ('Study Room', 60, 90, 7, false),
  ('Conservatory', 70, 90, 8, false),
  ('Utility / Box Room', 50, 60, 9, false),
  ('Extras', 0, 0, 10, true) -- This is a category with sub-items
) AS t(name, price, time_minutes, order_index, is_category)
ON CONFLICT DO NOTHING;

-- Kitchen Sub-items (Level 2)
WITH kitchen_cat AS (
  SELECT id FROM services WHERE name = 'Kitchen' AND parent_id IS NOT NULL LIMIT 1
)
INSERT INTO services (id, name, price, time_minutes, active, order_index, question_type, is_category, category_type, nesting_level, parent_id)
SELECT
  gen_random_uuid(),
  name,
  price,
  time_minutes,
  true,
  order_index,
  'checkbox',
  false,
  'deep_cleaning',
  2,
  (SELECT id FROM kitchen_cat)
FROM (VALUES
  ('Oven Deep Clean', 45, 60, 1),
  ('Fridge Deep Clean', 35, 45, 2),
  ('Dishwasher Clean', 25, 30, 3),
  ('Microwave Deep Clean', 15, 15, 4)
) AS t(name, price, time_minutes, order_index)
WHERE (SELECT id FROM kitchen_cat) IS NOT NULL
ON CONFLICT DO NOTHING;

-- Extras Sub-items (Level 2)
WITH extras_cat AS (
  SELECT id FROM services WHERE name = 'Extras' AND parent_id IS NOT NULL LIMIT 1
)
INSERT INTO services (id, name, price, time_minutes, active, order_index, question_type, is_category, category_type, nesting_level, parent_id)
SELECT
  gen_random_uuid(),
  name,
  price,
  time_minutes,
  true,
  order_index,
  'checkbox',
  false,
  'deep_cleaning',
  2,
  (SELECT id FROM extras_cat)
FROM (VALUES
  ('Carpet Deep Clean', 60, 90, 1),
  ('Oven Deep Clean', 45, 60, 2),
  ('Fridge Deep Clean', 35, 45, 3),
  ('Washing Machine Clean', 30, 40, 4),
  ('Dishwasher Clean', 25, 30, 5),
  ('Microwave Deep Clean', 15, 15, 6),
  ('Upholstery / Sofa Deep Clean', 80, 120, 7),
  ('Mould Removal', 70, 90, 8),
  ('Windows Inside', 50, 60, 9)
) AS t(name, price, time_minutes, order_index)
WHERE (SELECT id FROM extras_cat) IS NOT NULL
ON CONFLICT DO NOTHING;

-- Regular Cleaning Services (Level 1)
WITH regular_cat AS (
  SELECT id FROM services WHERE name = 'Regular Cleaning' AND is_category = true LIMIT 1
)
INSERT INTO services (id, name, price, time_minutes, active, order_index, question_type, is_category, category_type, nesting_level, parent_id)
SELECT
  gen_random_uuid(),
  name,
  price,
  time_minutes,
  true,
  order_index,
  'plus_minus',
  false,
  'regular_cleaning',
  1,
  (SELECT id FROM regular_cat)
FROM (VALUES
  ('1 Bedroom Regular Clean', 60, 120, 1),
  ('2 Bedroom Regular Clean', 80, 150, 2),
  ('3 Bedroom Regular Clean', 100, 180, 3),
  ('4 Bedroom Regular Clean', 120, 210, 4),
  ('Kitchen Clean', 40, 60, 5),
  ('Bathroom Clean', 35, 45, 6),
  ('Living Room Clean', 30, 45, 7)
) AS t(name, price, time_minutes, order_index)
ON CONFLICT DO NOTHING;

-- Windows (Outside) - Main Category with per sqft pricing
INSERT INTO services (id, name, price, time_minutes, active, order_index, question_type, is_category, category_type, nesting_level, per_unit_type)
VALUES
  (gen_random_uuid(), 'Windows (Outside)', 2.5, 5, true, 3, 'plus_minus', false, 'windows', 0, 'sqft')
ON CONFLICT DO NOTHING;

-- Gardening - Main Category
INSERT INTO services (id, name, price, time_minutes, active, order_index, question_type, is_category, category_type, nesting_level)
VALUES
  (gen_random_uuid(), 'Gardening', 0, 0, true, 4, 'plus_minus', true, 'gardening', 0)
ON CONFLICT DO NOTHING;

-- Gardening Sub-services (Level 1)
WITH gardening_cat AS (
  SELECT id FROM services WHERE name = 'Gardening' AND is_category = true LIMIT 1
)
INSERT INTO services (id, name, price, time_minutes, active, order_index, question_type, is_category, category_type, nesting_level, parent_id)
SELECT
  gen_random_uuid(),
  name,
  price,
  time_minutes,
  true,
  order_index,
  'checkbox',
  false,
  'gardening',
  1,
  (SELECT id FROM gardening_cat)
FROM (VALUES
  ('Weeding', 40, 60, 1),
  ('Grass Cutting / Trimming', 50, 75, 2),
  ('Garden Cleaning', 45, 60, 3),
  ('Pressure Washing', 60, 90, 4)
) AS t(name, price, time_minutes, order_index)
ON CONFLICT DO NOTHING;

-- Verify the structure
SELECT
  s.name,
  s.category_type,
  s.is_category,
  s.nesting_level,
  s.price,
  s.per_unit_type,
  p.name as parent_name
FROM services s
LEFT JOIN services p ON s.parent_id = p.id
ORDER BY s.category_type, s.nesting_level, s.order_index;
