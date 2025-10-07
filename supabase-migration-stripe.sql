-- Add Stripe payment columns to bookings table
-- Run this in your Supabase SQL Editor

-- Add payment_status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
    ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Add stripe_session_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'bookings' AND column_name = 'stripe_session_id') THEN
    ALTER TABLE bookings ADD COLUMN stripe_session_id TEXT;
  END IF;
END $$;

-- Add stripe_payment_intent column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'bookings' AND column_name = 'stripe_payment_intent') THEN
    ALTER TABLE bookings ADD COLUMN stripe_payment_intent TEXT;
  END IF;
END $$;

-- Add index on stripe_session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session_id ON bookings(stripe_session_id);

-- Add index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Add comment for documentation
COMMENT ON COLUMN bookings.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN bookings.stripe_session_id IS 'Stripe Checkout Session ID';
COMMENT ON COLUMN bookings.stripe_payment_intent IS 'Stripe Payment Intent ID';
