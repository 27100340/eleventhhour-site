-- =====================================================
-- Admin User Management SQL File
-- =====================================================
-- Run these queries in the Supabase SQL Editor
-- to create, update, and manage admin users
-- =====================================================

-- =====================================================
-- 1. CREATE ADMIN PROFILES TABLE (RUN THIS FIRST)
-- =====================================================
-- This table stores additional admin user information
-- such as display names for personalized greetings

CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to read their own profile
CREATE POLICY "Admins can read their own profile"
  ON admin_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow service role to manage all profiles
CREATE POLICY "Service role can manage admin profiles"
  ON admin_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. CREATE A NEW ADMIN USER
-- =====================================================
-- INSTRUCTIONS:
-- 1. Replace 'admin@example.com' with the desired email
-- 2. Replace 'SecurePassword123!' with a strong password
-- 3. Replace 'John Doe' with the admin's full name
-- 4. Run this query in Supabase SQL Editor

DO $$
DECLARE
  new_user_id UUID;
  user_email TEXT := 'admin@example.com'; -- CHANGE THIS
  user_password TEXT := 'SecurePassword123!'; -- CHANGE THIS
  user_display_name TEXT := 'John Doe'; -- CHANGE THIS
BEGIN
  -- Create the user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"role": "admin"}'::jsonb,
    '{"display_name": "' || user_display_name || '"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create admin profile entry
  INSERT INTO admin_profiles (id, display_name)
  VALUES (new_user_id, user_display_name);

  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE 'Email: %', user_email;
  RAISE NOTICE 'Display Name: %', user_display_name;
END $$;

-- =====================================================
-- 3. MAKE AN EXISTING USER AN ADMIN
-- =====================================================
-- INSTRUCTIONS:
-- 1. Replace 'existing-user@example.com' with the user's email
-- 2. Replace 'Jane Smith' with their display name
-- 3. Run this query

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'existing-user@example.com'; -- CHANGE THIS
  target_display_name TEXT := 'Jane Smith'; -- CHANGE THIS
BEGIN
  -- Get the user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;

  -- Update app_metadata to add admin role
  UPDATE auth.users
  SET
    raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb,
    raw_user_meta_data = raw_user_meta_data || ('{"display_name": "' || target_display_name || '"}')::jsonb,
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Create or update admin profile
  INSERT INTO admin_profiles (id, display_name)
  VALUES (target_user_id, target_display_name)
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

  RAISE NOTICE 'User promoted to admin successfully!';
  RAISE NOTICE 'User ID: %', target_user_id;
  RAISE NOTICE 'Email: %', target_email;
  RAISE NOTICE 'Display Name: %', target_display_name;
END $$;

-- =====================================================
-- 4. UPDATE ADMIN PASSWORD
-- =====================================================
-- INSTRUCTIONS:
-- 1. Replace 'admin@example.com' with the admin's email
-- 2. Replace 'NewSecurePassword456!' with the new password
-- 3. Run this query

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'admin@example.com'; -- CHANGE THIS
  new_password TEXT := 'NewSecurePassword456!'; -- CHANGE THIS
BEGIN
  -- Get the user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;

  -- Update the password
  UPDATE auth.users
  SET
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = target_user_id;

  RAISE NOTICE 'Password updated successfully for: %', target_email;
END $$;

-- =====================================================
-- 5. UPDATE ADMIN EMAIL
-- =====================================================
-- INSTRUCTIONS:
-- 1. Replace 'old-email@example.com' with current email
-- 2. Replace 'new-email@example.com' with new email
-- 3. Run this query

DO $$
DECLARE
  target_user_id UUID;
  old_email TEXT := 'old-email@example.com'; -- CHANGE THIS
  new_email TEXT := 'new-email@example.com'; -- CHANGE THIS
BEGIN
  -- Get the user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = old_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', old_email;
  END IF;

  -- Update the email
  UPDATE auth.users
  SET
    email = new_email,
    updated_at = NOW()
  WHERE id = target_user_id;

  RAISE NOTICE 'Email updated successfully!';
  RAISE NOTICE 'Old Email: %', old_email;
  RAISE NOTICE 'New Email: %', new_email;
END $$;

-- =====================================================
-- 6. UPDATE ADMIN DISPLAY NAME
-- =====================================================
-- INSTRUCTIONS:
-- 1. Replace 'admin@example.com' with the admin's email
-- 2. Replace 'New Display Name' with the new name
-- 3. Run this query

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'admin@example.com'; -- CHANGE THIS
  new_display_name TEXT := 'New Display Name'; -- CHANGE THIS
BEGIN
  -- Get the user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;

  -- Update user metadata
  UPDATE auth.users
  SET
    raw_user_meta_data = raw_user_meta_data || ('{"display_name": "' || new_display_name || '"}')::jsonb,
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Update admin profile
  UPDATE admin_profiles
  SET
    display_name = new_display_name,
    updated_at = NOW()
  WHERE id = target_user_id;

  RAISE NOTICE 'Display name updated successfully!';
  RAISE NOTICE 'Email: %', target_email;
  RAISE NOTICE 'New Display Name: %', new_display_name;
END $$;

-- =====================================================
-- 7. REMOVE ADMIN ROLE (DEMOTE TO REGULAR USER)
-- =====================================================
-- INSTRUCTIONS:
-- 1. Replace 'admin@example.com' with the admin's email
-- 2. Run this query

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'admin@example.com'; -- CHANGE THIS
BEGIN
  -- Get the user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;

  -- Remove admin role from app_metadata
  UPDATE auth.users
  SET
    raw_app_meta_data = raw_app_meta_data - 'role',
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Delete admin profile
  DELETE FROM admin_profiles WHERE id = target_user_id;

  RAISE NOTICE 'Admin role removed successfully!';
  RAISE NOTICE 'Email: %', target_email;
END $$;

-- =====================================================
-- 8. LIST ALL ADMIN USERS
-- =====================================================
-- Run this to see all current admin users

SELECT
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  ap.display_name,
  u.raw_app_meta_data->>'role' as role
FROM auth.users u
LEFT JOIN admin_profiles ap ON u.id = ap.id
WHERE u.raw_app_meta_data->>'role' = 'admin'
ORDER BY u.created_at DESC;

-- =====================================================
-- 9. DELETE AN ADMIN USER COMPLETELY
-- =====================================================
-- WARNING: This permanently deletes the user!
-- INSTRUCTIONS:
-- 1. Replace 'admin@example.com' with the admin's email
-- 2. Run this query

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'admin@example.com'; -- CHANGE THIS
BEGIN
  -- Get the user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;

  -- Delete admin profile (will cascade due to foreign key)
  DELETE FROM admin_profiles WHERE id = target_user_id;

  -- Delete user from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;

  RAISE NOTICE 'User deleted successfully!';
  RAISE NOTICE 'Email: %', target_email;
END $$;

-- =====================================================
-- 10. QUICK CREATE ADMIN (SIMPLIFIED VERSION)
-- =====================================================
-- For quick testing, use this simplified version
-- Replace the three values below and run

DO $$
BEGIN
  -- CHANGE THESE THREE VALUES:
  PERFORM create_admin_user(
    'quickadmin@example.com',  -- email
    'Password123!',             -- password
    'Quick Admin'               -- display name
  );
END $$;

-- Helper function for quick admin creation
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_display_name TEXT
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Create user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    '{"role": "admin"}'::jsonb,
    ('{"display_name": "' || p_display_name || '"}')::jsonb,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_user_id;

  -- Create admin profile
  INSERT INTO admin_profiles (id, display_name)
  VALUES (v_user_id, p_display_name);

  RAISE NOTICE 'Admin created: % (ID: %)', p_email, v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

/*

EXAMPLE 1: Create a new admin
-------------------------------
SELECT create_admin_user(
  'newadmin@eleventhhour.com',
  'SecurePass123!',
  'Sarah Johnson'
);


EXAMPLE 2: Change password
---------------------------
DO $$
DECLARE
  target_email TEXT := 'admin@eleventhhour.com';
  new_password TEXT := 'NewPassword456!';
BEGIN
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE email = target_email;
  RAISE NOTICE 'Password updated for: %', target_email;
END $$;


EXAMPLE 3: Update display name
-------------------------------
UPDATE admin_profiles
SET display_name = 'Sarah J. Smith', updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@eleventhhour.com');

*/
