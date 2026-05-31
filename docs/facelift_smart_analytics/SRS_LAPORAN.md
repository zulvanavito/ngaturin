# SRS — Fitur Laporan Ngaturin

## 1. Informasi Dokumen

**Nama Sistem:** Ngaturin  
**Nama Modul:** Laporan  
**Fitur Lama:** Smart Analytics / Smart Insights  
**Tipe Dokumen:** Software Requirements Specification  
**Versi:** 1.0 Final Draft  
**Status:** Final untuk acuan implementasi awal  
**Platform:** Web Dashboard  
**Target Route:** `/dashboard/reports`  
**Legacy Route:** `/dashboard/insights`  
**Framework:** Next.js, React, TypeScript  
**Database:** Supabase PostgreSQL  
**State Management:** Zustand  
**Chart Library:** Recharts  
**Export Library:** jsPDF, jspdf-autotable, ExcelJS, json2csv  

Dokumen ini mendefinisikan kebutuhan perangkat lunak untuk melakukan facelift total fitur Smart Analytics menjadi fitur Laporan pada aplikasi Ngaturin.

---

## 2. Tujuan Dokumen

Dokumen ini bertujuan memberikan spesifikasi teknis dan fungsional yang jelas untuk pengembangan fitur Laporan. Dokumen ini harus digunakan sebagai acuan oleh product owner, frontend developer, backend developer, QA, dan reviewer saat melakukan implementasi.

Tujuan utama dokumen ini adalah memastikan fitur Laporan:

1. Menggantikan fitur Smart Analytics lama secara penuh.
2. Menampilkan laporan keuangan bulanan yang informatif dan actionable.
3. Menggunakan data Supabase yang sudah tersedia.
4. Memisahkan kalkulasi finansial dari komponen UI.
5. Menggunakan Zustand hanya untuk filter dan UI state.
6. Menghasilkan insight AI berdasarkan calculated metrics, bukan angka buatan AI.
7. Memiliki acceptance criteria yang dapat diuji.

---

## 3. Deskripsi Sistem

Fitur Laporan adalah modul dashboard yang menampilkan analisis keuangan pengguna berdasarkan data transaksi, budget, goals, debts, wallets, categories, recurring bills, dan investments.

Fitur ini mengubah pendekatan lama dari sekadar visualisasi transaksi menjadi laporan finansial dengan alur:

```txt
Data → Diagnosis → Prediksi → Rekomendasi
```

Sistem harus mampu:

1. Mengambil data user dari Supabase dengan tetap mengikuti Row Level Security.
2. Memfilter data berdasarkan periode, kategori, wallet, dan tipe transaksi.
3. Menghitung metrik finansial utama.
4. Menampilkan skor kesehatan finansial.
5. Menampilkan grafik pemasukan, pengeluaran, kategori, dan pengeluaran harian.
6. Mengevaluasi performa budget.
7. Menampilkan progress goals.
8. Menampilkan ringkasan utang dan piutang.
9. Mendeteksi anomali secara rule-based.
10. Menghasilkan proyeksi akhir bulan.
11. Menghasilkan Insight AI berbasis hasil kalkulasi.
12. Mengekspor laporan ke PDF, Excel, dan CSV.

---

## 4. Lingkup Sistem

### 4.1 In Scope

Fitur yang termasuk dalam scope implementasi:

1. Membuat route baru `/dashboard/reports`.
2. Mengganti label menu Smart Analytics menjadi Laporan.
3. Mengalihkan atau menjaga compatibility route `/dashboard/insights`.
4. Membuat halaman Laporan dengan struktur UI baru.
5. Membuat filter periode, kategori, wallet, dan tipe transaksi.
6. Membuat Zustand store untuk state filter dan state UI.
7. Membuat calculation layer untuk seluruh metrik laporan.
8. Membuat skor kesehatan finansial.
9. Membuat kartu ringkasan pemasukan, pengeluaran, yang ditabung, dan rasio menabung.
10. Membuat chart tren pemasukan vs pengeluaran.
11. Membuat donut chart rincian pengeluaran.
12. Membuat daftar kategori teratas.
13. Membuat chart pengeluaran harian.
14. Membuat ringkasan cepat.
15. Membuat tabel performa anggaran.
16. Membuat progress goals.
17. Membuat ringkasan utang dan piutang.
18. Membuat anomaly detection rule-based.
19. Membuat proyeksi akhir bulan.
20. Membuat Insight AI berbasis calculated metrics.
21. Membuat export PDF, Excel, dan CSV.
22. Menyediakan loading state, empty state, error state, dan responsive behavior.

### 4.2 Out of Scope

Hal berikut tidak termasuk implementasi awal:

1. Integrasi bank otomatis.
2. Multi-currency.
3. Credit scoring.
4. Financial advisor berbasis chat penuh.
5. Prediksi investasi real-time.
6. Migrasi wajib kategori dari text ke foreign key.
7. Perhitungan net worth penuh berbasis seluruh aset.
8. Penyimpanan permanen AI insight di database.
9. Export chart sebagai image resolusi tinggi.
10. Integrasi pajak.

### 4.3 Modul yang Terdampak

1. Sidebar navigation.
2. Dashboard route.
3. Smart Analytics legacy route.
4. Supabase data fetching.
5. Client-side report page.
6. Export utilities.
7. AI insight utilities.
8. Shared finance formatting utilities.

---

## 5. Aktor Sistem

### 5.1 Authenticated User

Pengguna yang sudah login dan memiliki akses ke dashboard Ngaturin.

Hak akses:

1. Melihat laporan keuangan pribadinya.
2. Mengubah filter laporan.
3. Membuat Insight AI.
4. Mengekspor laporan.
5. Melihat empty state jika data belum tersedia.

### 5.2 System

Sistem Ngaturin bertanggung jawab untuk:

1. Mengambil data user sesuai session.
2. Memastikan data mengikuti RLS Supabase.
3. Menghitung seluruh metrik laporan.
4. Menampilkan UI laporan.
5. Menangani loading, empty, dan error state.
6. Membuat file export.

### 5.3 AI Service

AI service bertugas:

1. Menerima calculated metrics.
2. Membuat narasi insight.
3. Menyusun rekomendasi berdasarkan data yang diberikan.
4. Tidak membuat angka baru di luar input sistem.

### 5.4 Developer / Admin Teknis

Developer menggunakan dokumen ini untuk:

1. Implementasi fitur.
2. Review logic kalkulasi.
3. Pengujian edge case.
4. Maintenance modul laporan.

---

## 6. Asumsi Teknis

1. User sudah login sebelum mengakses `/dashboard/reports`.
2. Supabase RLS aktif pada seluruh tabel relevan.
3. Data yang dikirim ke client sudah milik user aktif.
4. Periode default adalah bulan berjalan.
5. `transactions.type` hanya bernilai `income`, `expense`, atau `transfer`.
6. `budgets.month` menggunakan format string konsisten `YYYY-MM`.
7. `transactions.category`, `budgets.category`, dan `recurring_bills.category` masih berbasis text.
8. Transfer tidak dihitung sebagai pemasukan atau pengeluaran utama.
9. Zustand digunakan untuk UI state dan filter state, bukan server state.
10. AI insight tidak menjadi sumber angka utama.
11. Jika data periode sebelumnya tidak tersedia, sistem tidak boleh mengarang tren.
12. Jika data kosong, sistem menampilkan empty state, bukan error.
13. Export hanya diproses saat user menekan tombol export.

---

## 7. Dependensi Sistem

### 7.1 Frontend

1. Next.js.
2. React.
3. TypeScript.
4. Tailwind CSS.
5. lucide-react.
6. Recharts.
7. Zustand.

### 7.2 Backend / Database

1. Supabase Auth.
2. Supabase PostgreSQL.
3. Supabase Row Level Security.
4. Tabel `transactions`.
5. Tabel `budgets`.
6. Tabel `categories`.
7. Tabel `wallets`.
8. Tabel `recurring_bills`.
9. Tabel `debts`.
10. Tabel `goals`.
11. Tabel `investments`.
12. Tabel `investment_transactions` jika diperlukan.
13. Tabel `investment_history` jika diperlukan.

### 7.3 Export

1. jsPDF.
2. jspdf-autotable.
3. ExcelJS.
4. json2csv.

### 7.4 Optional AI Layer

AI layer dapat berupa existing AI service internal Ngaturin. AI hanya menerima aggregated/calculated metrics.

---

## 8. Struktur Route

### 8.1 Route Baru

```txt
/dashboard/reports
```

Route ini menjadi route utama fitur Laporan.

### 8.2 Route Lama

```txt
/dashboard/insights
```

Route lama harus diarahkan ke `/dashboard/reports` atau tetap ada sebagai compatibility route sementara.

### 8.3 Sidebar Requirement

1. Label menu lama `Smart Analytics` harus diganti menjadi `Laporan`.
2. Icon disarankan menggunakan `BarChart3`, `FileText`, atau icon laporan lain dari lucide-react.
3. Saat user berada di `/dashboard/reports`, menu Laporan harus aktif.
4. Jika route lama `/dashboard/insights` masih dipakai, active state tetap mengarah ke menu Laporan.

### 8.4 Routing Acceptance Criteria

1. User login dapat membuka `/dashboard/reports`.
2. User yang belum login diarahkan sesuai auth guard existing.
3. `/dashboard/insights` tidak lagi menampilkan Smart Analytics lama setelah migrasi selesai.
4. Tidak ada broken navigation dari sidebar.

---

## 9. Struktur File

### 9.1 App Route

```txt
app/dashboard/reports/page.tsx
app/dashboard/reports/reports-client-view.tsx
```

Optional compatibility route:

```txt
app/dashboard/insights/page.tsx
```

### 9.2 Components

```txt
components/reports/report-header.tsx
components/reports/report-filters.tsx
components/reports/financial-health-score.tsx
components/reports/report-summary-cards.tsx
components/reports/income-expense-trend.tsx
components/reports/expense-breakdown-chart.tsx
components/reports/top-categories-card.tsx
components/reports/daily-expense-chart.tsx
components/reports/quick-summary-card.tsx
components/reports/budget-performance-table.tsx
components/reports/goals-progress-card.tsx
components/reports/debt-summary-card.tsx
components/reports/ai-insight-report.tsx
components/reports/report-export-card.tsx
```

### 9.3 Hooks dan Store

```txt
hooks/use-financial-report.ts
stores/use-report-store.ts
```

### 9.4 Library

```txt
lib/reports/calculations.ts
lib/reports/formatters.ts
lib/reports/report-export.ts
lib/reports/report-types.ts
lib/reports/anomaly-rules.ts
lib/reports/projections.ts
```

### 9.5 Testing Files

```txt
lib/reports/__tests__/calculations.test.ts
lib/reports/__tests__/anomaly-rules.test.ts
lib/reports/__tests__/projections.test.ts
```

---

## 10. State Management Requirement

### 10.1 Keputusan State Management

Fitur Laporan menggunakan Zustand untuk menyimpan state UI dan filter laporan.

Zustand tidak digunakan sebagai source of truth untuk data Supabase dan tidak digunakan untuk menyimpan seluruh raw financial data.

### 10.2 State yang Disimpan di Zustand

1. `selectedMonth`.
2. `selectedCategory`.
3. `selectedWallet`.
4. `selectedType`.
5. `trendInterval`.
6. `viewMode`.
7. `isInsightExpanded`.
8. `generatedInsight` sementara.
9. `lastGeneratedInsightAt`.

### 10.3 State yang Tidak Boleh Disimpan di Zustand

1. Seluruh array transaksi mentah.
2. Seluruh array budget mentah.
3. Seluruh array goals mentah.
4. Seluruh array debts mentah.
5. Seluruh array investments mentah.
6. Full report result besar yang dapat dihitung ulang.
7. Data finansial sensitif yang tidak perlu menjadi global state.

### 10.4 Type State

```ts
export type TransactionTypeFilter = "all" | "income" | "expense" | "transfer";
export type TrendInterval = "daily" | "weekly" | "monthly" | "yearly";
export type ReportViewMode = "overview" | "budget" | "goals" | "ai";

export interface ReportFilters {
  selectedMonth: string;
  selectedCategory: string;
  selectedWallet: string;
  selectedType: TransactionTypeFilter;
}

export interface GeneratedInsight {
  summary: string;
  comparison?: string;
  topCategoriesInsight?: string;
  anomalies: string[];
  projection?: string;
  recommendations: string[];
  generatedAt: string;
}
```

### 10.5 Store Interface

```ts
export interface ReportStoreState {
  filters: ReportFilters;
  trendInterval: TrendInterval;
  viewMode: ReportViewMode;
  isInsightExpanded: boolean;
  generatedInsight: GeneratedInsight | null;

  setSelectedMonth: (month: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedWallet: (wallet: string) => void;
  setSelectedType: (type: TransactionTypeFilter) => void;
  setTrendInterval: (interval: TrendInterval) => void;
  setViewMode: (mode: ReportViewMode) => void;
  setInsightExpanded: (value: boolean) => void;
  setGeneratedInsight: (insight: GeneratedInsight | null) => void;
  resetFilters: () => void;
}
```

### 10.6 Rules

1. Perubahan filter harus membuat `generatedInsight` menjadi `null` atau stale.
2. Store tidak menggunakan persist pada fase awal.
3. Jika persist digunakan pada fase berikutnya, hanya preferensi UI non-sensitif yang boleh disimpan.
4. Data transaksi mentah tidak boleh dipersist ke localStorage.
5. Store harus tetap kecil dan mudah diuji.

---

## 11. Data Fetching Requirement

### 11.1 Data yang Diambil

Halaman Laporan membutuhkan data berikut:

1. Transactions.
2. Budgets.
3. Categories.
4. Wallets.
5. Recurring bills.
6. Debts.
7. Goals.
8. Investments.
9. Investment transactions jika dibutuhkan untuk laporan investasi.
10. Investment history jika dibutuhkan untuk histori investasi.

### 11.2 Source Tables

#### `transactions`

Digunakan untuk total pemasukan, pengeluaran, net cashflow, tren, kategori, harian, dan proyeksi.

Kolom relevan:

1. `id`.
2. `user_id`.
3. `description`.
4. `amount`.
5. `category`.
6. `type`.
7. `date`.
8. `wallet_id`.
9. `bill_id`.
10. `debt_id`.
11. `created_at`.
12. `updated_at`.

#### `budgets`

Digunakan untuk performa anggaran.

Kolom relevan:

1. `id`.
2. `user_id`.
3. `category`.
4. `amount`.
5. `month`.
6. `created_at`.
7. `updated_at`.

#### `categories`

Digunakan untuk label, icon, tipe kategori, dan budget group.

Kolom relevan:

1. `id`.
2. `user_id`.
3. `name`.
4. `icon`.
5. `type`.
6. `budget_group`.
7. `created_at`.

#### `wallets`

Digunakan untuk filter wallet dan informasi dompet.

Kolom relevan:

1. `id`.
2. `user_id`.
3. `name`.
4. `icon`.
5. `type`.
6. `color`.
7. `is_default`.

#### `recurring_bills`

Digunakan untuk komitmen bulanan dan tagihan rutin.

Kolom relevan:

1. `id`.
2. `user_id`.
3. `name`.
4. `amount`.
5. `category`.
6. `due_day`.
7. `is_active`.
8. `billing_cycle`.
9. `plan_name`.
10. `is_autopay`.

#### `debts`

Digunakan untuk utang dan piutang.

Kolom relevan:

1. `id`.
2. `user_id`.
3. `type`.
4. `person_name`.
5. `amount`.
6. `paid_amount`.
7. `description`.
8. `due_date`.
9. `is_settled`.

#### `goals`

Digunakan untuk progress target finansial.

Kolom relevan:

1. `id`.
2. `user_id`.
3. `title`.
4. `description`.
5. `target_amount`.
6. `current_amount`.
7. `deadline`.
8. `category`.
9. `color`.
10. `is_completed`.
11. `is_auto_save`.
12. `auto_save_amount`.

#### `investments`

Digunakan untuk ringkasan aset investasi.

Kolom relevan:

1. `id`.
2. `user_id`.
3. `name`.
4. `type`.
5. `amount`.
6. `total_invested`.
7. `current_value`.

### 11.3 Filtering Data

1. User filtering dilakukan melalui session dan RLS.
2. Periode default adalah bulan berjalan.
3. Untuk kebutuhan perbandingan, sistem harus mengambil data periode aktif dan periode sebelumnya.
4. Jika data diambil secara server-side, query transaksi sebaiknya dibatasi berdasarkan rentang tanggal yang diperlukan.
5. Jika data diambil lebih luas, filtering periode dapat dilakukan di calculation layer.

### 11.4 Security Requirement

1. Query harus mengikuti RLS.
2. User tidak boleh menerima data user lain.
3. Export hanya boleh berisi data user aktif.
4. AI service tidak menerima data mentah yang tidak diperlukan.

---

## 12. Functional Requirements

### FR-001 — Menampilkan Halaman Laporan

Sistem harus menyediakan halaman Laporan di `/dashboard/reports`.

**Acceptance Criteria:**

1. Halaman dapat diakses oleh user yang login.
2. Judul halaman adalah `Laporan`.
3. Subtitle halaman adalah `Analisis kebiasaan keuanganmu.`
4. Sidebar menampilkan menu Laporan sebagai aktif.
5. Halaman tidak menampilkan judul `Smart Analytics` sebagai judul utama.

### FR-002 — Redirect atau Compatibility Route Lama

Sistem harus menangani route lama `/dashboard/insights`.

**Acceptance Criteria:**

1. Route lama tidak menampilkan UI Smart Analytics lama.
2. Route lama diarahkan ke `/dashboard/reports` atau merender komponen Laporan yang sama.
3. Tidak ada broken link dari navigasi lama.

### FR-003 — Filter Periode

Sistem harus menyediakan filter periode laporan.

**Input:**

1. `selectedMonth` dalam format `YYYY-MM`.

**Behavior:**

1. Default adalah bulan berjalan.
2. Perubahan bulan memperbarui seluruh laporan.
3. Perubahan bulan mereset generated insight.

**Acceptance Criteria:**

1. Semua metrik mengikuti periode aktif.
2. Tidak ada data periode lain yang tercampur.
3. Jika bulan masa depan dipilih, sistem menampilkan empty state.

### FR-004 — Filter Kategori

Sistem harus menyediakan filter kategori.

**Input:**

1. `selectedCategory`.
2. Default: `all`.

**Acceptance Criteria:**

1. Jika kategori dipilih, transaksi yang dianalisis hanya kategori tersebut.
2. Jika `all`, semua kategori masuk.
3. Filter kategori memengaruhi chart, ringkasan, dan export transaksi.

### FR-005 — Filter Wallet

Sistem harus menyediakan filter wallet.

**Input:**

1. `selectedWallet`.
2. Default: `all`.

**Acceptance Criteria:**

1. Jika wallet dipilih, transaksi yang dianalisis hanya transaksi dari wallet tersebut.
2. Jika `all`, semua wallet masuk.
3. Wallet yang sudah tidak memiliki transaksi tetap dapat tidak ditampilkan pada opsi filter jika tidak relevan.

### FR-006 — Filter Tipe Transaksi

Sistem harus menyediakan filter tipe transaksi.

**Input:**

1. `all`.
2. `income`.
3. `expense`.
4. `transfer`.

**Acceptance Criteria:**

1. Filter memengaruhi daftar transaksi dan export.
2. Metrik utama tetap mengikuti business rules:
   - Pemasukan dihitung dari `income`.
   - Pengeluaran dihitung dari `expense`.
   - Transfer tidak memengaruhi cashflow utama.

### FR-007 — Menghitung Ringkasan Keuangan

Sistem harus menghitung pemasukan, pengeluaran, net cashflow, dan rasio menabung.

**Formula:**

```txt
totalIncome = sum(amount where type = income)
totalExpense = sum(amount where type = expense)
netCashflow = totalIncome - totalExpense
savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0
```

**Acceptance Criteria:**

1. `savingsRate` tidak boleh NaN.
2. Nilai negatif ditampilkan dengan format yang jelas.
3. Semua nominal diformat Rupiah.
4. Transfer tidak masuk perhitungan income atau expense utama.

### FR-008 — Menghitung Skor Kesehatan Finansial

Sistem harus menghitung financial health score berdasarkan beberapa dimensi.

**Dimensi:**

1. Rasio tabungan.
2. Disiplin anggaran.
3. Cashflow.
4. Kesehatan utang.
5. Konsistensi pengeluaran.

**Skor Maksimal:** 100.

**Acceptance Criteria:**

1. Skor minimal 0.
2. Skor maksimal 100.
3. Breakdown dimensi tampil di UI.
4. Jika data budget tidak tersedia, skor diberi label `Estimasi`.
5. Jika data kurang dari 7 hari, konsistensi pengeluaran diberi catatan data belum cukup.

### FR-009 — Menampilkan Kartu Ringkasan Utama

Sistem harus menampilkan empat kartu ringkasan:

1. Yang Ditabung.
2. Rasio Menabung.
3. Pemasukan.
4. Pengeluaran.

**Acceptance Criteria:**

1. Card tampil di bawah skor kesehatan finansial.
2. Nilai sesuai periode aktif.
3. Card tetap tampil walaupun nilai 0.
4. Nominal diformat Rupiah.

### FR-010 — Menampilkan Tren Pemasukan vs Pengeluaran

Sistem harus menampilkan chart pemasukan dan pengeluaran.

**Output Data:**

```ts
export interface IncomeExpenseTrendPoint {
  label: string;
  income: number;
  expense: number;
  net: number;
}
```

**Acceptance Criteria:**

1. Chart menampilkan income dan expense.
2. Tooltip menampilkan income, expense, dan net.
3. Empty state tampil jika data kosong.
4. Chart memiliki legenda yang jelas.

### FR-011 — Menampilkan Rincian Pengeluaran

Sistem harus menampilkan donut chart pengeluaran per kategori.

**Output Data:**

```ts
export interface ExpenseBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
  icon?: string;
}
```

**Acceptance Criteria:**

1. Hanya transaksi expense yang dihitung.
2. Data diurutkan dari nominal terbesar.
3. Persentase tidak boleh NaN.
4. Jika total expense 0, chart menampilkan empty state.

### FR-012 — Menampilkan Kategori Teratas

Sistem harus menampilkan maksimal lima kategori pengeluaran terbesar.

**Output Data:**

```ts
export interface TopCategoryItem {
  category: string;
  amount: number;
  percentage: number;
  trend: "up" | "down" | "stable" | "no_comparison";
  trendPercentage?: number;
}
```

**Acceptance Criteria:**

1. Maksimal lima kategori ditampilkan.
2. Jika data periode sebelumnya tidak ada, trend bernilai `no_comparison`.
3. Sistem tidak boleh mengarang tren.

### FR-013 — Menampilkan Pengeluaran Harian

Sistem harus menampilkan chart pengeluaran harian.

**Output Data:**

```ts
export interface DailyExpensePoint {
  date: string;
  day: number;
  amount: number;
  isHighest: boolean;
}
```

**Acceptance Criteria:**

1. Semua tanggal pada bulan aktif tersedia dalam data chart.
2. Tanggal tanpa transaksi bernilai 0.
3. Hari terboros diberi highlight.
4. Tooltip menampilkan tanggal dan nominal.

### FR-014 — Menampilkan Ringkasan Cepat

Sistem harus menampilkan ringkasan perilaku harian.

**Output:**

```ts
export interface QuickSummary {
  averageDailyExpense: number;
  highestExpenseDay: {
    date: string | null;
    amount: number;
  };
  totalTransactions: number;
  noSpendDays: number;
}
```

**Acceptance Criteria:**

1. Rata-rata memakai jumlah hari relevan.
2. Jika tidak ada transaksi, hari terboros bernilai null atau tampil sebagai empty state.
3. Hari tanpa pengeluaran dihitung dari tanggal relevan pada periode aktif.

### FR-015 — Menampilkan Performa Anggaran

Sistem harus menampilkan tabel performa budget.

**Output:**

```ts
export interface BudgetPerformanceItem {
  category: string;
  allocated: number;
  realized: number;
  remaining: number;
  usedPercentage: number;
  status: "Aman" | "Waspada" | "Hampir Habis" | "Over-budget";
  timeRisk?: "normal" | "faster_than_expected";
}
```

**Acceptance Criteria:**

1. Budget tanpa transaksi tetap tampil.
2. Budget amount 0 ditangani aman.
3. Progress bar visual tidak melebihi 100%.
4. Nilai persentase tetap boleh lebih dari 100% jika over-budget.
5. Kategori over-budget diberi highlight.

### FR-016 — Menampilkan Progress Goals

Sistem harus menampilkan progress goals.

**Output:**

```ts
export interface GoalProgressItem {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  percentage: number;
  deadline: string | null;
  isCompleted: boolean;
}
```

**Acceptance Criteria:**

1. Goals kosong menampilkan empty state.
2. Progress bar capped pada 100%.
3. Nominal tetap menampilkan nilai sebenarnya.
4. Goal completed diberi badge selesai.

### FR-017 — Menampilkan Ringkasan Utang dan Piutang

Sistem harus menampilkan ringkasan debts.

**Output:**

```ts
export interface DebtSummary {
  activeDebtTotal: number;
  activeReceivableTotal: number;
  netPosition: number;
  overdueCount: number;
  nearestDueDebt?: {
    personName: string;
    dueDate: string;
    remainingAmount: number;
  };
}
```

**Rule:**

```txt
remainingAmount = max(amount - paid_amount, 0)
```

**Acceptance Criteria:**

1. Debt settled tidak dihitung.
2. Paid amount diperhitungkan.
3. Overdue diberi warning.
4. Jika tidak ada utang aktif, tampilkan pesan positif.

### FR-018 — Deteksi Anomali Rule-Based

Sistem harus mendeteksi anomali tanpa bergantung pada AI.

**Jenis Anomali:**

1. Budget hampir habis terlalu cepat.
2. Kategori over-budget.
3. Pengeluaran harian jauh di atas rata-rata.
4. Transaksi besar tidak biasa.
5. Utang overdue.
6. Goal tertinggal dari target waktu.
7. Savings rate terlalu rendah.

**Output:**

```ts
export interface ReportAnomaly {
  type: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  relatedCategory?: string;
  amount?: number;
}
```

**Acceptance Criteria:**

1. Setiap anomali memiliki severity.
2. Anomali high tampil paling atas.
3. Jika tidak ada anomali, tampilkan kondisi aman.

### FR-019 — Menghitung Proyeksi Akhir Bulan

Sistem harus menghitung prediksi pengeluaran dan tabungan akhir bulan.

**Formula:**

```txt
projectedExpense = averageDailyExpense * totalDaysInMonth
projectedSavings = totalIncome - projectedExpense
```

**Acceptance Criteria:**

1. Untuk bulan berjalan, proyeksi tampil.
2. Untuk bulan lampau, proyeksi tidak perlu tampil atau ditandai sebagai historical.
3. Jika data terlalu sedikit, confidence bernilai `low`.
4. Proyeksi tidak boleh menghasilkan NaN.

### FR-020 — Membuat Insight AI

Sistem harus membuat insight AI berdasarkan calculated report data.

**Input AI:**

1. Summary.
2. Financial health score.
3. Top categories.
4. Budget performance.
5. Goals progress.
6. Debt summary.
7. Anomalies.
8. Projection.
9. Rule-based recommendations.

**Acceptance Criteria:**

1. AI tidak membuat angka baru.
2. AI menyatakan data belum cukup jika input tidak memadai.
3. Insight tersimpan sementara di Zustand.
4. Insight direset saat filter berubah.
5. Jika AI gagal, laporan utama tetap tampil.

### FR-021 — Export PDF

Sistem harus mengekspor laporan ke PDF.

**Acceptance Criteria:**

1. File berisi ringkasan laporan.
2. File mengikuti periode aktif.
3. Nama file sesuai format `laporan-ngaturin-YYYY-MM.pdf`.
4. Jika data kosong, export dicegah atau menampilkan warning.

### FR-022 — Export Excel

Sistem harus mengekspor laporan ke Excel multi-sheet.

**Sheet:**

1. Ringkasan.
2. Transaksi.
3. Budget Performance.
4. Goals.
5. Debts.
6. Categories.

**Acceptance Criteria:**

1. File dapat dibuka.
2. Format angka terbaca sebagai number.
3. Header sheet jelas.
4. File mengikuti periode aktif.

### FR-023 — Export CSV

Sistem harus mengekspor transaksi aktif ke CSV.

**Acceptance Criteria:**

1. CSV hanya berisi transaksi sesuai filter.
2. Header kolom jelas.
3. Encoding UTF-8.
4. Nama file sesuai format `laporan-ngaturin-YYYY-MM.csv`.

### FR-024 — Empty State

Sistem harus menyediakan empty state untuk data yang tidak tersedia.

**Acceptance Criteria:**

1. Tidak ada transaksi: tampil pesan dan CTA tambah transaksi.
2. Tidak ada budget: tampil pesan dan CTA buat budget.
3. Tidak ada goals: tampil pesan dan CTA buat goals.
4. Tidak ada debt: tampil pesan positif.
5. Empty state tidak menyebabkan layout rusak.

### FR-025 — Error State

Sistem harus menangani error.

**Acceptance Criteria:**

1. Error data fetch ditampilkan dengan pesan jelas.
2. Error AI tidak merusak laporan utama.
3. Error export diberi pesan jelas.
4. Error tidak menampilkan stack trace ke user.

---

## 13. Non-Functional Requirements

### NFR-001 — Performance

1. Halaman harus dapat dirender tanpa blocking berat.
2. Kalkulasi berat harus menggunakan `useMemo` atau pure functions yang efisien.
3. Chart hanya dirender setelah data tersedia.
4. Export hanya diproses saat tombol export diklik.
5. Halaman harus tetap responsif pada dataset transaksi kecil hingga menengah.

### NFR-002 — Security

1. Semua data harus milik user aktif.
2. RLS Supabase harus tetap aktif.
3. Data finansial tidak boleh dipersist ke localStorage.
4. Export hanya memuat data user aktif.
5. Route laporan harus mengikuti auth guard existing.

### NFR-003 — Privacy

1. Raw transactions tidak boleh dikirim penuh ke AI jika tidak diperlukan.
2. AI hanya menerima aggregated metrics dan calculated report data.
3. Generated insight tidak dipersist permanen pada fase awal.
4. Data finansial tidak boleh masuk ke analytics pihak ketiga tanpa persetujuan eksplisit.

### NFR-004 — Maintainability

1. Logic kalkulasi harus dipisah dari UI.
2. Komponen harus modular.
3. TypeScript types harus eksplisit.
4. Hindari client view yang terlalu besar.
5. Export logic dipisahkan dari page component.
6. AI prompt construction dipisahkan dari UI component.

### NFR-005 — Responsiveness

1. Desktop menggunakan layout grid.
2. Mobile menggunakan single column.
3. Tabel budget pada mobile harus berubah menjadi card list atau horizontal scroll yang aman.
4. Chart memiliki tinggi minimum agar tetap terbaca.
5. Button export pada mobile harus stack vertical.

### NFR-006 — Reliability

1. Tidak boleh ada NaN pada UI.
2. Tidak boleh crash saat data kosong.
3. Semua formula harus memiliki fallback.
4. Division by zero harus dicegah.
5. Invalid date harus diabaikan atau diberi fallback aman.

### NFR-007 — Accessibility

1. Warna status tidak boleh menjadi satu-satunya indikator.
2. Chart harus memiliki tooltip dan label.
3. Button harus memiliki teks yang jelas.
4. Kontras teks harus memadai.
5. Komponen interaktif harus keyboard accessible sejauh mengikuti komponen UI existing.

### NFR-008 — Consistency

1. Format Rupiah harus konsisten di semua section.
2. Format tanggal harus konsisten menggunakan locale Indonesia.
3. Status budget harus konsisten antara UI, AI insight, dan export.
4. Angka yang sama tidak boleh berbeda antar section.

---

## 14. Business Rules

### BR-001 — Income

Transaksi dengan `type = income` dihitung sebagai pemasukan.

### BR-002 — Expense

Transaksi dengan `type = expense` dihitung sebagai pengeluaran.

### BR-003 — Transfer

Transaksi dengan `type = transfer` tidak dihitung sebagai pemasukan atau pengeluaran utama.

### BR-004 — Savings Rate

Jika total pemasukan 0, savings rate harus 0.

### BR-005 — Net Cashflow

Net cashflow dihitung dari total pemasukan dikurangi total pengeluaran.

### BR-006 — Debt Remaining Amount

Sisa utang atau piutang dihitung dengan rumus:

```txt
remainingAmount = max(amount - paid_amount, 0)
```

### BR-007 — Settled Debt

Debt dengan `is_settled = true` tidak dihitung sebagai aktif.

### BR-008 — Budget Usage

Budget usage dihitung dengan rumus:

```txt
usedPercentage = allocated > 0 ? (realized / allocated) * 100 : 0
```

### BR-009 — Budget Amount 0

Budget dengan amount 0 tidak boleh menyebabkan division by zero.

### BR-010 — Budget Status

Status budget berdasarkan persentase:

1. 0–60%: Aman.
2. 61–85%: Waspada.
3. 86–100%: Hampir Habis.
4. >100%: Over-budget.

### BR-011 — Budget Time Risk

Jika pemakaian aktual lebih dari expected usage + 25%, sistem memberi tanda `faster_than_expected`.

```txt
expectedUsage = elapsedDays / totalDaysInMonth * 100
```

### BR-012 — Goal Progress

Goal progress dihitung dengan rumus:

```txt
percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
```

### BR-013 — Goal Progress Visual Cap

Progress visual maksimal 100%, walaupun nilai aktual lebih dari 100%.

### BR-014 — Previous Period Trend

Trend hanya boleh dihitung jika data periode sebelumnya tersedia.

### BR-015 — AI Number Rule

AI tidak boleh membuat angka baru yang tidak tersedia dalam calculated report data.

### BR-016 — Projection

Proyeksi akhir bulan hanya relevan untuk bulan berjalan.

### BR-017 — No Spend Days

Hari tanpa pengeluaran dihitung dari tanggal relevan yang total expense-nya 0.

---

## 15. Calculation Functions

### 15.1 `filterTransactions`

**Input:**

1. Transactions.
2. Report filters.

**Output:**

Filtered transactions.

**Rules:**

1. Filter berdasarkan bulan.
2. Filter berdasarkan kategori jika bukan `all`.
3. Filter berdasarkan wallet jika bukan `all`.
4. Filter berdasarkan tipe jika bukan `all`.
5. Invalid date diabaikan.

### 15.2 `calculateSummary`

**Input:** Filtered transactions.

**Output:**

1. `totalIncome`.
2. `totalExpense`.
3. `netCashflow`.
4. `savingsRate`.

### 15.3 `calculateFinancialHealthScore`

**Input:**

1. Summary.
2. Budget performance.
3. Debt summary.
4. Daily expense data.
5. Selected month context.

**Output:** Financial health score.

**Score Components:**

1. Rasio tabungan: maksimum 25.
2. Disiplin anggaran: maksimum 25.
3. Cashflow: maksimum 20.
4. Kesehatan utang: maksimum 15.
5. Konsistensi pengeluaran: maksimum 15.

### 15.4 `calculateIncomeExpenseTrend`

**Input:**

1. Filtered transactions.
2. Selected month.
3. Trend interval.

**Output:** Array `IncomeExpenseTrendPoint`.

### 15.5 `calculateExpenseBreakdown`

**Input:**

1. Expense transactions.
2. Categories.

**Output:** Array `ExpenseBreakdownItem`.

### 15.6 `calculateTopCategories`

**Input:**

1. Current period expense transactions.
2. Previous period expense transactions.

**Output:** Array `TopCategoryItem`.

### 15.7 `calculateDailyExpenses`

**Input:**

1. Expense transactions.
2. Selected month.

**Output:** Array `DailyExpensePoint`.

### 15.8 `calculateQuickSummary`

**Input:**

1. Filtered transactions.
2. Daily expense points.
3. Selected month context.

**Output:** `QuickSummary`.

### 15.9 `calculateBudgetPerformance`

**Input:**

1. Budgets.
2. Expense transactions.
3. Selected month context.

**Output:** Array `BudgetPerformanceItem`.

### 15.10 `calculateGoalsProgress`

**Input:** Goals.

**Output:** Array `GoalProgressItem`.

### 15.11 `calculateDebtSummary`

**Input:** Debts.

**Output:** `DebtSummary`.

### 15.12 `detectAnomalies`

**Input:**

1. Summary.
2. Budget performance.
3. Daily expenses.
4. Goals progress.
5. Debt summary.
6. Projection.

**Output:** Array `ReportAnomaly`.

### 15.13 `calculateProjections`

**Input:**

1. Summary.
2. Daily expense data.
3. Selected month.

**Output:** `ReportProjection`.

### 15.14 `generateRuleBasedRecommendations`

**Input:**

1. Anomalies.
2. Budget performance.
3. Projection.
4. Goals progress.
5. Debt summary.

**Output:** Array recommendation strings.

---

## 16. Type Definitions

### 16.1 Report Summary

```ts
export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  savingsRate: number;
}
```

### 16.2 Score Dimension

```ts
export interface ScoreDimension {
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: "good" | "warning" | "danger" | "neutral";
  note?: string;
}
```

### 16.3 Financial Health Score

```ts
export interface FinancialHealthScore {
  score: number;
  status: "Sangat Sehat" | "Sehat" | "Waspada" | "Kritis";
  isEstimated: boolean;
  dimensions: {
    savingsRatio: ScoreDimension;
    budgetDiscipline: ScoreDimension;
    cashflow: ScoreDimension;
    debtHealth: ScoreDimension;
    spendingConsistency: ScoreDimension;
  };
}
```

### 16.4 Income Expense Trend Point

```ts
export interface IncomeExpenseTrendPoint {
  label: string;
  income: number;
  expense: number;
  net: number;
}
```

### 16.5 Expense Breakdown Item

```ts
export interface ExpenseBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
  icon?: string;
}
```

### 16.6 Top Category Item

```ts
export interface TopCategoryItem {
  category: string;
  amount: number;
  percentage: number;
  trend: "up" | "down" | "stable" | "no_comparison";
  trendPercentage?: number;
}
```

### 16.7 Daily Expense Point

```ts
export interface DailyExpensePoint {
  date: string;
  day: number;
  amount: number;
  isHighest: boolean;
}
```

### 16.8 Quick Summary

```ts
export interface QuickSummary {
  averageDailyExpense: number;
  highestExpenseDay: {
    date: string | null;
    amount: number;
  };
  totalTransactions: number;
  noSpendDays: number;
}
```

### 16.9 Budget Performance Item

```ts
export interface BudgetPerformanceItem {
  category: string;
  allocated: number;
  realized: number;
  remaining: number;
  usedPercentage: number;
  status: "Aman" | "Waspada" | "Hampir Habis" | "Over-budget";
  timeRisk?: "normal" | "faster_than_expected";
}
```

### 16.10 Goal Progress Item

```ts
export interface GoalProgressItem {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  percentage: number;
  deadline: string | null;
  isCompleted: boolean;
}
```

### 16.11 Debt Summary

```ts
export interface DebtSummary {
  activeDebtTotal: number;
  activeReceivableTotal: number;
  netPosition: number;
  overdueCount: number;
  nearestDueDebt?: {
    personName: string;
    dueDate: string;
    remainingAmount: number;
  };
}
```

### 16.12 Report Anomaly

```ts
export interface ReportAnomaly {
  type: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  relatedCategory?: string;
  amount?: number;
}
```

### 16.13 Report Projection

```ts
export interface ReportProjection {
  projectedExpense: number;
  projectedSavings: number;
  confidence: "low" | "medium" | "high";
  note?: string;
}
```

### 16.14 Financial Report Result

```ts
export interface FinancialReportResult {
  summary: ReportSummary;
  financialHealthScore: FinancialHealthScore;
  incomeExpenseTrend: IncomeExpenseTrendPoint[];
  expenseBreakdown: ExpenseBreakdownItem[];
  topCategories: TopCategoryItem[];
  dailyExpenses: DailyExpensePoint[];
  quickSummary: QuickSummary;
  budgetPerformance: BudgetPerformanceItem[];
  goalsProgress: GoalProgressItem[];
  debtSummary: DebtSummary;
  anomalies: ReportAnomaly[];
  projection: ReportProjection;
  recommendations: string[];
}
```

---

## 17. UI Requirements

### 17.1 Visual Direction

UI mengikuti arah visual referensi dashboard laporan finansial modern:

1. Background terang.
2. Card putih dengan rounded besar.
3. Shadow halus.
4. Aksen hijau khas Ngaturin.
5. Angka utama besar dan tebal.
6. Chart minimalis.
7. Section tersusun dari ringkasan ke detail.
8. Insight AI berada setelah data utama.

### 17.2 Layout Desktop

Urutan section:

1. Header dan filter.
2. Skor kesehatan finansial.
3. Kartu ringkasan utama.
4. Tren pemasukan vs pengeluaran.
5. Rincian pengeluaran dan kategori teratas.
6. Pengeluaran harian dan ringkasan cepat.
7. Performa anggaran.
8. Progress goals.
9. Ringkasan utang/piutang.
10. Insight AI.
11. Export laporan.

### 17.3 Layout Mobile

1. Semua section menjadi single column.
2. Chart memiliki tinggi minimum 280px.
3. Budget table berubah menjadi card list atau horizontal scroll.
4. Export button ditampilkan stacked vertical.
5. Tidak boleh ada horizontal overflow yang merusak layout.

### 17.4 Header UI

Header harus menampilkan:

1. Judul `Laporan`.
2. Subtitle `Analisis kebiasaan keuanganmu.`
3. Filter periode.
4. Filter tambahan jika ruang cukup.
5. Tombol export atau shortcut export.

### 17.5 Financial Health Score UI

Card harus menampilkan:

1. Nilai skor.
2. Status skor.
3. Label estimasi jika data belum lengkap.
4. Breakdown dimensi.
5. Tooltip atau info formula.

### 17.6 Chart UI

1. Chart harus memiliki tooltip.
2. Chart harus memiliki empty state.
3. Legend harus jelas.
4. Warna chart harus konsisten antar section.

### 17.7 Status UI

Status harus memakai label tekstual selain warna.

Contoh:

1. Aman.
2. Waspada.
3. Hampir Habis.
4. Over-budget.
5. Estimasi.
6. Data belum cukup.

---

## 18. AI Insight Requirement

### 18.1 Prinsip AI

AI hanya digunakan untuk menarasikan dan memprioritaskan insight. AI tidak digunakan sebagai calculator utama.

### 18.2 AI Input Contract

```ts
export interface AiReportInput {
  period: string;
  summary: ReportSummary;
  financialHealthScore: FinancialHealthScore;
  topCategories: TopCategoryItem[];
  budgetPerformance: BudgetPerformanceItem[];
  goalsProgress: GoalProgressItem[];
  debtSummary: DebtSummary;
  anomalies: ReportAnomaly[];
  projection: ReportProjection;
  recommendations: string[];
}
```

### 18.3 AI Output Contract

```ts
export interface AiReportOutput {
  summary: string;
  comparison: string;
  topCategoriesInsight: string;
  anomalies: string[];
  projection: string;
  recommendations: string[];
}
```

### 18.4 AI Prompt Rules

1. Output harus berbahasa Indonesia.
2. Output harus ringkas, jelas, dan spesifik.
3. AI tidak boleh menyebut angka yang tidak tersedia di input.
4. AI harus menyatakan jika data tidak cukup.
5. AI tidak boleh memberi saran investasi spekulatif.
6. AI tidak boleh menyatakan kepastian finansial yang tidak didukung data.

### 18.5 AI Failure Handling

Jika AI gagal:

1. Laporan utama tetap tampil.
2. UI menampilkan pesan error ringan.
3. User dapat mencoba kembali.
4. Error tidak menampilkan stack trace.

---

## 19. Export Requirement

### 19.1 PDF Export

PDF menggunakan:

1. jsPDF.
2. jspdf-autotable.

Isi minimal:

1. Header laporan.
2. Periode.
3. Skor kesehatan finansial.
4. Ringkasan utama.
5. Kategori teratas.
6. Performa budget.
7. Goals progress.
8. Ringkasan utang/piutang.
9. Insight AI jika tersedia.
10. Tabel transaksi ringkas.

Nama file:

```txt
laporan-ngaturin-YYYY-MM.pdf
```

### 19.2 Excel Export

Excel menggunakan ExcelJS.

Sheet minimal:

1. Ringkasan.
2. Transaksi.
3. Budget Performance.
4. Goals.
5. Debts.
6. Categories.

Nama file:

```txt
laporan-ngaturin-YYYY-MM.xlsx
```

### 19.3 CSV Export

CSV menggunakan json2csv.

Kolom minimal:

1. `date`.
2. `category`.
3. `description`.
4. `type`.
5. `amount`.
6. `wallet`.

Nama file:

```txt
laporan-ngaturin-YYYY-MM.csv
```

### 19.4 Export Rules

1. Export mengikuti filter aktif.
2. Export disabled jika tidak ada data relevan.
3. Export error harus ditangani.
4. Angka dalam Excel harus bertipe number jika memungkinkan.
5. PDF harus tetap terbaca walaupun data panjang.

---

## 20. Testing Requirements

### 20.1 Unit Test

Unit test wajib mencakup:

1. `filterTransactions`.
2. `calculateSummary`.
3. `calculateFinancialHealthScore`.
4. `calculateIncomeExpenseTrend`.
5. `calculateExpenseBreakdown`.
6. `calculateTopCategories`.
7. `calculateDailyExpenses`.
8. `calculateQuickSummary`.
9. `calculateBudgetPerformance`.
10. `calculateGoalsProgress`.
11. `calculateDebtSummary`.
12. `detectAnomalies`.
13. `calculateProjections`.

### 20.2 Edge Case Test

Test cases:

1. Tidak ada transaksi.
2. Pemasukan 0.
3. Pengeluaran 0.
4. Hanya transaksi transfer.
5. Budget 0.
6. Goal target 0.
7. Debt paid amount lebih besar dari amount.
8. Kategori kosong.
9. Invalid date.
10. Bulan masa depan.
11. Bulan lampau.
12. Data periode sebelumnya kosong.
13. Semua budget over-budget.
14. Semua goals completed.
15. Tidak ada utang aktif.

### 20.3 UI Test

Test cases:

1. Halaman render dengan data normal.
2. Empty state muncul saat tidak ada transaksi.
3. Filter periode mengubah data.
4. Filter kategori mengubah data.
5. Filter wallet mengubah data.
6. Insight reset setelah filter berubah.
7. Export button bekerja.
8. Mobile layout tidak rusak.
9. Chart tidak crash saat data kosong.
10. Budget table tetap terbaca di mobile.

### 20.4 Integration Test

Test cases:

1. Data Supabase berhasil masuk ke report client view.
2. RLS tidak membocorkan data user lain.
3. Export memakai data filter aktif.
4. AI insight menerima calculated metrics.
5. Route lama tidak menampilkan Smart Analytics lama.

### 20.5 Acceptance Test

Skenario utama:

1. User membuka Laporan.
2. User memilih bulan berjalan.
3. User melihat skor kesehatan finansial.
4. User melihat kategori terbesar.
5. User melihat budget yang berisiko.
6. User membuat Insight AI.
7. User mengekspor PDF.

---

## 21. Migration Consideration

### 21.1 Migration Tidak Wajib untuk MVP

MVP fitur Laporan dapat dibangun menggunakan schema saat ini tanpa migrasi besar.

### 21.2 Masalah Data Saat Ini

1. Kategori masih berbasis text.
2. Budget month masih berbasis text.
3. Wallet belum terlihat memiliki saldo liquid.
4. Goals belum memiliki transaction history.
5. Ada potensi foreign key duplikat pada relasi bill transaksi.

### 21.3 Rekomendasi Migrasi Fase Lanjutan

Tambahkan `category_id`:

```sql
alter table public.transactions
add column category_id uuid references public.categories(id);

alter table public.budgets
add column category_id uuid references public.categories(id);

alter table public.recurring_bills
add column category_id uuid references public.categories(id);
```

Tambahkan saldo wallet jika fitur runway diperlukan:

```sql
alter table public.wallets
add column balance numeric default 0;
```

Tambahkan goal transaction history:

```sql
create table public.goal_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  goal_id uuid not null references public.goals(id),
  transaction_id bigint references public.transactions(id),
  amount numeric not null default 0,
  type text not null check (type in ('deposit', 'withdraw', 'adjustment')),
  note text,
  created_at timestamp with time zone default now()
);
```

### 21.4 Migration Rules

1. Migrasi schema tidak boleh memutus fitur existing.
2. Migrasi kategori harus dilakukan bertahap.
3. Data lama berbasis text harus tetap didukung selama transisi.
4. Migration harus diuji di branch atau environment development sebelum production.

---

## 22. Acceptance Criteria Global

Fitur dianggap memenuhi requirement jika:

1. Menu Smart Analytics diganti menjadi Laporan.
2. Halaman Laporan dapat diakses di `/dashboard/reports`.
3. Route lama `/dashboard/insights` tidak lagi menampilkan Smart Analytics lama.
4. Semua metrik mengikuti periode aktif.
5. Income, expense, dan transfer diperlakukan sesuai business rules.
6. Skor kesehatan finansial tampil dan tidak error.
7. Summary cards menampilkan angka yang benar.
8. Chart pemasukan vs pengeluaran tampil jika data tersedia.
9. Expense breakdown hanya menghitung expense.
10. Kategori teratas tidak mengarang tren.
11. Daily expense menampilkan tanggal tanpa transaksi sebagai 0.
12. Quick summary tidak memakai pembagi statis 30.
13. Budget performance menampilkan status yang benar.
14. Goals progress tampil dengan progress capped visual 100%.
15. Debt summary memakai sisa utang/piutang.
16. Anomaly detection berjalan tanpa AI.
17. Projection tidak menghasilkan NaN.
18. AI insight berbasis calculated data.
19. Export PDF, Excel, dan CSV mengikuti filter aktif.
20. Zustand hanya menyimpan state UI dan filter.
21. Data Supabase tidak dipersist ke localStorage.
22. Empty state tersedia.
23. Error state tersedia.
24. Halaman responsif di desktop dan mobile.
25. Tidak ada nilai NaN, undefined, atau crash pada data kosong.

---

## 23. Risiko Teknis

### 23.1 Client View Terlalu Besar

Risiko: file client view menjadi sulit dirawat jika semua logic, chart, export, dan AI berada dalam satu file.

Mitigasi:

1. Pecah komponen.
2. Pindahkan kalkulasi ke `lib/reports/calculations.ts`.
3. Pindahkan export ke `lib/reports/report-export.ts`.
4. Pindahkan type ke `lib/reports/report-types.ts`.

### 23.2 Kategori Text Tidak Konsisten

Risiko: kategori seperti `Makan`, `makan`, dan `Makanan` dianggap berbeda.

Mitigasi:

1. Normalisasi string kategori.
2. Gunakan mapping categories.
3. Rencanakan migrasi `category_id`.

### 23.3 AI Output Tidak Valid

Risiko: AI membuat angka atau tren yang tidak ada di data.

Mitigasi:

1. AI hanya menerima calculated metrics.
2. Prompt melarang angka baru.
3. UI tetap menampilkan angka dari sistem, bukan AI.
4. AI output dapat divalidasi secara ringan.

### 23.4 Export Berat

Risiko: export lambat pada dataset besar.

Mitigasi:

1. Export hanya saat user klik.
2. Beri loading state.
3. Batasi tabel transaksi jika sangat besar.
4. Optimalkan format data sebelum export.

### 23.5 Data Kosong

Risiko: UI terlihat kosong atau rusak saat data belum ada.

Mitigasi:

1. Empty state kuat.
2. CTA ke fitur terkait.
3. Seed data untuk development.

### 23.6 Formula Skor Diperdebatkan

Risiko: user tidak percaya skor kesehatan finansial.

Mitigasi:

1. Tampilkan breakdown dimensi.
2. Beri tooltip formula.
3. Gunakan label estimasi jika data belum lengkap.

### 23.7 Stale Insight

Risiko: insight lama tetap tampil setelah filter berubah.

Mitigasi:

1. Reset generated insight saat filter berubah.
2. Simpan timestamp generate.
3. Tampilkan status jika insight tidak sesuai filter aktif.

---

## 24. Deployment Plan

### Step 1 — Persiapan Struktur

1. Buat route `/dashboard/reports`.
2. Buat file `reports-client-view.tsx`.
3. Buat folder `components/reports`.
4. Buat folder `lib/reports`.
5. Buat store `use-report-store.ts`.

### Step 2 — Data Fetching

1. Ambil session user.
2. Fetch transactions.
3. Fetch budgets.
4. Fetch categories.
5. Fetch wallets.
6. Fetch recurring bills.
7. Fetch debts.
8. Fetch goals.
9. Fetch investments.

### Step 3 — Calculation Layer

1. Implementasi type definitions.
2. Implementasi filter transactions.
3. Implementasi summary.
4. Implementasi financial health score.
5. Implementasi chart data.
6. Implementasi budget performance.
7. Implementasi goals progress.
8. Implementasi debt summary.
9. Implementasi anomalies.
10. Implementasi projections.

### Step 4 — UI Core

1. Header.
2. Filters.
3. Financial health score.
4. Summary cards.
5. Income expense trend.
6. Expense breakdown.
7. Top categories.
8. Daily expense chart.
9. Quick summary.

### Step 5 — Extended Sections

1. Budget performance.
2. Goals progress.
3. Debt summary.
4. Empty states.
5. Error states.

### Step 6 — AI Insight

1. Siapkan AI input contract.
2. Buat rule-based recommendations.
3. Buat generator insight.
4. Tangani loading dan error state.
5. Reset insight saat filter berubah.

### Step 7 — Export

1. Implementasi PDF export.
2. Implementasi Excel export.
3. Implementasi CSV export.
4. Tambahkan loading dan error state.

### Step 8 — Navigation Migration

1. Update sidebar label menjadi Laporan.
2. Update icon jika perlu.
3. Redirect atau compatibility route `/dashboard/insights`.
4. Pastikan active state benar.

### Step 9 — QA

1. Unit test calculation.
2. UI test desktop.
3. UI test mobile.
4. Edge case test.
5. Export test.
6. AI insight test.

### Step 10 — Cleanup

1. Hapus atau archive komponen Smart Analytics lama yang tidak dipakai.
2. Rapikan import.
3. Pastikan build berhasil.
4. Update dokumentasi.

---

## 25. Definition of Done

Fitur Laporan dianggap selesai jika seluruh kondisi berikut terpenuhi:

1. Route `/dashboard/reports` tersedia dan dapat diakses user login.
2. Sidebar menampilkan menu `Laporan`.
3. Route lama `/dashboard/insights` tidak lagi menampilkan Smart Analytics lama.
4. Data Supabase berhasil dimuat sesuai user aktif.
5. Zustand store hanya menyimpan filter dan UI state.
6. Calculation layer terpisah dari UI.
7. Skor kesehatan finansial tampil dengan breakdown dimensi.
8. Summary cards tampil dan angkanya benar.
9. Tren pemasukan vs pengeluaran tampil.
10. Rincian pengeluaran hanya menghitung expense.
11. Kategori teratas tampil tanpa tren palsu.
12. Pengeluaran harian menampilkan tanggal tanpa transaksi.
13. Ringkasan cepat tampil.
14. Performa anggaran tampil dan statusnya benar.
15. Progress goals tampil.
16. Ringkasan utang/piutang memakai remaining amount.
17. Anomaly detection berjalan tanpa AI.
18. Proyeksi akhir bulan berjalan tanpa NaN.
19. AI insight dibuat berdasarkan calculated metrics.
20. Export PDF berhasil.
21. Export Excel berhasil.
22. Export CSV berhasil.
23. Empty state tersedia untuk data kosong.
24. Error state tersedia untuk fetch, AI, dan export.
25. Layout responsif di desktop dan mobile.
26. Tidak ada nilai NaN, undefined, atau crash pada skenario edge case utama.
27. Build project berhasil.
28. Kode lolos linting sesuai standar project.
29. Dokumentasi SRS dan PRD tersedia di repository.
30. Fitur siap masuk tahap review atau PR implementasi.


## Export Modal Reference

Spesifikasi detail untuk configurable export modal, format behavior, dataset selection, transaction field selection, paywall Free/Plus/Pro, entitlement validation, usage tracking, dan acceptance criteria export mengacu pada:

`docs/REPORTS_EXPORT_SPECIFICATION.md`

Dokumen tersebut menjadi source of truth untuk kebutuhan Export Laporan. Jika terdapat konflik antara bagian Export di SRS ini dan dokumen tersebut, maka `REPORTS_EXPORT_SPECIFICATION.md` harus diprioritaskan untuk detail export.