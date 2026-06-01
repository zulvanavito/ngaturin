# Ngaturin - Atur Keuangan Pribadimu!

<p align="center">
  <img src="public/logo.png" width="150" alt="Ngaturin Logo" />
</p>

<p align="center">
  <strong>Kelola Hidup & Uang Dalam Satu Tampilan.</strong><br/>
  Platform manajemen keuangan dan produktivitas pribadi untuk transaksi, multi-dompet, budgeting, investasi, blog edukasi, dan metode PARA.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-20232A?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

---

## Tentang Proyek

**Ngaturin** adalah platform manajemen keuangan dan produktivitas pribadi berbasis web. Aplikasi ini memadukan pencatatan transaksi, multi-dompet, budgeting, goals, tagihan berulang, utang-piutang, investasi, blog edukasi, dan metode organisasi **PARA (Projects, Areas, Resources, Archives)** dalam satu dashboard.

Project ini dibangun dengan Next.js 16, TypeScript, Supabase PostgreSQL/Auth, TailwindCSS, dan Zod. Data finansial penting seperti saldo dompet dijaga di level database melalui trigger dan RPC agar konsistensi tidak bergantung hanya pada kalkulasi client/server application layer.

## Fitur Utama

### Keuangan

- **Transaksi** — Catat pemasukan dan pengeluaran.
- **Multi-Dompet** — Kelola kas, bank, e-money, kartu kredit, dan dompet lain.
- **Saldo Persisted** — Saldo dompet tersimpan di database dan dijaga otomatis oleh trigger.
- **Transfer Antar-Dompet Atomic** — Transfer diproses melalui RPC database dengan row-level locking.
- **Anggaran (Budgets)** — Tetapkan batas pengeluaran per kategori dan pantau progresnya.
- **Utang & Piutang** — Lacak hutang, piutang, dan pembayaran.
- **Target Keuangan (Goals)** — Buat target menabung dan pantau progres.
- **Tagihan Berulang** — Kelola subscription, cicilan, dan tagihan periodik.
- **Kategori Kustom** — Buat kategori transaksi sendiri dengan ikon dan grup budget.
- **Laporan & Ekspor** — Export transaksi ke CSV, Excel, dan PDF.

### Investasi

- **Portofolio Investasi** — Catat aset seperti saham, reksadana, kripto, emas, deposito, dan lainnya.
- **Histori Transaksi Investasi** — Tracking transaksi buy/sell/update/dividend per aset.
- **Sinkronisasi Harga** — Sinkronisasi market data jika konfigurasi dan sumber data tersedia.

### Produktivitas (PARA)

- **Projects** — Kelola proyek aktif.
- **Areas** — Kelola tanggung jawab berkelanjutan.
- **Resources** — Simpan referensi dan materi belajar.
- **Archives** — Arsipkan item yang sudah selesai.

### Reliability & Security

- **Supabase Auth** — Email/password dan OAuth provider yang dikonfigurasi di Supabase.
- **Row Level Security** — Data user dibatasi oleh RLS di database.
- **Database Trigger** — Saldo wallet diperbarui otomatis pada insert/update/delete transaksi.
- **Atomic Transfer RPC** — Transfer antar-dompet diproses sebagai operasi database atomic.
- **Zod Validation** — Endpoint finansial utama memakai validasi input Zod.
- **Sanitized API Errors** — Error database/RPC tidak dikirim mentah ke client pada endpoint yang sudah di-hardening.
- **CI Workflow** — Lint, typecheck, dan build dijalankan melalui GitHub Actions.

## Teknologi

| Bagian | Teknologi |
| :--- | :--- |
| Framework | Next.js 16, App Router, Turbopack |
| Bahasa | TypeScript |
| Styling | TailwindCSS, Framer Motion |
| UI Components | Radix UI / ShadCN UI, Lucide React |
| Backend & Auth | Supabase PostgreSQL, Supabase Auth, Row Level Security |
| Validation | Zod |
| Charts | Recharts |
| Export | ExcelJS, jsPDF, json2csv |
| Email | Resend / React Email, jika dikonfigurasi |
| Analytics | Vercel Speed Insights |
| CI | GitHub Actions |
| Deployment | Vercel |

## Prasyarat

- Node.js 20 atau lebih baru direkomendasikan.
- npm.
- Akun Supabase.
- Project Supabase dengan migration yang sudah dijalankan.
- Akun Vercel untuk deployment, opsional.
- Google Cloud Console untuk OAuth Google, opsional.

## Menjalankan Project Lokal

### 1. Clone repository

```bash
git clone https://github.com/zulvanavito/ngaturin.git
cd ngaturin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Buat file `.env.local` di root project.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Nilai tersebut dapat diambil dari Supabase Dashboard:

```text
Project Settings -> API
```

Gunakan **Project URL** dan **anon/public key**.

> Catatan: project ini menggunakan `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Jangan gunakan nama lama `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sebagai env utama.

Tambahkan environment variable lain sesuai fitur yang digunakan, misalnya OAuth, email, billing, AI, atau market data. Jangan commit file `.env.local`.

### 4. Setup database

Jalankan migration di folder `supabase/migrations/` melalui Supabase CLI:

```bash
npx supabase db push
```

Atau jalankan file SQL migration melalui Supabase SQL Editor sesuai urutan migration.

### 5. Jalankan development server

```bash
npm run dev
```

Akses aplikasi di:

```text
http://localhost:3000
```

## Database & Migrations

Project ini menggunakan Supabase PostgreSQL sebagai sumber data utama. Migration di folder `supabase/migrations/` wajib dijalankan agar schema, trigger, constraint, dan RPC tersedia.

### Integritas Saldo Wallet

Saldo wallet disimpan pada kolom `wallets.balance`. Nilai ini dijaga otomatis oleh trigger pada tabel `transactions` untuk operasi:

- `INSERT`
- `UPDATE`
- `DELETE`

Transfer antar-dompet diproses melalui RPC `transfer_funds`. Setiap transfer menghasilkan dua baris transaksi:

- transaksi keluar dengan `transfer_direction = 'out'`
- transaksi masuk dengan `transfer_direction = 'in'`
- keduanya memiliki `transfer_group_id` yang sama

RPC memakai validasi ownership, validasi saldo, dan row-level locking agar transfer konkuren tidak membuat saldo negatif.

Jangan membuat transaksi `type = 'transfer'` secara manual dari client tanpa `transfer_direction` dan `transfer_group_id`.

## Scripts

| Command | Fungsi |
| :--- | :--- |
| `npm run dev` | Menjalankan development server. |
| `npm run build` | Membuat production build. |
| `npm run start` | Menjalankan production server. |
| `npm run lint` | Menjalankan ESLint. |
| `npm run typecheck` | Validasi TypeScript tanpa emit. |
| `npm run email` | Menjalankan email dev preview jika fitur email digunakan. |

## API Reliability

Endpoint finansial utama sudah mulai memakai pola berikut:

- Zod schema validation.
- Centralized API error handler.
- Sanitized error response.
- Transaction pagination dengan `limit` dan `offset`.

Contoh endpoint transaksi:

```text
GET /api/transactions?limit=100&offset=0
```

Default pagination transaksi:

- `limit = 100`
- `offset = 0`
- maksimum `limit = 500`

Jika input tidak valid, endpoint yang sudah di-hardening mengembalikan format error konsisten:

```json
{
  "error": "Validasi input gagal.",
  "code": "VALIDATION_ERROR",
  "details": {}
}
```

### API Hardening Progress

Endpoint yang sudah menjadi prioritas hardening:

- `/api/transactions`
- `/api/wallets`
- `/api/wallets/[id]/transfer`

Endpoint lain masih dalam proses standardisasi agar seluruh API memakai pola `Zod + handleApiError`. Jangan mengasumsikan semua endpoint sudah memakai error handler baru sebelum audit endpoint selesai.

## Blog & Static Rendering

Halaman blog publik menggunakan Supabase public static client di:

```text
lib/supabase/static.ts
```

Client ini dibuat dengan `@supabase/supabase-js` tanpa cookie adapter dan tanpa auth session, sehingga aman digunakan saat prerender/static generation.

Pastikan env berikut tersedia saat build lokal, Vercel Preview/Staging, dan Production:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Jika build gagal dengan pesan berikut:

```text
Missing Supabase public environment variables for static client.
```

berarti salah satu environment variable Supabase belum tersedia di environment build yang sedang digunakan.

## CI/CD

Project memiliki GitHub Actions workflow di:

```text
.github/workflows/ci.yml
```

Workflow berjalan pada push dan pull request ke branch:

- `main`
- `staging`

Pipeline menjalankan:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
```

Pastikan GitHub repository secrets memiliki:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Deployment

Untuk deployment di Vercel, tambahkan environment variables berikut pada Production dan Preview/Staging:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Setelah menambah atau mengubah environment variable di Vercel, lakukan redeploy agar variable baru masuk ke build.

## Google OAuth (Opsional)

1. Buat project di Google Cloud Console.
2. Aktifkan OAuth consent screen.
3. Buat OAuth Client ID untuk aplikasi web.
4. Tambahkan Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://domain-anda.com/auth/callback`
5. Di Supabase, buka Authentication -> Providers -> Google, lalu masukkan Client ID dan Client Secret.

## Troubleshooting

### Missing Supabase public environment variables

Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` tersedia di `.env.local`, Vercel Preview/Staging, Vercel Production, dan GitHub Secrets jika build berjalan di CI.

### Blog gagal saat build

Pastikan migration blog sudah dijalankan dan env Supabase tersedia saat build. Halaman blog menggunakan public static client, bukan SSR cookie client.

### Saldo wallet tidak sesuai

Jalankan query rekonsiliasi saldo untuk membandingkan `wallets.balance` dengan ledger `transactions`. Jika ada mismatch, audit trigger transaksi, data transfer, dan migration saldo.

### API mengembalikan `VALIDATION_ERROR`

Periksa payload request. Endpoint finansial utama menggunakan Zod validation dan akan menolak payload dengan tipe data, UUID, tanggal, atau nominal yang tidak valid.

## Struktur Project

```text
ngaturin/
├── app/
│   ├── api/                        # API Routes
│   │   ├── backup/                 # Backup & restore data
│   │   ├── billing/                # Billing, checkout, webhook
│   │   ├── budgets/                # Anggaran CRUD
│   │   ├── categories/             # Kategori CRUD
│   │   ├── debts/                  # Utang-piutang CRUD
│   │   ├── goals/                  # Target keuangan CRUD
│   │   ├── insights/               # Insights & AI endpoints
│   │   ├── investments/            # Investasi CRUD + sync
│   │   ├── recurring-bills/        # Tagihan berulang CRUD
│   │   ├── transactions/           # Transaksi CRUD + bulk
│   │   ├── user/                   # User management
│   │   └── wallets/                # Dompet CRUD + transfer
│   ├── auth/                       # Halaman autentikasi
│   ├── blog/                       # Halaman blog publik
│   ├── dashboard/                  # Halaman dashboard terproteksi
│   ├── payment/                    # Halaman payment status/instruction
│   ├── pricing/                    # Halaman harga
│   ├── privacy-policy/             # Kebijakan privasi
│   └── terms-of-service/           # Ketentuan layanan
├── components/                     # Komponen UI per domain
├── hooks/                          # Custom React hooks
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # Supabase SSR/server client
│   │   └── static.ts               # Supabase public static client
│   ├── utils/
│   │   └── api-error.ts            # Centralized API error handler
│   ├── validations/
│   │   └── finance.ts              # Zod schema untuk finance API
│   ├── dal.ts                      # Data access layer untuk Server Components
│   ├── export-utils.ts             # Export CSV/Excel/PDF
│   └── finance-api.ts              # Finance API helpers
├── supabase/
│   └── migrations/                 # SQL migration files
├── types/                          # Shared TypeScript types
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI workflow
├── eslint.config.mjs               # ESLint flat config
├── proxy.ts                        # Next.js proxy/auth middleware
└── .env.local                      # Local environment variables, tidak di-commit
```

## Lisensi

MIT

---

Dibuat dengan fokus pada reliability, keamanan data finansial, dan pengalaman pengguna yang bersih.
