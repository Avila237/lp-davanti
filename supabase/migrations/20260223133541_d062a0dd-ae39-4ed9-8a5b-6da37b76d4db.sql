
-- Create job_listings table
CREATE TABLE public.job_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'CLT',
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  benefits TEXT NOT NULL DEFAULT '',
  whatsapp_number TEXT NOT NULL DEFAULT '5555991166688',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

-- Public read access for active listings only
CREATE POLICY "Anyone can view active job listings"
  ON public.job_listings
  FOR SELECT
  USING (is_active = true);
