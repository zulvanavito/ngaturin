-- Seed Data untuk Ngaturin (Testing Environment)

-- Pastikan ekstensi pgcrypto diaktifkan untuk hash password
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Membuat Test User Utama (Untuk Manual Testing / Bot Testing)
-- Email: tester@ngaturin.com
-- Password: password123
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'tester@ngaturin.com',
  crypt('password123', gen_salt('bf')),
  now(), -- Melewati konfirmasi email dengan mengisi tanggal konfirmasi saat ini
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Tester Ngaturin"}',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Catatan: Kategori dan Wallet secara otomatis akan dibuat melalui 
-- trigger 'on_auth_user_created_insert_categories' dan 'on_auth_user_created_insert_wallets' 
-- yang sudah Anda buat di migrations.

-- 2. Menambahkan beberapa transaksi dummy untuk user tester
INSERT INTO public.transactions (user_id, description, amount, category, type, date)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Makan Siang Nasi Padang', 35000, 'Makanan', 'expense', CURRENT_DATE - 1),
  ('10000000-0000-0000-0000-000000000001', 'Gaji Bulanan', 8500000, 'Gaji', 'income', CURRENT_DATE - 2),
  ('10000000-0000-0000-0000-000000000001', 'Beli Kopi Susu', 25000, 'Makanan', 'expense', CURRENT_DATE),
  ('10000000-0000-0000-0000-000000000001', 'Bensin Motor', 30000, 'Transport', 'expense', CURRENT_DATE - 3);

-- 3. Membuat Test User Kedua (Email yang digunakan bot TestSprite sebelumnya)
-- Email: test.com
-- Password: password123
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '20000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test.com',
  crypt('password123', gen_salt('bf')),
  now(), -- Konfirmasi email otomatis
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "TestSprite Bot"}',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 4. Menambahkan auth.identities untuk User 1 agar login berfungsi
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  format('{"sub":"%s","email":"%s"}', '10000000-0000-0000-0000-000000000001', 'tester@ngaturin.com')::jsonb,
  'email',
  now(),
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- 5. Menambahkan auth.identities untuk User 2
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  format('{"sub":"%s","email":"%s"}', '20000000-0000-0000-0000-000000000002', 'test.com')::jsonb,
  'email',
  now(),
  now(),
  now()
) ON CONFLICT DO NOTHING;
