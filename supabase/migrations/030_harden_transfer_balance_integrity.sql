-- Step 1: Add transfer_direction column and constraints
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS transfer_direction text;

-- Step 2: Backfill transfer_direction from existing descriptions
UPDATE public.transactions
SET transfer_direction = CASE
  WHEN type = 'transfer' AND description LIKE '%→ masuk' THEN 'in'
  WHEN type = 'transfer' AND description LIKE '%→ keluar' THEN 'out'
  ELSE transfer_direction
END
WHERE type = 'transfer';

-- Step 3: Add constraints to harden data integrity
ALTER TABLE public.transactions
ADD CONSTRAINT transactions_transfer_direction_check
CHECK (
  transfer_direction IS NULL
  OR transfer_direction IN ('in', 'out')
);

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_transfer_direction_required_check
CHECK (
  (type = 'transfer' AND transfer_direction IN ('in', 'out'))
  OR
  (type IN ('income', 'expense') AND transfer_direction IS NULL)
);

-- Step 4: Revise trigger function to use type + transfer_direction
-- This removes dependence on the 'description' field suffix.
CREATE OR REPLACE FUNCTION public.update_wallet_balance_on_tx()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle DELETE or UPDATE (remove old value)
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
    IF OLD.wallet_id IS NOT NULL THEN
      UPDATE public.wallets
      SET balance = balance - (
        CASE 
          WHEN OLD.type = 'income' THEN OLD.amount
          WHEN OLD.type = 'expense' THEN -OLD.amount
          WHEN OLD.type = 'transfer' AND OLD.transfer_direction = 'in' THEN OLD.amount
          WHEN OLD.type = 'transfer' AND OLD.transfer_direction = 'out' THEN -OLD.amount
          ELSE 0
        END
      )
      WHERE id = OLD.wallet_id;
    END IF;
  END IF;

  -- Handle INSERT or UPDATE (add new value)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF NEW.wallet_id IS NOT NULL THEN
      UPDATE public.wallets
      SET balance = balance + (
        CASE 
          WHEN NEW.type = 'income' THEN NEW.amount
          WHEN NEW.type = 'expense' THEN -NEW.amount
          WHEN NEW.type = 'transfer' AND NEW.transfer_direction = 'in' THEN NEW.amount
          WHEN NEW.type = 'transfer' AND NEW.transfer_direction = 'out' THEN -NEW.amount
          ELSE 0
        END
      )
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Harden transfer_funds RPC
-- Added: FOR UPDATE lock, amount validation, and transfer_direction usage.
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

  -- Validation: Amount must be greater than zero
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  -- Verify identical wallet IDs
  IF p_from_wallet_id = p_to_wallet_id THEN
    RAISE EXCEPTION 'Source and destination wallets must be different';
  END IF;

  -- Locking Read: prevent race conditions by locking the source wallet row
  SELECT balance INTO v_source_balance 
  FROM public.wallets 
  WHERE id = p_from_wallet_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source wallet not found or access denied';
  END IF;

  -- Check destination wallet existence
  IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE id = p_to_wallet_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'Destination wallet not found or access denied';
  END IF;

  -- Check source wallet balance
  IF v_source_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds in source wallet';
  END IF;

  -- Generate group ID to link the two transactions
  v_group_id := gen_random_uuid();

  -- Insert "out" transaction (Transfer → keluar)
  -- The trigger 'maintain_wallet_balance_trigger' will automatically update wallets.balance
  INSERT INTO public.transactions (
    user_id, wallet_id, type, transfer_direction, amount, category, description, date, transfer_group_id
  ) VALUES (
    v_user_id, p_from_wallet_id, 'transfer', 'out', p_amount, 'Transfer', p_description || ' → keluar', p_date, v_group_id
  );

  -- Insert "in" transaction (Transfer → masuk)
  -- The trigger 'maintain_wallet_balance_trigger' will automatically update wallets.balance
  INSERT INTO public.transactions (
    user_id, wallet_id, type, transfer_direction, amount, category, description, date, transfer_group_id
  ) VALUES (
    v_user_id, p_to_wallet_id, 'transfer', 'in', p_amount, 'Transfer', p_description || ' → masuk', p_date, v_group_id
  );

END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Step 6: Final Reconciliation
-- Ensures everything is strictly in sync after logic changes
UPDATE public.wallets w
SET balance = (
  SELECT COALESCE(SUM(
    CASE 
      WHEN t.type = 'income' THEN t.amount
      WHEN t.type = 'expense' THEN -t.amount
      WHEN t.type = 'transfer' AND t.transfer_direction = 'in' THEN t.amount
      WHEN t.type = 'transfer' AND t.transfer_direction = 'out' THEN -t.amount
      ELSE 0
    END
  ), 0)
  FROM public.transactions t
  WHERE t.wallet_id = w.id
);
