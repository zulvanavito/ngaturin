
create table categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text not null default '📦',
  type text not null default 'all' check (type in ('expense', 'income', 'all')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

alter table categories enable row level security;

create policy "Users can view their own categories."
  on categories for select using ( auth.uid() = user_id );

create policy "Users can insert their own categories."
  on categories for insert with check ( auth.uid() = user_id );

create policy "Users can update their own categories."
  on categories for update using ( auth.uid() = user_id );

create policy "Users can delete their own categories."
  on categories for delete using ( auth.uid() = user_id );

create or replace function insert_default_categories()
returns trigger as $$
begin
  insert into categories (user_id, name, icon, type) values
    (new.id, 'Makanan', '🍔', 'expense'),
    (new.id, 'Transport', '🚗', 'expense'),
    (new.id, 'Belanja', '🛍️', 'expense'),
    (new.id, 'Tagihan', '📄', 'expense'),
    (new.id, 'Hiburan', '🎬', 'expense'),
    (new.id, 'Kebutuhan', '🏠', 'expense'),
    (new.id, 'Gaji', '💰', 'income'),
    (new.id, 'Investasi', '📈', 'income'),
    (new.id, 'Lainnya', '📦', 'all');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_insert_categories
  after insert on auth.users
  for each row
  execute function insert_default_categories();
