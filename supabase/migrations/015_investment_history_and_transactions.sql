-- Migration: 015_investment_history_and_transactions

-- 1. Create investment_transactions table
create table investment_transactions (
  id uuid default uuid_generate_v4() primary key,
  investment_id uuid references investments(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  type text not null check (type in ('buy', 'sell', 'update', 'dividend')),
  amount numeric default 0, -- Quantity of asset added/removed
  price_per_unit numeric default 0, -- Price per unit at transaction time
  total_value numeric not null default 0, -- Total cost/revenue or new value
  transaction_date timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table investment_transactions enable row level security;

create policy "Users can view their own investment transactions."
  on investment_transactions for select using ( auth.uid() = user_id );

create policy "Users can insert their own investment transactions."
  on investment_transactions for insert with check ( auth.uid() = user_id );

create policy "Users can update their own investment transactions."
  on investment_transactions for update using ( auth.uid() = user_id );

create policy "Users can delete their own investment transactions."
  on investment_transactions for delete using ( auth.uid() = user_id );

-- 2. Create investment_history table (for charting performance over time)
create table investment_history (
  id uuid default uuid_generate_v4() primary key,
  investment_id uuid references investments(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  recorded_date date not null default current_date, -- Added for unique constraint
  amount numeric not null, -- Quantity at that time
  total_invested numeric not null, -- Total capital
  current_value numeric not null, -- Value at recorded_at
  unique(investment_id, recorded_date)
);

alter table investment_history enable row level security;

create policy "Users can view their own investment history."
  on investment_history for select using ( auth.uid() = user_id );

create policy "Users can insert their own investment history."
  on investment_history for insert with check ( auth.uid() = user_id );

create policy "Users can update their own investment history."
  on investment_history for update using ( auth.uid() = user_id );

create policy "Users can delete their own investment history."
  on investment_history for delete using ( auth.uid() = user_id );

-- 3. Function and Trigger to automatically log history when current_value changes
create or replace function log_investment_history()
returns trigger as $$
begin
  -- Only insert if the value or amount has changed (or on insert)
  if (TG_OP = 'INSERT') or (TG_OP = 'UPDATE' and 
      (new.current_value is distinct from old.current_value 
       or new.amount is distinct from old.amount
       or new.total_invested is distinct from old.total_invested)) then
    
    insert into investment_history (investment_id, user_id, recorded_at, recorded_date, amount, total_invested, current_value)
    values (new.id, new.user_id, now(), current_date, new.amount, new.total_invested, new.current_value)
    on conflict (investment_id, recorded_date) 
    do update set 
      amount = excluded.amount,
      total_invested = excluded.total_invested,
      current_value = excluded.current_value,
      recorded_at = excluded.recorded_at;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_log_investment_history
  after insert or update on investments
  for each row execute function log_investment_history();
