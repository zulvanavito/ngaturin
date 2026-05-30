-- 1. Ensure the is_default column exists before any function or trigger refers to it
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wallets' AND column_name='is_default') THEN
    ALTER TABLE public.wallets ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 2. Cleanup: Drop ALL previous legacy wallet triggers and functions to avoid conflicts
-- This includes triggers on auth.users and their associated functions
DROP TRIGGER IF EXISTS on_auth_user_created_insert_wallets ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_setup ON auth.users;
DROP FUNCTION IF EXISTS public.insert_default_wallets();
DROP FUNCTION IF EXISTS public.create_default_wallet();
DROP FUNCTION IF EXISTS public.handle_new_user_setup();

-- 3. Ensure only one default wallet per user via a partial unique index
DROP INDEX IF EXISTS public.wallets_user_id_is_default_idx;
CREATE UNIQUE INDEX wallets_user_id_is_default_idx 
ON public.wallets (user_id) 
WHERE (is_default = TRUE);

-- 4. Create the refined function to auto-create default wallet
-- SECURITY DEFINER and SET search_path are critical for auth triggers
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Insert default 'Tunai' wallet using public schema explicitly
  INSERT INTO public.wallets (
    user_id, 
    name, 
    icon, 
    type, 
    color, 
    is_default
  )
  VALUES (
    NEW.id,
    'Tunai',
    'Wallet', 
    'cash',   
    '#9fe870',
    TRUE
  )
  ON CONFLICT (user_id) WHERE (is_default = TRUE) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 5. Trigger the function on new user signup
CREATE TRIGGER on_auth_user_created_setup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();
