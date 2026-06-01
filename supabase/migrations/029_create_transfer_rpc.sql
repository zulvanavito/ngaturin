-- Step 1: Create the transfer_funds RPC
-- This function handles the transfer of funds between two wallets atomically.
CREATE OR REPLACE FUNCTION public.transfer_funds(
  p_from_wallet_id uuid,
  p_to_wallet_id uuid,
  p_amount numeric,
  p_description text DEFAULT 'Transfer Antar Dompet',
  p_date date DEFAULT CURRENT_DATE
) RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_group_id uuid;
  v_source_balance numeric;
BEGIN
  -- Get current user ID from session
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Check if both wallets belong to the user
  IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE id = p_from_wallet_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'Source wallet not found or access denied';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE id = p_to_wallet_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'Destination wallet not found or access denied';
  END IF;

  -- Verify identical wallet IDs
  IF p_from_wallet_id = p_to_wallet_id THEN
    RAISE EXCEPTION 'Source and destination wallets must be different';
  END IF;

  -- Check source wallet balance
  SELECT balance INTO v_source_balance FROM public.wallets WHERE id = p_from_wallet_id;
  IF v_source_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds in source wallet';
  END IF;

  -- Generate group ID to link the two transactions
  v_group_id := gen_random_uuid();

  -- Insert "out" transaction (Transfer → keluar)
  -- The trigger 'maintain_wallet_balance_trigger' will automatically update wallets.balance
  INSERT INTO public.transactions (
    user_id, wallet_id, type, amount, category, description, date, transfer_group_id
  ) VALUES (
    v_user_id, p_from_wallet_id, 'transfer', p_amount, 'Transfer', p_description || ' → keluar', p_date, v_group_id
  );

  -- Insert "in" transaction (Transfer → masuk)
  -- The trigger 'maintain_wallet_balance_trigger' will automatically update wallets.balance
  INSERT INTO public.transactions (
    user_id, wallet_id, type, amount, category, description, date, transfer_group_id
  ) VALUES (
    v_user_id, p_to_wallet_id, 'transfer', p_amount, 'Transfer', p_description || ' → masuk', p_date, v_group_id
  );

END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.transfer_funds TO authenticated;
