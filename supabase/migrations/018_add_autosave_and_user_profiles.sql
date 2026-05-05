-- Create user_profiles table for storing payday and primary wallet preferences
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  payday_day      INTEGER CHECK (payday_day BETWEEN 1 AND 31),
  primary_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add auto-save columns to goals
ALTER TABLE public.goals 
  ADD COLUMN IF NOT EXISTS is_auto_save BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_save_amount DECIMAL(12, 2) DEFAULT 0;

-- Partial index for efficient auto-save goal lookup
CREATE INDEX IF NOT EXISTS idx_goals_auto_save ON public.goals(user_id) WHERE is_auto_save = TRUE;
