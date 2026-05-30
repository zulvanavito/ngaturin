-- Add is_default column to wallets
ALTER TABLE public.wallets 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Create function to auto-create default wallet
CREATE OR REPLACE FUNCTION public.create_default_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id, name, icon, type, color, is_default)
  VALUES (
    NEW.id,
    'Tunai',
    'Wallet', -- Default icon
    'cash',   -- Default type
    '#9fe870',-- Default Wise green
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_wallet();
