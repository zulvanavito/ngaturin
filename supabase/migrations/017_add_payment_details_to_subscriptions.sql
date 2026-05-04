-- Add payment_details JSONB column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_details JSONB;
