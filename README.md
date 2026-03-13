# Ngaturin 💰

Ngaturin adalah aplikasi expense tracker pribadi berbasis web yang membantu Anda mencatat pemasukan dan pengeluaran dengan mudah, cepat, dan aman. Dibangun dengan teknologi modern seperti Next.js, Supabase, dan TailwindCSS, Ngaturin memberikan pengalaman pengguna yang responsif dan intuitif.

## ✨ Fitur Utama (MVP)

- **✅ Autentikasi Multi‑Metode** – Registrasi dan login menggunakan email/password atau akun Google (via Supabase Auth).
- **✅ Manajemen Transaksi CRUD** – Tambah, lihat, edit, dan hapus transaksi pemasukan/pengeluaran.
- **✅ Kategori Transaksi** – Pilihan kategori: Makanan, Transport, Belanja, Tagihan, Gaji, Lainnya.
- **✅ Saldo Real‑time** – Saldo terkini dihitung otomatis dari seluruh transaksi.
- **✅ Dashboard Terproteksi** – Setiap pengguna hanya dapat mengakses data miliknya sendiri berkat Row Level Security (RLS) di database.
- **✅ Desain Modern** – Antarmuka bersih dengan komponen dari ShadCN UI dan ikon dari Lucide React.

## 🛠️ Teknologi yang Digunakan

| Bagian | Teknologi |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TailwindCSS |
| **UI Components** | ShadCN UI, Lucide React |
| **Backend & Auth** | Supabase (PostgreSQL, Auth, Row Level Security) |
| **Database** | PostgreSQL (dikelola Supabase) |
| **Deployment** | Vercel (opsional) |

## 📋 Prasyarat

- Node.js versi 18.x atau lebih baru
- Akun Supabase (gratis)
- *(Opsional)* Akun Google Cloud Console untuk konfigurasi OAuth Google

## 🚀 Cara Menjalankan di Lokal

### 1. Clone repositori

```bash
git clone https://github.com/username/ngaturin.git
cd ngaturin
```

### 2. Install dependensi

```bash
npm install
```

### 3. Setup environment variables

Buat file `.env.local` di root proyek dan isi dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Catatan:** Ganti `your_supabase_project_url` dan `your_supabase_anon_key` dengan nilai yang Anda peroleh dari halaman **Project Settings > API** di dashboard Supabase.

### 4. Setup database di Supabase

Buka **SQL Editor** di dashboard Supabase dan jalankan perintah SQL berikut untuk membuat tabel `transactions` beserta kebijakan keamanannya:

```sql
-- Tabel transaksi
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: hanya data milik sendiri
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy INSERT: hanya boleh insert dengan user_id sendiri
CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE
CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy DELETE
CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index untuk performa
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
```

### 5. Jalankan development server

```bash
npm run dev
```

Akses `http://localhost:3000` di browser. Anda akan diarahkan ke halaman login.

## 🔧 Konfigurasi Tambahan

### Google OAuth (Opsional)

Jika ingin mengaktifkan login dengan Google:

1. Buat project di **Google Cloud Console**.
2. Aktifkan **OAuth consent screen** (pilih External).
3. Buat **OAuth Client ID** untuk aplikasi web.
4. Tambahkan **Authorized redirect URIs**:
   - `http://localhost:3000/auth/callback`
   - `https://domain-anda.com/auth/callback` (untuk production)
5. Di Supabase, buka **Authentication > Providers > Google**, masukkan **Client ID** dan **Client Secret**.
6. Simpan.

### Template Email Konfirmasi

Anda dapat menyesuaikan tampilan email konfirmasi pendaftaran di **Supabase Dashboard > Authentication > Email Templates**. Gunakan kode HTML berikut sebagai dasar:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Email Ngaturin</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 560px; margin: 0 auto; padding: 20px; }
    .button { background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Konfirmasi Pendaftaran Akun Ngaturin</h2>
    <p>Terima kasih telah mendaftar. Klik tombol di bawah untuk mengonfirmasi email Anda:</p>
    <p style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Konfirmasi Email</a>
    </p>
    <p>Jika tombol tidak berfungsi, salin tautan berikut: <br> {{ .ConfirmationURL }}</p>
    <p>Abaikan email ini jika Anda tidak mendaftar.</p>
  </div>
</body>
</html>
```

> **Tips:** Untuk keperluan pengembangan, Anda dapat menonaktifkan konfirmasi email sementara di **Authentication > Providers > Email** dengan mematikan opsi **Confirm email**.

## 📁 Struktur Proyek

```text
ngaturin/
├── app/
│   ├── auth/
│   │   ├── page.tsx          # Halaman login/register
│   │   └── callback/
│   │       └── route.ts       # Handler OAuth callback
│   ├── dashboard/
│   │   └── page.tsx           # Halaman utama (terproteksi)
│   ├── page.tsx                # Redirect ke auth/dashboard
│   └── layout.tsx
├── components/
│   ├── ui/                     # Komponen ShadCN
│   ├── TransactionForm.tsx
│   └── TransactionList.tsx
├── lib/
│   └── supabase/
│       ├── client.ts           # Supabase client (browser)
│       └── server.ts            # Supabase client (server)
├── middleware.ts                # Proteksi rute
├── .env.local                   # Environment variables
└── tailwind.config.ts
```

## 📈 Fitur Selanjutnya (Rencana Pengembangan)

- 🔍 Filter & pencarian transaksi
- 📊 Grafik pengeluaran per kategori (Recharts)
- 💰 Anggaran bulanan (budgeting)
- 📤 Ekspor data ke CSV/Excel
- 🏦 Multi‑dompet
- 🌙 Mode gelap
- 🔔 Pengingat tagihan berulang

## 📄 Lisensi

MIT

Dibuat dengan ❤️ oleh Zulvan Avito
