-- Migration: 026_add_category_budget_group
-- Adds budget_group to categories and updates default classifications

-- 1. Add the column with a check constraint and default
alter table categories 
add column if not exists budget_group text not null default 'wants' 
check (budget_group in ('needs', 'wants', 'savings'));

-- 2. Update existing categories to have a logical budget_group based on name
update categories
set budget_group = 'needs'
where lower(name) in ('makanan', 'makan', 'groceries', 'belanja bahan', 'transportasi', 'transport', 'bensin', 'listrik', 'air', 'internet', 'pulsa', 'sewa', 'kos', 'kontrakan', 'asuransi', 'obat', 'kesehatan', 'rumah sakit', 'laundry', 'tagihan', 'kebutuhan');

update categories
set budget_group = 'savings'
where lower(name) in ('tabungan', 'investasi', 'deposito', 'reksadana', 'saham', 'emas', 'saving', 'dana darurat', 'goals', 'gaji');

-- By default everything else stays 'wants' as per the column default

-- 3. Replace the insert_default_categories function to include budget_group
create or replace function insert_default_categories()
returns trigger as $$
begin
  insert into categories (user_id, name, icon, type, budget_group) values
    (new.id, 'Makanan', '🍔', 'expense', 'needs'),
    (new.id, 'Transport', '🚗', 'expense', 'needs'),
    (new.id, 'Belanja', '🛍️', 'expense', 'wants'),
    (new.id, 'Tagihan', '📄', 'expense', 'needs'),
    (new.id, 'Hiburan', '🎬', 'expense', 'wants'),
    (new.id, 'Kebutuhan', '🏠', 'expense', 'needs'),
    (new.id, 'Gaji', '💰', 'income', 'savings'),
    (new.id, 'Investasi', '📈', 'income', 'savings'),
    (new.id, 'Lainnya', '📦', 'all', 'wants');
  return new;
end;
$$ language plpgsql security definer;
