-- Step 1: Add balance column to wallets
ALTER TABLE public.wallets ADD COLUMN balance numeric(15, 2) NOT NULL DEFAULT 0;

-- Step 2: Add transfer_group_id to transactions
ALTER TABLE public.transactions ADD COLUMN transfer_group_id uuid;
CREATE INDEX idx_transactions_transfer_group_id ON public.transactions(transfer_group_id);

-- Step 3: Backfill existing balances
-- This is a one-time calculation based on existing transactions
UPDATE public.wallets w
SET balance = (
  SELECT COALESCE(SUM(
    CASE 
      WHEN t.type = 'income' THEN t.amount
      WHEN t.type = 'expense' THEN -t.amount
      WHEN t.type = 'transfer' AND t.description LIKE '%→ masuk' THEN t.amount
      WHEN t.type = 'transfer' AND t.description LIKE '%→ keluar' THEN -t.amount
      ELSE 0
    END
  ), 0)
  FROM public.transactions t
  WHERE t.wallet_id = w.id
);

-- Step 4: Create trigger function to maintain balance
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
          WHEN OLD.type = 'transfer' AND OLD.description LIKE '%→ masuk' THEN OLD.amount
          WHEN OLD.type = 'transfer' AND OLD.description LIKE '%→ keluar' THEN -OLD.amount
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
          WHEN NEW.type = 'transfer' AND NEW.description LIKE '%→ masuk' THEN NEW.amount
          WHEN NEW.type = 'transfer' AND NEW.description LIKE '%→ keluar' THEN -NEW.amount
          ELSE 0
        END
      )
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Attach trigger to transactions table
-- We use AFTER trigger so that the balance is updated after the transaction is successfully committed
CREATE TRIGGER maintain_wallet_balance_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance_on_tx();
