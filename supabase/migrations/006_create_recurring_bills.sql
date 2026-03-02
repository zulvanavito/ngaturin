
create table recurring_bills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  amount numeric not null check (amount > 0),
  category text,
  due_day integer not null check (due_day between 1 and 31),
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


alter table recurring_bills enable row level security;

create policy "Users can view their own bills."
  on recurring_bills for select using ( auth.uid() = user_id );

create policy "Users can insert their own bills."
  on recurring_bills for insert with check ( auth.uid() = user_id );

create policy "Users can update their own bills."
  on recurring_bills for update using ( auth.uid() = user_id );

create policy "Users can delete their own bills."
  on recurring_bills for delete using ( auth.uid() = user_id );
