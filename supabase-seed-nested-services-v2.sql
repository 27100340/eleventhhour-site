-- Seed simplified nested services structure
-- Run this AFTER running supabase-migration-nested-services.sql
-- This will create the simplified service structure with 2 main dropdowns

-- IMPORTANT: Clear existing services first
TRUNCATE services CASCADE;

-- Insert main service categories
INSERT INTO services (id, name, price, time_minutes, active, order_index, question_type, is_category, category_type, nesting_level)
VALUES
  -- Main Category 1: Regular Cleaning
  (gen_random_uuid(), 'Regular Cleaning', 0, 0, true, 1, 'plus_minus', true, 'regular_cleaning', 0),

  -- Main Category 2: Deep Cleaning / End of Tenancy
  (gen_random_uuid(), 'Deep Cleaning / End of Tenancy', 0, 0, true, 2, 'plus_minus', true, 'deep_cleaning', 0)
ON CONFLICT DO NOTHING;

-- Regular Cleaning Sub-services (Number of hours and cleaners)
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
  ('Number of Hours', 25, 60, 1),
  ('Number of Cleaners', 25, 0, 2)
) AS t(name, price, time_minutes, order_index)
ON CONFLICT DO NOTHING;

-- Deep Cleaning Sub-services (Main rooms)
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
  false,
  'deep_cleaning',
  1,
  (SELECT id FROM deep_cleaning_cat)
FROM (VALUES
  ('Bedrooms', 80, 120, 1),
  ('Bathrooms', 70, 90, 2),
  ('Toilets', 40, 45, 3),
  ('Kitchen', 90, 120, 4),
  ('Conservatory', 70, 90, 5),
  ('Utility / Box Rooms', 50, 60, 6),
  ('Study Rooms', 60, 90, 7),
  ('Reception', 60, 90, 8)
) AS t(name, price, time_minutes, order_index)
ON CONFLICT DO NOTHING;

-- Extras Section (as children of Deep Cleaning category) - PLUS_MINUS type
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
  false,
  'deep_cleaning',
  1,
  (SELECT id FROM deep_cleaning_cat)
FROM (VALUES
  ('Carpets', 60, 90, 9),
  ('Oven', 45, 60, 10),
  ('Fridge', 35, 45, 11),
  ('Washing Machine', 30, 40, 12),
  ('Dishwasher', 25, 30, 13),
  ('Microwave', 15, 15, 14),
  ('Upholstery / Sofa / Seat', 80, 120, 15),
  ('Mould', 70, 90, 16),
  ('Windows Inside', 50, 60, 17)
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

-- Gardening Sub-services - PLUS_MINUS type
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
  'plus_minus',
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
  s.question_type,
  s.per_unit_type,
  p.name as parent_name,
  s.order_index
FROM services s
LEFT JOIN services p ON s.parent_id = p.id
ORDER BY s.category_type, s.nesting_level, s.order_index;
