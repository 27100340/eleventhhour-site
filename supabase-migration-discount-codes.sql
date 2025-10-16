-- Discount Codes Table Migration
-- Run this SQL in your Supabase SQL Editor

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_active ON discount_codes(active);
CREATE INDEX idx_discount_codes_valid_dates ON discount_codes(valid_from, valid_until);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_discount_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER discount_codes_updated_at
BEFORE UPDATE ON discount_codes
FOR EACH ROW
EXECUTE FUNCTION update_discount_codes_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active discount codes (for validation)
CREATE POLICY "Public can read active discount codes" ON discount_codes
  FOR SELECT
  USING (active = true);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage discount codes" ON discount_codes
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'authenticated'
    AND (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  );

-- Sample discount codes (optional - for testing)
INSERT INTO discount_codes (code, description, discount_type, discount_value, min_order_amount, usage_limit, valid_until)
VALUES
  ('WELCOME10', '10% off for new customers', 'percentage', 10, 0, 100, NOW() + INTERVAL '90 days'),
  ('SAVE20', '£20 off orders over £100', 'fixed', 20, 100, 50, NOW() + INTERVAL '60 days'),
  ('SPRING25', '25% off Spring Cleaning', 'percentage', 25, 50, NULL, NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE discount_codes IS 'Stores promotional discount codes for customer bookings';
COMMENT ON COLUMN discount_codes.code IS 'Unique discount code (e.g., WELCOME10)';
COMMENT ON COLUMN discount_codes.discount_type IS 'Type of discount: percentage or fixed amount';
COMMENT ON COLUMN discount_codes.discount_value IS 'Discount value (10 for 10% or 10 for £10)';
COMMENT ON COLUMN discount_codes.min_order_amount IS 'Minimum order amount required to use code';
COMMENT ON COLUMN discount_codes.max_discount_amount IS 'Maximum discount amount (for percentage discounts)';
COMMENT ON COLUMN discount_codes.usage_limit IS 'Maximum number of times code can be used (NULL = unlimited)';
COMMENT ON COLUMN discount_codes.times_used IS 'Number of times code has been used';
COMMENT ON COLUMN discount_codes.valid_from IS 'Code becomes valid from this date/time';
COMMENT ON COLUMN discount_codes.valid_until IS 'Code expires after this date/time (NULL = never expires)';
