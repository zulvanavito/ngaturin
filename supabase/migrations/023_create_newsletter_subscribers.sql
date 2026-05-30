-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'subscribed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow insert access to everyone (public endpoint)
CREATE POLICY "Enable insert access for all users" ON public.newsletter_subscribers
    FOR INSERT
    WITH CHECK (true);

-- Allow select access only to service role / authenticated admins
CREATE POLICY "Enable select access for authenticated users only" ON public.newsletter_subscribers
    FOR SELECT
    TO authenticated
    USING (true);

-- Set up trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_newsletter_subscribers_updated
    BEFORE UPDATE ON public.newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
