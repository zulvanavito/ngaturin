# Ngaturin - Atur Keuangan Pribadimu!

<p align="center">
  <img src="public/logo.png" width="150" alt="Ngaturin Logo" />
</p>

<p align="center">
  <strong>Kelola Hidup & Uang Dalam Satu Tampilan.</strong><br/>
  Platform manajemen keuangan & produktivitas pribadi yang memadukan catatan transaksi, metode PARA, dan pelacakan investasi.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-20232A?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

---

## 🚀 Tentang Proyek

**Ngaturin** adalah platform manajemen keuangan & produktivitas pribadi berbasis web. Lebih dari sekadar expense tracker — Ngaturin memadukan pencatatan keuangan komprehensif, metode organisasi **PARA (Projects, Areas, Resources, Archives)**, dan pelacakan investasi ke dalam satu tampilan terpadu. Dibangun dengan Next.js 16, Supabase, dan TailwindCSS.

> _"Kelola Hidup & Uang Dalam Satu Tampilan."_

## ✨ Fitur

### 💳 Keuangan

- **Transaksi** — Catat pemasukan, pengeluaran, dan transfer antar dompet.
- **Multi-Dompet** — Kelola saldo terpisah (kas, bank, e-money, kartu kredit, dll.) dengan transfer antar dompet.
- **Anggaran (Budgets)** — Tetapkan batas pengeluaran per kategori dan pantau progresnya.
- **Utang & Piutang** — Lacak siapa yang berutang dan kepada siapa, lengkap dengan histori pembayaran.
- **Target Keuangan (Goals)** — Buat target menabung dan catat progres setoran.
- **Tagihan Berulang (Bills)** — Pengingat otomatis untuk subscription, cicilan, dan tagihan periodik.
- **Kategori Kustom** — Buat kategori transaksi sendiri dengan ikon pilihan.
- **Insights & Analitik** — Ringkasan tren pengeluaran, cashflow, dan analisis AI.

### 📈 Investasi

- **Portofolio Investasi** — Catat dan pantau aset investasi (saham, reksadana, crypto, dll.).
- **Sinkronisasi Harga** — Integrasi Yahoo Finance untuk harga aset real-time.
- **Histori Transaksi Investasi** — Tracking buy/sell per aset.

### 🗂️ Produktivitas (PARA)

- **Projects** — Kelola proyek aktif dengan task dan deadline.
- **Areas** — Tanggung jawab berkelanjutan yang perlu dipelihara.
- **Resources** — Kumpulkan referensi dan materi belajar.
- **Archives** — Arsipkan item yang sudah selesai.

### 🛡️ Lainnya

- **Autentikasi Multi-Metode** — Email/password dan Google OAuth via Supabase Auth.
- **Dashboard Interaktif** — Ringkasan total aset, chart 7 hari, financial health score.
- **Ekspor Data** — Export transaksi ke CSV, Excel, dan PDF.
- **Dark Mode** — Tema gelap/terang yang responsif.
- **Backup & Reset Data** — Kelola data akun melalui halaman profil.
- **Keamanan** — Row Level Security (RLS) di setiap tabel, setiap pengguna hanya mengakses datanya sendiri.

## 🛠️ Teknologi

| Bagian             | Teknologi                                       |
| :----------------- | :---------------------------------------------- |
| **Framework**      | Next.js 16 (App Router, Turbopack)              |
| **Styling**        | TailwindCSS 3, Framer Motion                    |
| **UI Components**  | Radix UI (Shadcn UI), Lucide React              |
| **Charts**         | Recharts                                        |
| **Backend & Auth** | Supabase (PostgreSQL, Auth, Row Level Security) |
| **Investasi**      | Yahoo Finance 2 (market data)                   |
| **Ekspor**         | ExcelJS, jsPDF, json2csv                        |
| **Analytics**      | Vercel Speed Insights                           |
| **Deployment**     | Vercel                                          |

## 📋 Prasyarat

- Node.js versi 18.x atau lebih baru
- Akun [Supabase](https://supabase.com) (gratis)
- _(Opsional)_ Akun Google Cloud Console untuk OAuth Google

## 🚀 Cara Menjalankan

### 1. Clone repositori

```bash
git clone https://github.com/zulvanavito/ngaturin.git
cd ngaturin
```

### 2. Install dependensi

```bash
npm install
```

### 3. Setup environment variables

Buat file `.env.local` di root proyek:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

> **Catatan:** Dapatkan nilai ini dari **Project Settings > API** di dashboard Supabase.

### 4. Setup database

Jalankan file migrasi yang tersedia di folder `supabase/migrations/` melalui Supabase SQL Editor, atau gunakan Supabase CLI:

```bash
npx supabase db push
```

### 5. Jalankan development server

```bash
npm run dev
```

Akses `http://localhost:3000` di browser.

## 🔧 Konfigurasi Tambahan

### Google OAuth (Opsional)

1. Buat project di **Google Cloud Console**.
2. Aktifkan **OAuth consent screen** (pilih External).
3. Buat **OAuth Client ID** untuk aplikasi web.
4. Tambahkan **Authorized redirect URIs**:
   - `http://localhost:3000/auth/callback`
   - `https://domain-anda.com/auth/callback` (untuk production)
5. Di Supabase, buka **Authentication > Providers > Google**, masukkan **Client ID** dan **Client Secret**.

## 📁 Struktur Proyek

```text
ngaturin/
├── app/
│   ├── api/                        # API Routes (REST endpoints)
│   │   ├── backup/                 # Backup & restore data
│   │   ├── budgets/                # Anggaran CRUD
│   │   ├── categories/             # Kategori CRUD
│   │   ├── debts/                  # Utang-piutang CRUD
│   │   ├── goals/                  # Target keuangan CRUD
│   │   ├── insights/               # AI insights
│   │   ├── investments/            # Investasi CRUD + sync
│   │   ├── para/                   # PARA method CRUD
│   │   ├── recurring-bills/        # Tagihan berulang CRUD
│   │   ├── transactions/           # Transaksi CRUD
│   │   ├── user/                   # User management
│   │   └── wallets/                # Dompet CRUD + transfer
│   ├── auth/                       # Halaman autentikasi
│   ├── blog/                       # Halaman blog
│   ├── dashboard/                  # Halaman dashboard (terproteksi)
│   │   ├── bills/                  # Manajemen tagihan
│   │   ├── budgets/                # Manajemen anggaran
│   │   ├── categories/             # Manajemen kategori
│   │   ├── debts/                  # Manajemen utang-piutang
│   │   ├── goals/                  # Manajemen target
│   │   ├── guide/                  # Panduan pengguna
│   │   ├── insights/               # Analitik & wawasan
│   │   ├── investments/            # Portofolio investasi
│   │   ├── para/                   # Metode PARA
│   │   ├── profile/                # Profil & pengaturan
│   │   ├── transactions/           # Histori transaksi
│   │   └── wallets/                # Manajemen dompet
│   ├── pricing/                    # Halaman harga
│   ├── privacy-policy/             # Kebijakan privasi
│   └── terms-of-service/           # Ketentuan layanan
├── components/
│   ├── auth/                       # Komponen autentikasi
│   ├── bills/                      # Komponen tagihan
│   ├── budgets/                    # Komponen anggaran
│   ├── categories/                 # Komponen kategori
│   ├── dashboard/                  # Widget dashboard
│   ├── debts/                      # Komponen utang-piutang
│   ├── finance/                    # Komponen keuangan inti
│   ├── goals/                      # Komponen target
│   ├── insights/                   # Komponen analitik
│   ├── investments/                # Komponen investasi
│   ├── layout/                     # Sidebar, navigation, skeletons
│   ├── para/                       # Komponen metode PARA
│   ├── pricing/                    # Komponen pricing
│   ├── profile/                    # Komponen profil
│   ├── shared/                     # Komponen shared (providers, dll)
│   ├── ui/                         # Shadcn UI primitives
│   └── wallets/                    # Komponen dompet
├── hooks/                          # Custom React hooks
├── lib/
│   ├── supabase/                   # Supabase client (browser & server)
│   ├── utils/                      # Utility functions & helpers
│   ├── export-utils.ts             # Ekspor CSV/Excel/PDF
│   ├── finance-api.ts              # Finance API helpers
│   ├── para-types.ts               # PARA type definitions
│   └── toast-context.tsx           # Toast notification context
├── proxy.ts                        # Next.js 16 proxy (auth middleware)
├── tailwind.config.ts              # Konfigurasi TailwindCSS
└── .env.local                      # Environment variables (tidak di-commit)
```

## 📄 Legal

- [Kebijakan Privasi](/privacy-policy)
- [Ketentuan Layanan](/terms-of-service)

## 📄 Lisensi

MIT

---

Dibuat dengan ❤️ oleh **Zulvan Avito**
