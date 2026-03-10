create table investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null check (type in ('saham', 'reksadana', 'kripto', 'emas', 'deposito', 'lainnya')),
  symbol text,
  amount numeric default 0,
  total_invested numeric not null default 0,
  current_value numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table investments enable row level security;

create policy "Users can view their own investments."
  on investments for select using ( auth.uid() = user_id );

create policy "Users can insert their own investments."
  on investments for insert with check ( auth.uid() = user_id );

create policy "Users can update their own investments."
  on investments for update using ( auth.uid() = user_id );

create policy "Users can delete their own investments."
  on investments for delete using ( auth.uid() = user_id );


create trigger set_updated_at
  before update on investments
  for each row
  execute function set_updated_at();

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conrelid = 'categories'::regclass 
    AND conname = 'categories_type_check'
  ) THEN
    NULL;
  END IF;
END $$;
