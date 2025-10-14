-- Create invoices table for Eleventh Hour Cleaning
-- Run this in your Supabase SQL Editor

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  status TEXT NOT NULL CHECK (status IN ('draft','sent','paid','void')) DEFAULT 'draft',
  due_date DATE NULL,
  issued_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on booking_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON public.invoices(booking_id);

-- Create index on invoice_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Function to auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year_month TEXT;
  max_num INTEGER;
  new_number TEXT;
BEGIN
  -- Format: INV-YYYYMM-NNNN (e.g., INV-202510-0001)
  year_month := TO_CHAR(NOW(), 'YYYYMM');

  -- Get the highest invoice number for this month
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER
    )
  ), 0) INTO max_num
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '-%';

  -- Generate new number
  new_number := 'INV-' || year_month || '-' || LPAD((max_num + 1)::TEXT, 4, '0');
  NEW.invoice_number := new_number;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate invoice number on insert
DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON public.invoices;
CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_invoices_updated_at ON public.invoices;
CREATE TRIGGER trigger_update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.invoices IS 'Invoice records linked to bookings';
COMMENT ON COLUMN public.invoices.invoice_number IS 'Auto-generated unique invoice number (INV-YYYYMM-NNNN)';
COMMENT ON COLUMN public.invoices.status IS 'Invoice status: draft, sent, paid, void';
COMMENT ON COLUMN public.invoices.booking_id IS 'Reference to the booking this invoice is for';
COMMENT ON COLUMN public.invoices.amount IS 'Invoice amount in the specified currency';
COMMENT ON COLUMN public.invoices.currency IS 'Currency code (default: GBP)';
COMMENT ON COLUMN public.invoices.due_date IS 'Payment due date';
COMMENT ON COLUMN public.invoices.issued_date IS 'Date the invoice was issued';

-- RLS policies (Service role bypasses these, but good to have for future)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (admin API uses service role)
-- For additional security, you can add policies for authenticated users if needed
