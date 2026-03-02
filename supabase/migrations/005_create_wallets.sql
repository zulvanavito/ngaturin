
create table wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text not null default '💳',
  type text not null default 'bank' check (type in ('cash', 'bank', 'emoney', 'credit')),
  color text not null default '#10b981',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table transactions
  add column if not exists wallet_id uuid references wallets(id) on delete set null;

alter table wallets enable row level security;

create policy "Users can view their own wallets."
  on wallets for select using ( auth.uid() = user_id );

create policy "Users can insert their own wallets."
  on wallets for insert with check ( auth.uid() = user_id );

create policy "Users can update their own wallets."
  on wallets for update using ( auth.uid() = user_id );

create policy "Users can delete their own wallets."
  on wallets for delete using ( auth.uid() = user_id );

create or replace function insert_default_wallets()
returns trigger as $$
begin
  insert into wallets (user_id, name, icon, type, color) values
    (new.id, 'Tunai',        '💵', 'cash',   '#10b981'),
    (new.id, 'Rekening Bank','🏦', 'bank',   '#3b82f6'),
    (new.id, 'E-Money',      '📱', 'emoney', '#8b5cf6');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_insert_wallets
  after insert on auth.users
  for each row
  execute function insert_default_wallets();

