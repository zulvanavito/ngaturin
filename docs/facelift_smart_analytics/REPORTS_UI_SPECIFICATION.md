# REPORTS_UI_SPECIFICATION — Fitur Laporan Ngaturin

## 1. Informasi Dokumen

**Nama Sistem:** Ngaturin  
**Nama Modul:** Laporan  
**Tipe Dokumen:** UI Specification  
**Versi:** 1.0 Final Draft  
**Status:** Acuan implementasi UI frontend  
**Target Route:** `/dashboard/reports`  
**Legacy Route:** `/dashboard/insights` redirect ke `/dashboard/reports`  

Dokumen terkait:

- `docs/PRD_LAPORAN.md`
- `docs/SRS_LAPORAN.md`
- `docs/TDD_LAPORAN.md`
- `docs/REPORTS_DATA_MAPPING.md`
- `docs/REPORTS_EXPORT_SPECIFICATION.md`
- `docs/REPORTS_IMPLEMENTATION_PLAN.md`

Dokumen ini mendefinisikan spesifikasi visual dan interaksi UI untuk fitur Laporan Ngaturin, termasuk layout halaman, struktur komponen, responsive behavior, card anatomy, chart behavior, empty state, loading state, error state, export modal, paywall locked state, dan verification checklist.

---

## 2. Tujuan UI Specification

Tujuan dokumen ini adalah memastikan implementasi frontend fitur Laporan konsisten dengan arah produk dan referensi visual yang sudah dianalisis.

Dokumen ini harus membantu developer menjawab:

1. Section apa saja yang tampil di halaman Laporan?
2. Urutan section seperti apa?
3. Bagaimana grid desktop, tablet, dan mobile?
4. Bagaimana struktur card dan chart?
5. Bagaimana tampilan modal export?
6. Bagaimana locked state Free/Plus/Pro?
7. Bagaimana empty, loading, dan error state?
8. Bagaimana interaksi filter, chart, export, dan insight?

---

## 3. Prinsip Desain UI

### 3.1 Ringkas di Atas, Detail di Bawah

Halaman harus mengikuti urutan kognitif:

```txt
Status → Ringkasan → Tren → Diagnosis → Rekomendasi → Export
```

Pengguna harus bisa memahami kondisi keuangan utama dalam 10 detik pertama.

### 3.2 Data-First, AI-Second

UI harus menampilkan metrik berbasis kalkulasi terlebih dahulu. AI Insight berada setelah laporan utama agar tidak menggantikan data.

### 3.3 Card-Based Layout

Setiap section utama berada di dalam card. Ini membantu scanability dan memisahkan konteks analisis.

### 3.4 Mobile-First Safety

Pada mobile, semua section harus menjadi single column dan tidak boleh menghasilkan horizontal overflow kecuali tabel yang memang menggunakan horizontal scroll terkontrol.

### 3.5 Paywall Harus Transparan

Locked state harus menjelaskan paket yang dibutuhkan, bukan hanya menonaktifkan tombol.

---

## 4. Visual Direction

Arah visual mengikuti referensi dashboard finansial modern:

1. Background terang dan bersih.
2. Card putih dengan rounded besar.
3. Shadow halus.
4. Aksen hijau khas Ngaturin.
5. Angka utama besar dan tebal.
6. Chart minimalis.
7. Badge status yang jelas.
8. Spacing lega.
9. Ikon secukupnya.
10. Hindari tampilan padat seperti tabel admin.

---

## 5. Design Tokens Rekomendasi

Gunakan token design system existing jika sudah tersedia. Jika belum, gunakan guideline berikut.

### 5.1 Container

```txt
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6
```

### 5.2 Card

```txt
rounded-2xl lg:rounded-[2rem]
bg-white dark:bg-card
border border-border/50
shadow-sm
p-4 sm:p-5 lg:p-6
```

Jika project sudah punya komponen `Card`, gunakan komponen existing.

### 5.3 Typography

| Elemen | Rekomendasi |
| --- | --- |
| Page title | `text-2xl sm:text-3xl font-bold` |
| Section title | `text-lg sm:text-xl font-semibold` |
| Metric value | `text-2xl sm:text-3xl font-bold tabular-nums` |
| Label | `text-sm text-muted-foreground` |
| Helper text | `text-xs text-muted-foreground` |
| Badge | `text-xs font-medium` |

### 5.4 Spacing

| Context | Spacing |
| --- | --- |
| Antar section | `space-y-6` |
| Dalam card | `space-y-4` |
| Grid gap | `gap-4 sm:gap-6` |
| Header card | `mb-4` |

### 5.5 Status Color Semantic

Gunakan warna dari design system jika ada. Jangan hanya mengandalkan warna; selalu tampilkan label status.

| Status | Label |
| --- | --- |
| Good | Aman / Sehat |
| Warning | Waspada |
| Danger | Over-budget / Kritis |
| Neutral | Belum ada data / Estimasi |
| Locked | Plus / Pro |

---

## 6. Page Layout — Desktop

### 6.1 Urutan Section

```txt
1. Report Header
2. Report Filters
3. Financial Health Score
4. Summary Cards
5. Income vs Expense Trend
6. Expense Breakdown + Top Categories
7. Daily Expense + Quick Summary
8. Budget Performance
9. Goals Progress
10. Debt Summary
11. AI Insight
12. Export Card
```

### 6.2 Grid Desktop

```txt
Header: full width
Filters: full width
Financial Health Score: full width
Summary Cards: 4 columns
Income vs Expense Trend: full width
Expense Breakdown + Top Categories: 2 columns
Daily Expense + Quick Summary: 2 columns, Daily wider if needed
Budget Performance: full width
Goals + Debt: 2 columns or full width depending data density
AI Insight: full width
Export Card: full width or compact card
```

### 6.3 Suggested Layout Structure

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
  <ReportHeader />
  <ReportFilters />
  <FinancialHealthScore />
  <ReportSummaryCards />

  <IncomeExpenseTrend />

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ExpenseBreakdownChart />
    <TopCategoriesCard />
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      <DailyExpenseChart />
    </div>
    <QuickSummaryCard />
  </div>

  <BudgetPerformanceTable />

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <GoalsProgressCard />
    <DebtSummaryCard />
  </div>

  <AiInsightReport />
  <ReportExportCard />
</div>
```

---

## 7. Responsive Layout

### 7.1 Mobile

Rules:

1. Semua section single column.
2. Summary cards menjadi 1–2 kolom tergantung lebar.
3. Chart height minimal 260–300px.
4. Table budget harus menjadi card list atau horizontal scroll.
5. Filter dapat stack vertical.
6. Export modal menggunakan width hampir penuh.

Mobile container:

```txt
px-4 py-4 space-y-4
```

### 7.2 Tablet

Rules:

1. Summary cards dapat menjadi 2 kolom.
2. Chart tetap full width jika ruang kurang.
3. Expense breakdown dan top categories boleh 2 kolom pada tablet lebar.

### 7.3 Desktop

Rules:

1. Gunakan `max-w-7xl`.
2. Kombinasikan full width dan 2-column grid.
3. Jangan membuat section terlalu tinggi tanpa alasan.

---

## 8. Component Hierarchy

```txt
ReportsPage
└── ReportsClientView
    ├── ReportHeader
    ├── ReportFilters
    ├── FinancialHealthScore
    ├── ReportSummaryCards
    ├── IncomeExpenseTrend
    ├── ExpenseBreakdownChart
    ├── TopCategoriesCard
    ├── DailyExpenseChart
    ├── QuickSummaryCard
    ├── BudgetPerformanceTable
    ├── GoalsProgressCard
    ├── DebtSummaryCard
    ├── AiInsightReport
    ├── ReportExportCard
    └── ReportExportModal
```

Reusable helper components:

```txt
ReportSectionCard
ReportEmptyState
ReportLoadingSkeleton
StatusBadge
MetricCard
LockedFeatureBadge
```

---

## 9. Report Header Specification

### 9.1 Content

Title:

```txt
Laporan
```

Subtitle:

```txt
Analisis kebiasaan keuanganmu.
```

Optional right action:

```txt
Export
```

### 9.2 Layout

Desktop:

```txt
Title/subtitle left, action right
```

Mobile:

```txt
Title/subtitle top, action below or hidden into Export Card
```

### 9.3 Acceptance Criteria

1. Judul tidak lagi menggunakan `Smart Analytics`.
2. Header tetap terbaca di mobile.
3. Action tidak menyebabkan layout overflow.

---

## 10. Report Filters Specification

### 10.1 Filter Items

1. Month selector.
2. Category selector.
3. Wallet selector.
4. Transaction type selector.
5. Reset filter button.

### 10.2 Layout

Desktop:

```txt
Inline horizontal controls with wrap
```

Mobile:

```txt
Stacked controls or 2-column compact layout
```

### 10.3 Behavior

1. Perubahan filter memperbarui seluruh report.
2. Perubahan filter mereset AI insight.
3. Filter selected state harus jelas.
4. Reset filter kembali ke bulan berjalan dan all filters.

### 10.4 Empty Data Behavior

Jika options kosong:

1. Category selector tetap menampilkan `Semua Kategori`.
2. Wallet selector tetap menampilkan `Semua Dompet`.

---

## 11. Financial Health Score UI

### 11.1 Card Anatomy

```txt
[Title: Skor Kesehatan Finansial]        [Badge: Estimasi]

[Score Circle 78/100]    [Status + short summary]

Breakdown:
- Rasio Tabungan       20/25   [progress]
- Disiplin Anggaran    18/25   [progress]
- Cashflow             17/20   [progress]
- Kesehatan Utang      12/15   [progress]
- Budget Allocation    10/15   [progress]
```

### 11.2 Score Status

| Score | Status |
| ---: | --- |
| 85–100 | Sangat Sehat |
| 70–84 | Sehat |
| 50–69 | Waspada |
| 0–49 | Kritis |

### 11.3 UI Rules

1. Score harus dalam rentang 0–100.
2. Breakdown harus tampil.
3. Jika data belum cukup, tampilkan badge `Estimasi`.
4. Tooltip/info dapat menjelaskan formula ringkas.

### 11.4 Mobile Behavior

Score circle berada di atas, breakdown di bawah.

---

## 12. Summary Cards UI

### 12.1 Cards

1. Yang Ditabung.
2. Rasio Menabung.
3. Pemasukan.
4. Pengeluaran.

### 12.2 Card Anatomy

```txt
[Icon] Label
Metric Value
Small helper text / trend if available
```

### 12.3 Grid

Desktop:

```txt
4 columns
```

Tablet:

```txt
2 columns
```

Mobile:

```txt
1 or 2 columns depending width
```

### 12.4 Rules

1. Negative value harus terlihat jelas.
2. Rupiah format konsisten.
3. Jangan tampilkan NaN.

---

## 13. Chart UI Specification

### 13.1 General Chart Rules

1. Semua chart harus memiliki title.
2. Semua chart harus memiliki tooltip.
3. Semua chart harus memiliki empty state.
4. Chart tidak boleh crash saat data kosong.
5. Label dan legend harus jelas.
6. Nominal di tooltip diformat Rupiah.

### 13.2 Recharts Container

Gunakan responsive container:

```tsx
<ResponsiveContainer width="100%" height={300}>
  {...chart}
</ResponsiveContainer>
```

Mobile height minimal 260px.

### 13.3 Income Expense Trend

Chart type:

```txt
Grouped Bar Chart atau Composed Chart
```

Series:

1. Income.
2. Expense.
3. Net optional.

Tooltip:

```txt
Tanggal / interval
Pemasukan
Pengeluaran
Net
```

### 13.4 Expense Breakdown

Chart type:

```txt
Donut / Pie Chart
```

UI:

1. Donut chart.
2. Legend category.
3. Percentage.
4. Amount.

### 13.5 Daily Expense

Chart type:

```txt
Bar Chart
```

Features:

1. Semua tanggal tampil.
2. Average reference line.
3. Highest day highlight.

---

## 14. Top Categories UI

### 14.1 Content

Maksimal lima kategori.

Per item:

1. Icon.
2. Category name.
3. Amount.
4. Percentage.
5. Trend badge.

### 14.2 Trend Badge

| Trend | Label |
| --- | --- |
| up | Naik |
| down | Turun |
| stable | Stabil |
| no_comparison | Belum ada pembanding |

### 14.3 Rule

Jika `no_comparison`, jangan tampilkan seolah-olah naik/turun.

---

## 15. Quick Summary UI

### 15.1 Metrics

1. Rata-rata pengeluaran per hari.
2. Hari terboros.
3. Total transaksi.
4. Hari tanpa pengeluaran.

### 15.2 Layout

Gunakan compact metric list atau 2x2 mini cards.

### 15.3 Empty Behavior

Jika tidak ada transaksi:

1. Average = Rp0.
2. Hari terboros = Tidak tersedia.
3. Total transaksi = 0.
4. Hari tanpa pengeluaran tetap dapat dihitung dari periode relevan.

---

## 16. Budget Performance UI

### 16.1 Desktop Table Columns

1. Kategori.
2. Alokasi.
3. Realisasi.
4. Progress.
5. % Terpakai.
6. Status.

### 16.2 Mobile Layout

Gunakan card list:

```txt
Kategori                         Status
Rp realisasi / Rp alokasi
[Progress bar]
Sisa / Over-budget info
```

Jika tetap memakai table, bungkus dalam horizontal scroll.

### 16.3 Status Badge

1. Aman.
2. Waspada.
3. Hampir Habis.
4. Over-budget.

### 16.4 Rules

1. Progress visual capped 100%.
2. Persentase teks boleh lebih dari 100%.
3. Over-budget harus terlihat jelas.

---

## 17. Goals Progress UI

### 17.1 Content

Per goal:

1. Title.
2. Current amount.
3. Target amount.
4. Progress percentage.
5. Deadline.
6. Completed badge.
7. Health status optional: On Track, At Risk, Behind Schedule.

### 17.2 Layout

Card list dengan progress bar.

### 17.3 Empty State

```txt
Belum ada tujuan finansial.
```

CTA:

```txt
Buat Goals
```

---

## 18. Debt Summary UI

### 18.1 Metrics

1. Total utang aktif.
2. Total piutang aktif.
3. Posisi bersih.
4. Jumlah overdue.
5. Utang terdekat jatuh tempo.

### 18.2 Optional Detail

Debt completion percentage dapat ditampilkan jika berguna:

```txt
paid_amount / amount * 100
```

### 18.3 Empty State

```txt
Tidak ada utang aktif — kondisi kewajiban aman.
```

### 18.4 Warning State

Jika overdue > 0, tampilkan warning badge.

---

## 19. AI Insight UI

### 19.1 Placement

AI Insight berada setelah section data utama.

### 19.2 States

1. Idle: tampilkan CTA `Buat Insight`.
2. Loading: tampilkan skeleton/loading indicator.
3. Success: tampilkan insight sections.
4. Error: tampilkan error ringan dan retry button.
5. Locked: jika user tidak memiliki entitlement.

### 19.3 Content Structure

1. Ringkasan.
2. Anomali.
3. Proyeksi.
4. Rekomendasi.

### 19.4 Paywall

Free: locked.  
Plus: limited based on entitlement.  
Pro: available.

---

## 20. Export Card UI

### 20.1 Purpose

Export Card menjadi entry point ke Export Modal. Jangan langsung menjalankan download dari card.

### 20.2 Content

1. Title: `Ekspor Laporan`.
2. Description: `Unduh laporan berdasarkan periode dan filter aktif.`
3. Button: `Ekspor Data`.

### 20.3 Behavior

1. Klik membuka `ReportExportModal`.
2. Card dapat menampilkan plan badge jika ada fitur locked.
3. Jika data kosong, button bisa disabled atau tetap membuka modal dengan empty state.

---

## 21. Export Modal UI

Detail lengkap Export Modal mengacu pada:

```txt
docs/REPORTS_EXPORT_SPECIFICATION.md
```

### 21.1 Modal Summary

Modal harus memiliki:

1. Title `Ekspor Data`.
2. Close button.
3. Format selector.
4. Date range.
5. Dataset selection.
6. Transaction field selector.
7. Locked state.
8. Download button.

### 21.2 Format Selector

Options:

1. PDF.
2. Excel (.xlsx).
3. CSV.

### 21.3 MVP PDF Decision

Untuk MVP, PDF tidak wajib menyertakan chart visual orisinal dari Recharts. PDF cukup berisi:

1. Ringkasan teks terstruktur.
2. Skor.
3. Metrik utama.
4. Insight jika tersedia.
5. Tabel data penting.

### 21.4 Locked State

Free:

1. CSV terbuka.
2. Excel locked.
3. PDF locked.
4. AI locked.

Plus:

1. CSV terbuka.
2. Excel terbuka.
3. PDF terbuka.
4. AI terbatas.
5. Investment Snapshot locked.
6. Advanced Trends locked.

Pro:

1. Semua fitur export lanjutan terbuka.

---

## 22. Locked Feature UI

### 22.1 Anatomy

```txt
[Lock Icon] Feature Name              [Badge: Plus/Pro]
Description kecil
CTA optional: Upgrade
```

### 22.2 Rules

1. Locked item tidak boleh selectable.
2. Locked item harus menjelaskan paket minimum.
3. Jangan menyembunyikan seluruh fitur premium; tampilkan sebagai upsell ringan.
4. Jangan menghalangi penggunaan fitur Free.

---

## 23. Loading States

### 23.1 Page Loading

Gunakan skeleton layout:

1. Header skeleton.
2. Filter skeleton.
3. Summary card skeleton.
4. Chart skeleton.
5. Table skeleton.

### 23.2 Chart Loading

Gunakan placeholder card dengan height yang sama agar layout tidak shift besar.

### 23.3 Export Loading

Button `Unduh` berubah menjadi loading state:

```txt
Membuat file...
```

### 23.4 AI Loading

Gunakan loading state terpisah:

```txt
Menganalisis laporan...
```

---

## 24. Empty States

### 24.1 No Transactions

```txt
Belum ada transaksi untuk periode ini.
Tambahkan transaksi agar laporan bisa dibuat.
```

CTA:

```txt
Tambah Transaksi
```

### 24.2 No Budget

```txt
Belum ada budget untuk periode ini.
```

CTA:

```txt
Buat Budget
```

### 24.3 No Goals

```txt
Belum ada tujuan finansial.
```

CTA:

```txt
Buat Goals
```

### 24.4 No Debt

```txt
Tidak ada utang aktif — kondisi kewajiban aman.
```

### 24.5 No AI Insight

```txt
Insight belum dibuat untuk periode ini.
```

CTA:

```txt
Buat Insight
```

---

## 25. Error States

### 25.1 Data Fetch Error

```txt
Terdapat masalah saat memuat laporan. Coba muat ulang halaman.
```

### 25.2 AI Error

```txt
Insight AI belum bisa dibuat saat ini. Data laporan tetap tersedia.
```

### 25.3 Export Error

```txt
Export gagal. Periksa data laporan dan coba lagi.
```

### 25.4 Chart Error

Chart error tidak boleh menjatuhkan seluruh halaman. Tampilkan fallback card.

---

## 26. Interaction Behavior

### 26.1 Filter Change

Saat filter berubah:

1. Recalculate report.
2. Reset generated AI insight.
3. Update chart and cards.
4. Export uses new filtered data.

### 26.2 Export Flow

```txt
Click Export Card button
→ Open Modal
→ Select format/dataset/fields
→ Validate entitlement
→ Generate file
→ Record usage event
→ Show success or error
```

### 26.3 AI Flow

```txt
Click Buat Insight
→ Validate entitlement
→ Build calculated metrics payload
→ Generate insight
→ Store temporary result
→ Render insight
```

---

## 27. Accessibility Requirements

1. Modal harus focus-trapped jika menggunakan Dialog component.
2. Close button memiliki accessible label.
3. Checkbox memiliki label eksplisit.
4. Select memiliki label atau aria-label.
5. Warna status tidak menjadi satu-satunya indikator.
6. Chart memiliki tooltip dan ringkasan data tekstual.
7. Button disabled harus memiliki alasan yang jelas di UI.
8. Locked item harus terbaca sebagai locked/premium.

---

## 28. QA Checklist UI

### 28.1 Desktop

- [ ] Header tampil benar.
- [ ] Filter inline/wrap dengan baik.
- [ ] Summary cards 4 kolom.
- [ ] Chart tampil tanpa overflow.
- [ ] Budget table terbaca.
- [ ] Goals dan debt card sejajar.
- [ ] Export modal berada di tengah.

### 28.2 Mobile

- [ ] Semua section single column.
- [ ] Tidak ada horizontal overflow global.
- [ ] Chart terbaca.
- [ ] Budget table/card usable.
- [ ] Export modal tidak keluar layar.
- [ ] Button mudah ditekan.

### 28.3 Empty State

- [ ] No transactions.
- [ ] No budgets.
- [ ] No goals.
- [ ] No debt.
- [ ] No insight.

### 28.4 Paywall

- [ ] Free melihat CSV unlocked dan Excel/PDF locked.
- [ ] Plus melihat Excel/PDF unlocked dan Investment/Advanced locked.
- [ ] Pro melihat fitur export lanjutan unlocked.
- [ ] Locked feature tidak selectable.

### 28.5 Export

- [ ] CSV field selection bekerja.
- [ ] Excel dataset selection bekerja.
- [ ] PDF section selection bekerja.
- [ ] Export loading tampil.
- [ ] Export error tampil jika gagal.
- [ ] Usage event tercatat setelah berhasil.

---

## 29. Non-Goals UI MVP

Hal berikut tidak wajib pada MVP:

1. Chart visual embedded di PDF. File PDF MVP hanya mewajibkan tabel dan teks, tidak wajib grafik SVG.
2. Drag-and-drop section laporan.
3. Custom dashboard builder.
4. Dark mode polishing mendalam jika project belum mendukung penuh.
5. Advanced animation.
6. Export preview before download.
7. Multi-currency UI.

---

## 30. Definition of UI Done

UI fitur Laporan dianggap selesai jika:

1. Semua section P0 tampil sesuai urutan.
2. Layout desktop dan mobile aman.
3. Filter bekerja dan memperbarui UI.
4. Chart memiliki tooltip dan empty state.
5. Budget, goals, dan debt tampil dengan state yang benar.
6. AI Insight memiliki idle/loading/success/error/locked state.
7. Export Card membuka Export Modal.
8. Export Modal mengikuti `REPORTS_EXPORT_SPECIFICATION.md`.
9. Locked state Free/Plus/Pro tampil benar.
10. Tidak ada NaN/undefined pada UI.
11. Tidak ada horizontal overflow global di mobile.
12. Loading, empty, dan error state tersedia.
13. UI konsisten dengan design system existing Ngaturin.