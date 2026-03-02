
create table budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  category text not null,
  amount numeric not null check (amount >= 0),
  month text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category, month) 
);

alter table budgets enable row level security;

create policy "Users can view their own budgets."
  on budgets for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own budgets."
  on budgets for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own budgets."
  on budgets for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own budgets."
  on budgets for delete
  using ( auth.uid() = user_id );

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on budgets
  for each row
  execute function set_updated_at();
