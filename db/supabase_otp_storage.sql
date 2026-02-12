-- OTP Storage Table for Custom Email Service
-- This table stores OTP codes temporarily for email verification

CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_data JSONB -- Store first_name, last_name, password hash temporarily
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_code ON public.otp_codes(email, code) WHERE used = FALSE;
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON public.otp_codes(expires_at);

-- Cleanup expired OTPs (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.otp_codes
    WHERE expires_at < NOW() OR used = TRUE;
END;
$$;

-- RLS Policy (allow anyone to insert/select for OTP flow)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow OTP creation" ON public.otp_codes;
    DROP POLICY IF EXISTS "Allow OTP verification" ON public.otp_codes;
    DROP POLICY IF EXISTS "Allow OTP update" ON public.otp_codes;
END $$;

CREATE POLICY "Allow OTP creation" ON public.otp_codes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow OTP verification" ON public.otp_codes
    FOR SELECT USING (expires_at > NOW() AND used = FALSE);

CREATE POLICY "Allow OTP update" ON public.otp_codes
    FOR UPDATE USING (expires_at > NOW() AND used = FALSE);

-- Grant necessary permissions
GRANT INSERT, SELECT, UPDATE ON public.otp_codes TO anon;
GRANT INSERT, SELECT, UPDATE ON public.otp_codes TO authenticated;

