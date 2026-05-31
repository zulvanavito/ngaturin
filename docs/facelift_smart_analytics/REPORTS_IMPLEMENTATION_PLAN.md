# REPORTS_IMPLEMENTATION_PLAN — Fitur Laporan Ngaturin

## 1. Informasi Dokumen

**Nama Sistem:** Ngaturin  
**Nama Modul:** Laporan  
**Tipe Dokumen:** Implementation Plan  
**Versi:** 1.0 Final Draft  
**Status:** Acuan eksekusi engineering  
**Target Route:** `/dashboard/reports`  
**Legacy Route:** `/dashboard/insights`  

Dokumen terkait:

- `docs/SRS_LAPORAN.md`
- `docs/TDD_LAPORAN.md`
- `docs/REPORTS_DATA_MAPPING.md`

Dokumen ini berisi rencana implementasi teknis fitur Laporan dalam bentuk fase, task engineering, dependency, estimasi effort, acceptance criteria per task, urutan eksekusi, dan risiko implementasi.

---

## 2. Tujuan Implementation Plan

Tujuan dokumen ini adalah mengubah PRD, SRS, TDD, dan Data Mapping menjadi backlog engineering yang dapat langsung dieksekusi.

Dokumen ini harus menjawab:

1. Task apa yang harus dikerjakan lebih dulu?
2. File apa yang harus dibuat atau diubah?
3. Dependency antar task apa saja?
4. Output setiap task apa?
5. Bagaimana definition of done per fase?
6. Apa risiko implementasi dan mitigasinya?

---

## 3. Prinsip Implementasi

### 3.1 Implementasi Bertahap

Fitur Laporan tidak boleh langsung dikerjakan sebagai satu perubahan besar tanpa struktur. Implementasi harus dibagi menjadi beberapa fase agar mudah direview dan diuji.

### 3.2 Calculation First

Sebelum UI final dibuat, calculation engine harus stabil. UI hanya boleh membaca hasil kalkulasi dari `useFinancialReport`.

### 3.3 Jangan Simpan Raw Data di Zustand

Zustand hanya untuk filter dan UI state.

### 3.4 AI Belakangan

AI insight dikerjakan setelah calculated metrics, anomaly detection, dan recommendations tersedia.

### 3.5 Export Belakangan

Export dikerjakan setelah struktur report result stabil.

### 3.6 Route Lama Harus Aman

`/dashboard/insights` tidak boleh langsung dihapus tanpa compatibility plan. Minimal redirect ke `/dashboard/reports`.

---

## 4. Ringkasan Fase Implementasi

| Phase | Nama | Fokus | Estimasi |
|---:|---|---|---:|
| 0 | Audit & Preparation | Cek struktur existing, tipe data, dependensi | 0.5–1 hari |
| 1 | Foundation | Route, folder, store, types, date utils | 1–2 hari |
| 2 | Calculation Engine | Summary, charts data, budget, debt, goals, anomaly, projection | 2–4 hari |
| 3 | Core UI | Header, filters, score, summary, charts, quick summary | 2–4 hari |
| 4 | Extended UI | Budget, goals, debt, empty/error states | 1.5–3 hari |
| 5 | AI Insight | AI input, API/service, UI, guardrails | 1–2.5 hari |
| 6 | Export | PDF, Excel, CSV | 1.5–3 hari |
| 7 | Navigation & Cleanup | Sidebar, legacy route, remove old code | 0.5–1.5 hari |
| 8 | Testing & QA | Unit, manual QA, edge cases, mobile | 1.5–3 hari |

Total estimasi: **11–24 hari kerja**, tergantung kondisi kode existing, testing setup, dan kompleksitas AI/export existing.

---

## 5. Phase 0 — Audit & Preparation

### Tujuan

Memastikan kondisi repository, dependensi, dan struktur existing sebelum implementasi.

### Task 0.1 — Audit File Smart Analytics Existing

**Tujuan:** Memahami kode lama yang akan diganti.

**File yang dicek:**

- `app/dashboard/insights/insights-client-view.tsx`
- `components/insights/*`
- `hooks/use-insights.ts`
- `components/layout/sidebar.tsx`

**Output:**

- Daftar komponen yang masih bisa dipakai ulang.
- Daftar logic yang harus dipindahkan atau ditinggalkan.

**Acceptance Criteria:**

- Developer tahu bagian mana yang reused dan mana yang deprecated.

**Estimasi:** 2–4 jam.

### Task 0.2 — Audit Dependencies

**Tujuan:** Pastikan dependencies tersedia.

**Cek:**

- `zustand`
- `recharts`
- `jspdf`
- `jspdf-autotable`
- `exceljs`
- `json2csv`
- `lucide-react`

**Acceptance Criteria:**

- Dependencies yang dibutuhkan tersedia di `package.json`.
- Jika belum ada, buat daftar install.

**Estimasi:** 1 jam.

### Task 0.3 — Audit Types Existing

**Tujuan:** Mengidentifikasi type existing agar tidak duplikasi tidak perlu.

**File yang dicek:**

- `types/finance.ts`
- type lain yang digunakan transaksi, budget, goals, debts, wallets.

**Acceptance Criteria:**

- Diketahui type mana yang bisa dipakai langsung.
- Diketahui type mana yang perlu adapter.

**Estimasi:** 1–2 jam.

---

## 6. Phase 1 — Foundation

### Tujuan

Membuat fondasi teknis: route, folder, store, type, date utilities, dan skeleton halaman.

---

### Task 1.1 — Buat Struktur Folder Reports

**File/Folder dibuat:**

```txt
app/dashboard/reports/
components/reports/
lib/reports/
stores/
hooks/
```

**Acceptance Criteria:**

- Folder tersedia.
- Tidak mengganggu fitur lama.

**Estimasi:** 0.5 jam.

---

### Task 1.2 — Buat Route `/dashboard/reports`

**File dibuat:**

```txt
app/dashboard/reports/page.tsx
app/dashboard/reports/reports-client-view.tsx
```

**Scope:**

- `page.tsx` server component.
- `reports-client-view.tsx` client component.
- Untuk tahap awal, render placeholder layout.

**Acceptance Criteria:**

- `/dashboard/reports` dapat dibuka.
- Page menampilkan judul `Laporan`.
- Tidak ada crash.

**Estimasi:** 2–4 jam.

**Dependency:** Task 1.1.

---

### Task 1.3 — Buat Report Types

**File dibuat:**

```txt
lib/reports/report-types.ts
```

**Isi minimal:**

- `ReportFilters`
- `TransactionTypeFilter`
- `TrendInterval`
- `ReportSummary`
- `FinancialHealthScore`
- `IncomeExpenseTrendPoint`
- `ExpenseBreakdownItem`
- `TopCategoryItem`
- `DailyExpensePoint`
- `QuickSummary`
- `BudgetPerformanceItem`
- `GoalProgressItem`
- `DebtSummary`
- `ReportAnomaly`
- `ReportProjection`
- `FinancialReportResult`

**Acceptance Criteria:**

- Types bisa diimport dari file lain.
- Tidak bentrok dengan type existing.

**Estimasi:** 2–3 jam.

---

### Task 1.4 — Buat Date Utils

**File dibuat:**

```txt
lib/reports/date-utils.ts
```

**Functions:**

- `getCurrentMonth()`
- `getPreviousMonth(month)`
- `getMonthDateRange(month)`
- `getDaysInMonth(month)`
- `getElapsedDaysInMonth(month)`
- `isCurrentMonth(month)`
- `isFutureMonth(month)`
- `formatDateId(date)`

**Acceptance Criteria:**

- Semua function aman untuk input invalid.
- Format bulan konsisten `YYYY-MM`.

**Estimasi:** 3–5 jam.

---

### Task 1.5 — Buat Zustand Report Store

**File dibuat:**

```txt
stores/use-report-store.ts
```

**State:**

- `filters`
- `trendInterval`
- `viewMode`
- `isInsightExpanded`
- `generatedInsight`

**Acceptance Criteria:**

- Store dapat digunakan di client component.
- Perubahan filter mereset `generatedInsight`.
- Tidak ada raw financial data dalam store.

**Estimasi:** 2–4 jam.

**Dependency:** Task 1.3.

---

### Task 1.6 — Buat Basic Report Shell UI

**File dibuat/diubah:**

```txt
components/reports/report-header.tsx
components/reports/report-section-card.tsx
components/reports/report-empty-state.tsx
app/dashboard/reports/reports-client-view.tsx
```

**Acceptance Criteria:**

- Layout dasar tampil.
- Header tampil.
- Card wrapper reusable tersedia.
- Empty state reusable tersedia.

**Estimasi:** 3–5 jam.

---

## 7. Phase 2 — Calculation Engine

### Tujuan

Membuat seluruh kalkulasi laporan sebagai pure functions yang bisa diuji.

---

### Task 2.1 — Buat Formatter dan Number Helpers

**File dibuat:**

```txt
lib/reports/formatters.ts
```

**Functions:**

- `toNumber(value)`
- `safeDivide(numerator, denominator)`
- `formatCurrency(value)` jika belum ada reusable global
- `formatPercentage(value)`
- `normalizeCategoryKey(category)`
- `getCategoryDisplayName(category)`

**Acceptance Criteria:**

- Tidak menghasilkan NaN.
- Numeric dari Supabase aman dikonversi.

**Estimasi:** 2–3 jam.

---

### Task 2.2 — Implement `filterTransactions`

**File:**

```txt
lib/reports/calculations.ts
```

**Rules:**

- Filter by month.
- Filter by category.
- Filter by wallet.
- Filter by type.
- Invalid date diabaikan.

**Acceptance Criteria:**

- Filter bulan bekerja.
- Filter category/wallet/type bekerja.
- Future month menghasilkan empty array.

**Estimasi:** 3–5 jam.

**Dependency:** Task 1.4, Task 2.1.

---

### Task 2.3 — Implement `calculateSummary`

**Formula:**

```txt
totalIncome = sum income
totalExpense = sum expense
netCashflow = totalIncome - totalExpense
savingsRate = totalIncome > 0 ? netCashflow / totalIncome * 100 : 0
```

**Acceptance Criteria:**

- Transfer tidak masuk income/expense.
- Pemasukan 0 tidak menghasilkan NaN.
- Output sesuai `ReportSummary`.

**Estimasi:** 1–2 jam.

---

### Task 2.4 — Implement `calculateIncomeExpenseTrend`

**Output:** `IncomeExpenseTrendPoint[]`

**Rules:**

- Group by daily/weekly/monthly/yearly sesuai `trendInterval`.
- Income dan expense dipisahkan.
- Net = income - expense.

**Acceptance Criteria:**

- Data urut ascending.
- Tooltip-ready label tersedia.
- Data kosong aman.

**Estimasi:** 4–6 jam.

---

### Task 2.5 — Implement `calculateExpenseBreakdown`

**Output:** `ExpenseBreakdownItem[]`

**Rules:**

- Expense only.
- Group by normalized category.
- Join metadata dari `categories` jika tersedia.
- Sort descending by amount.

**Acceptance Criteria:**

- Income/transfer tidak masuk.
- Persentase aman.
- Fallback kategori tersedia.

**Estimasi:** 3–5 jam.

---

### Task 2.6 — Implement `calculateTopCategories`

**Output:** `TopCategoryItem[]`

**Rules:**

- Ambil top 5 kategori expense.
- Bandingkan dengan previous month.
- Jika no previous data, trend = `no_comparison`.

**Acceptance Criteria:**

- Tidak mengarang tren.
- Sort amount descending.
- Trend percentage aman.

**Estimasi:** 3–5 jam.

---

### Task 2.7 — Implement `calculateDailyExpenses`

**Output:** `DailyExpensePoint[]`

**Rules:**

- Generate semua tanggal dalam bulan.
- Amount 0 untuk no transaction day.
- Mark highest day.

**Acceptance Criteria:**

- Jumlah item sesuai jumlah hari bulan.
- Tanggal tanpa transaksi tetap ada.
- Highest day akurat.

**Estimasi:** 3–5 jam.

---

### Task 2.8 — Implement `calculateQuickSummary`

**Output:** `QuickSummary`

**Fields:**

- averageDailyExpense
- highestExpenseDay
- totalTransactions
- noSpendDays

**Acceptance Criteria:**

- Rata-rata memakai relevant days.
- Tidak memakai pembagi statis 30.
- Tidak crash saat transaksi kosong.

**Estimasi:** 2–4 jam.

---

### Task 2.9 — Implement `calculateBudgetPerformance`

**Output:** `BudgetPerformanceItem[]`

**Rules:**

- Match budget category dengan expense category via normalized key.
- Budget month harus match selectedMonth.
- Budget tanpa transaksi tetap tampil.
- `usedPercentage` bisa >100.
- `timeRisk` dihitung dari elapsed days.

**Acceptance Criteria:**

- Status benar.
- Budget amount 0 aman.
- Over-budget terlihat dari output.

**Estimasi:** 5–8 jam.

---

### Task 2.10 — Implement `calculateGoalsProgress`

**Output:** `GoalProgressItem[]`

**Rules:**

- Progress = current / target.
- Visual cap dilakukan di UI, tetapi output percentage actual tetap tersedia.
- Sorting: incomplete first, nearest deadline.

**Acceptance Criteria:**

- Target 0 aman.
- Goals completed tetap tampil dengan badge-ready field.
- Empty goals aman.

**Estimasi:** 2–4 jam.

---

### Task 2.11 — Implement `calculateDebtSummary`

**Output:** `DebtSummary`

**Rules:**

- remaining = max(amount - paid_amount, 0)
- settled debt diabaikan.
- overdue count dihitung dari due_date < today.
- nearest due debt dihitung dari active debt.

**Acceptance Criteria:**

- Partial paid dihitung benar.
- Overpaid tidak negatif.
- No debt menghasilkan zero summary.

**Estimasi:** 3–5 jam.

---

### Task 2.12 — Implement `calculateProjections`

**File:**

```txt
lib/reports/projections.ts
```

**Rules:**

- Projection hanya relevan untuk current month.
- projectedExpense = averageDailyExpense * totalDaysInMonth.
- projectedSavings = totalIncome - projectedExpense.
- Confidence based on elapsed days.

**Acceptance Criteria:**

- Tidak NaN.
- Future month aman.
- Past month ditandai historical/no projection.

**Estimasi:** 3–5 jam.

---

### Task 2.13 — Implement `detectAnomalies`

**File:**

```txt
lib/reports/anomaly-rules.ts
```

**Anomalies:**

- Budget faster than expected.
- Over-budget.
- Daily expense spike.
- Low savings rate.
- Debt overdue.
- Goal behind schedule.

**Acceptance Criteria:**

- Output punya severity.
- Severity high diurutkan paling atas.
- No anomaly menghasilkan empty array.

**Estimasi:** 5–8 jam.

---

### Task 2.14 — Implement `generateRuleBasedRecommendations`

**File:**

```txt
lib/reports/recommendations.ts
```

**Rules:**

- Rekomendasi berasal dari anomalies, budget, projection, goals, debt.
- Rekomendasi harus spesifik jika angka tersedia.

**Acceptance Criteria:**

- Output array string.
- Tidak membuat angka tanpa source.
- Minimal rekomendasi fallback jika tidak ada masalah.

**Estimasi:** 3–5 jam.

---

### Task 2.15 — Implement `useFinancialReport`

**File:**

```txt
hooks/use-financial-report.ts
```

**Acceptance Criteria:**

- Mengorkestrasi semua calculation functions.
- Return `FinancialReportResult` lengkap.
- Memoized.
- Tidak melakukan side effect.

**Estimasi:** 4–6 jam.

**Dependency:** Task 2.2–2.14.

---

## 8. Phase 3 — Core UI

### Tujuan

Membangun UI utama sesuai referensi desain dan output calculation engine.

---

### Task 3.1 — Implement Report Filters

**File:**

```txt
components/reports/report-filters.tsx
```

**Features:**

- Month select.
- Category select.
- Wallet select.
- Type select.
- Reset filter.

**Acceptance Criteria:**

- Menggunakan Zustand actions.
- Filter update langsung memengaruhi report.
- Insight reset saat filter berubah.

**Estimasi:** 4–6 jam.

---

### Task 3.2 — Implement Financial Health Score Card

**File:**

```txt
components/reports/financial-health-score.tsx
```

**Acceptance Criteria:**

- Skor tampil.
- Status tampil.
- Breakdown dimensi tampil.
- Label estimasi tampil jika `isEstimated`.
- Tidak crash saat score 0.

**Estimasi:** 5–8 jam.

---

### Task 3.3 — Implement Summary Cards

**File:**

```txt
components/reports/report-summary-cards.tsx
```

**Cards:**

- Yang Ditabung.
- Rasio Menabung.
- Pemasukan.
- Pengeluaran.

**Acceptance Criteria:**

- Rupiah format benar.
- Negative cashflow jelas.
- Responsive grid.

**Estimasi:** 3–5 jam.

---

### Task 3.4 — Implement Income Expense Trend Chart

**File:**

```txt
components/reports/income-expense-trend.tsx
```

**Acceptance Criteria:**

- Chart tampil.
- Tooltip format Rupiah.
- Legend jelas.
- Empty state tampil.

**Estimasi:** 5–8 jam.

---

### Task 3.5 — Implement Expense Breakdown Chart

**File:**

```txt
components/reports/expense-breakdown-chart.tsx
```

**Acceptance Criteria:**

- Donut chart tampil.
- Tooltip nominal dan persentase.
- Empty state saat data kosong.
- Responsive height.

**Estimasi:** 4–6 jam.

---

### Task 3.6 — Implement Top Categories Card

**File:**

```txt
components/reports/top-categories-card.tsx
```

**Acceptance Criteria:**

- Maksimal 5 kategori.
- Trend badge tampil.
- `no_comparison` tidak diklaim naik/turun.

**Estimasi:** 3–5 jam.

---

### Task 3.7 — Implement Daily Expense Chart

**File:**

```txt
components/reports/daily-expense-chart.tsx
```

**Acceptance Criteria:**

- Semua tanggal tampil.
- Average reference line tampil.
- Highest day terlihat.
- Tooltip format Rupiah.

**Estimasi:** 5–8 jam.

---

### Task 3.8 — Implement Quick Summary Card

**File:**

```txt
components/reports/quick-summary-card.tsx
```

**Acceptance Criteria:**

- 4 metrik tampil.
- Hari terboros null aman.
- Responsive.

**Estimasi:** 3–5 jam.

---

### Task 3.9 — Integrasi Core UI ke ReportsClientView

**File:**

```txt
app/dashboard/reports/reports-client-view.tsx
```

**Acceptance Criteria:**

- Semua core UI section tampil berurutan.
- Data berasal dari `useFinancialReport`.
- Tidak ada calculation besar langsung di UI.

**Estimasi:** 4–6 jam.

---

## 9. Phase 4 — Extended UI

### Tujuan

Menambahkan section budget, goals, debt, empty state, dan error state.

---

### Task 4.1 — Implement Budget Performance Table

**File:**

```txt
components/reports/budget-performance-table.tsx
```

**Acceptance Criteria:**

- Desktop table tampil.
- Mobile aman.
- Progress bar capped 100 secara visual.
- Status badge benar.
- Empty state jika tidak ada budget.

**Estimasi:** 5–8 jam.

---

### Task 4.2 — Implement Goals Progress Card

**File:**

```txt
components/reports/goals-progress-card.tsx
```

**Acceptance Criteria:**

- Goals list tampil.
- Progress bar capped 100.
- Completed badge tampil.
- Empty state + CTA tampil jika kosong.

**Estimasi:** 4–6 jam.

---

### Task 4.3 — Implement Debt Summary Card

**File:**

```txt
components/reports/debt-summary-card.tsx
```

**Acceptance Criteria:**

- Active debt tampil.
- Receivable tampil.
- Net position tampil.
- Overdue warning tampil.
- No debt positive state tampil.

**Estimasi:** 4–6 jam.

---

### Task 4.4 — Integrasi Extended UI ke ReportsClientView

**Acceptance Criteria:**

- Budget, goals, debt tampil setelah core charts.
- Layout desktop dan mobile rapi.
- Tidak ada crash saat data kosong.

**Estimasi:** 3–5 jam.

---

## 10. Phase 5 — AI Insight

### Tujuan

Membuat Insight AI berbasis calculated metrics.

---

### Task 5.1 — Implement AI Report Input Builder

**File:**

```txt
lib/reports/ai-report.ts
```

**Function:**

```ts
buildAiReportInput(report, period)
```

**Acceptance Criteria:**

- Input tidak berisi raw transactions penuh.
- Input berisi summary, score, categories, budget, goals, debt, anomalies, projection, recommendations.

**Estimasi:** 2–3 jam.

---

### Task 5.2 — Implement AI Insight Service/API Integration

**Opsi file:**

```txt
app/api/reports/ai-insight/route.ts
```

atau gunakan service existing jika sudah ada.

**Acceptance Criteria:**

- Bisa menerima `AiReportInput`.
- Menghasilkan structured output.
- Error ditangani.
- Tidak expose secret di client.

**Estimasi:** 5–8 jam.

---

### Task 5.3 — Implement AI Insight UI

**File:**

```txt
components/reports/ai-insight-report.tsx
```

**Acceptance Criteria:**

- Button `Buat Insight` tampil.
- Loading state tampil.
- Error state tampil.
- Insight tersimpan di Zustand.
- Filter change reset insight.

**Estimasi:** 5–8 jam.

---

### Task 5.4 — Fallback Rule-Based Insight

**Tujuan:** Jika AI gagal, user tetap mendapat rekomendasi dasar.

**Acceptance Criteria:**

- Fallback menggunakan `recommendations` dan `anomalies`.
- Tidak membuat angka baru.

**Estimasi:** 2–4 jam.

---

## 11. Phase 6 — Export

### Tujuan

Membuat export PDF, Excel, CSV berdasarkan report result.

---

### Task 6.1 — Implement Export Types dan Input

**File:**

```txt
lib/reports/report-export.ts
```

**Acceptance Criteria:**

- `ExportReportInput` tersedia.
- Input mencakup period, report, filtered transactions, generated insight.

**Estimasi:** 1–2 jam.

---

### Task 6.2 — Implement CSV Export

**Acceptance Criteria:**

- CSV berisi filtered transactions.
- Kolom: date, category, description, type, amount, wallet.
- Filename benar.

**Estimasi:** 2–4 jam.

---

### Task 6.3 — Implement Excel Export

**Sheets:**

- Ringkasan.
- Transaksi.
- Budget Performance.
- Goals.
- Debts.
- Categories.

**Acceptance Criteria:**

- File bisa dibuka.
- Number cell benar.
- Header jelas.

**Estimasi:** 6–10 jam.

---

### Task 6.4 — Implement PDF Export

**Content:**

- Header.
- Period.
- Summary.
- Score.
- Top categories.
- Budget.
- Goals.
- Debt.
- AI insight if available.
- Transaction table.

**Acceptance Criteria:**

- PDF bisa dibuat.
- Filename benar.
- Layout tetap terbaca.

**Estimasi:** 6–10 jam.

---

### Task 6.5 — Implement Export Card UI

**File:**

```txt
components/reports/report-export-card.tsx
```

**Acceptance Criteria:**

- Button PDF, Excel, CSV tampil.
- Loading state per export.
- Error state tampil jika gagal.
- Disabled jika tidak ada data.

**Estimasi:** 4–6 jam.

---

## 12. Phase 7 — Navigation & Cleanup

### Task 7.1 — Update Sidebar Menu

**File kemungkinan:**

```txt
components/layout/sidebar.tsx
```

**Changes:**

- Label menjadi `Laporan`.
- Href menjadi `/dashboard/reports`.
- Icon disesuaikan.
- Active state mencakup `/dashboard/reports`.

**Acceptance Criteria:**

- Sidebar mengarah ke Laporan.
- Active state benar.

**Estimasi:** 1–2 jam.

---

### Task 7.2 — Redirect Legacy Route

**File:**

```txt
app/dashboard/insights/page.tsx
```

**Implementation:**

```ts
import { redirect } from "next/navigation";

export default function InsightsPage() {
  redirect("/dashboard/reports");
}
```

**Acceptance Criteria:**

- `/dashboard/insights` redirect ke `/dashboard/reports`.
- Tidak ada UI Smart Analytics lama.

**Estimasi:** 1 jam.

---

### Task 7.3 — Cleanup Old Unused Code

**Scope:**

- Hapus komponen lama hanya jika tidak dipakai route lain.
- Jika belum yakin, tandai deprecated dulu.

**Acceptance Criteria:**

- Tidak ada unused imports.
- Build tetap aman.

**Estimasi:** 2–5 jam.

---

## 13. Phase 8 — Testing & QA

### Task 8.1 — Unit Test Calculation Engine

**Target:**

- Summary.
- Daily expenses.
- Budget performance.
- Debt summary.
- Projection.
- Anomalies.

**Acceptance Criteria:**

- Edge cases utama lulus.
- Tidak ada NaN.

**Estimasi:** 6–12 jam.

---

### Task 8.2 — Manual QA Desktop

**Checklist:**

- Page loads.
- Filter works.
- Cards correct.
- Charts render.
- Budget visible.
- Goals visible.
- Debt visible.
- AI works/fails gracefully.
- Export works.

**Estimasi:** 3–5 jam.

---

### Task 8.3 — Manual QA Mobile

**Checklist:**

- No horizontal overflow.
- Cards readable.
- Charts readable.
- Budget table usable.
- Export buttons usable.

**Estimasi:** 3–5 jam.

---

### Task 8.4 — Edge Case QA

Scenarios:

1. Empty account.
2. Income only.
3. Expense only.
4. Transfer only.
5. No budget.
6. No goals.
7. No debt.
8. Over-budget.
9. Debt overdue.
10. Future month.
11. Past month.

**Estimasi:** 4–8 jam.

---

## 14. Recommended PR Breakdown

Agar review lebih aman, jangan jadikan semua perubahan dalam satu PR besar.

### PR 1 — Reports Foundation

Scope:

- Route `/dashboard/reports`.
- Report types.
- Date utils.
- Zustand store.
- Basic shell.

### PR 2 — Calculation Engine

Scope:

- Formatters.
- Calculation functions.
- Hook `useFinancialReport`.
- Unit tests dasar.

### PR 3 — Core Report UI

Scope:

- Header.
- Filters.
- Score.
- Summary cards.
- Trend chart.
- Expense breakdown.
- Top categories.
- Daily expense.
- Quick summary.

### PR 4 — Extended Report UI

Scope:

- Budget performance.
- Goals progress.
- Debt summary.
- Empty/error states.

### PR 5 — AI Insight

Scope:

- AI input builder.
- API/service integration.
- AI insight component.
- Fallback recommendations.

### PR 6 — Export

Scope:

- CSV.
- Excel.
- PDF.
- Export UI.

### PR 7 — Navigation Migration & Cleanup

Scope:

- Sidebar update.
- Legacy redirect.
- Cleanup old Smart Analytics code.
- Final QA fixes.

---

## 15. Dependency Graph

```txt
Phase 0
  ↓
Phase 1 Foundation
  ↓
Phase 2 Calculation Engine
  ↓
Phase 3 Core UI
  ↓
Phase 4 Extended UI
  ↓
Phase 5 AI Insight
  ↓
Phase 6 Export
  ↓
Phase 7 Navigation Cleanup
  ↓
Phase 8 QA
```

Parallel work possible:

1. Export can start after `FinancialReportResult` stabilizes.
2. AI can start after anomalies and recommendations exist.
3. UI components can start with mocked `FinancialReportResult` before final hook is complete.

---

## 16. Task Priority

### P0 — Wajib untuk MVP

1. Route `/dashboard/reports`.
2. Zustand store.
3. Report types.
4. Calculation summary.
5. Financial health score.
6. Summary cards.
7. Income vs expense trend.
8. Expense breakdown.
9. Top categories.
10. Daily expense.
11. Quick summary.
12. Budget performance.
13. Goals progress.
14. Debt summary.
15. Empty states.
16. Sidebar update.

### P1 — Sangat Disarankan

1. Anomaly detection.
2. Projection.
3. Rule-based recommendations.
4. Export CSV.
5. Export Excel.
6. Export PDF.
7. Unit tests calculation.

### P2 — Bisa Setelah MVP

1. AI insight.
2. Investment summary.
3. Recurring bills summary.
4. Advanced trend comparison.
5. Category migration.

Catatan kritis: AI sebaiknya tidak masuk P0 karena kualitas AI bergantung pada calculation layer yang benar.

---

## 17. Engineering Risks

### Risiko 1 — Scope Terlalu Besar

Mitigasi:

- Gunakan PR breakdown.
- P0 dulu, P1 setelah stabil.
- AI dan export jangan dikerjakan sebelum calculation engine stabil.

### Risiko 2 — Calculation Tidak Konsisten

Mitigasi:

- Semua formula di satu layer.
- Jangan hitung ulang di UI component.
- Tambahkan unit test.

### Risiko 3 — UI Berat dan Panjang

Mitigasi:

- Section modular.
- Empty states ringkas.
- Mobile single column.

### Risiko 4 — Data Kosong Membuat UI Rusak

Mitigasi:

- Fallback di calculation layer.
- Empty state reusable.
- Test empty account.

### Risiko 5 — AI Mengarang Angka

Mitigasi:

- AI hanya dapat calculated metrics.
- UI tidak membaca angka dari AI sebagai source of truth.
- Prompt guardrails.

### Risiko 6 — Export Lambat

Mitigasi:

- Export on demand.
- Loading state.
- Batasi transaksi jika perlu.

---

## 18. Definition of Done per Phase

### Phase 1 Done

- Route reports ada.
- Store ada.
- Types ada.
- Date utils ada.
- Shell UI tampil.

### Phase 2 Done

- `useFinancialReport` return data lengkap.
- Semua calculation function aman terhadap data kosong.
- Tidak ada NaN pada output utama.

### Phase 3 Done

- Core UI tampil dengan data report.
- Chart aman saat data kosong.
- Layout desktop/mobile dasar aman.

### Phase 4 Done

- Budget, goals, debt tampil.
- Empty state tersedia.
- Error state dasar tersedia.

### Phase 5 Done

- AI insight bisa dibuat.
- AI failure tidak merusak halaman.
- Insight reset saat filter berubah.

### Phase 6 Done

- PDF, Excel, CSV berhasil dibuat.
- Export mengikuti filter aktif.
- Export error ditangani.

### Phase 7 Done

- Sidebar mengarah ke Laporan.
- Route lama redirect.
- Tidak ada UI Smart Analytics lama.

### Phase 8 Done

- QA desktop selesai.
- QA mobile selesai.
- Edge case utama aman.
- Build dan lint aman.

---

## 19. Final Implementation Checklist

Sebelum merge final:

- [ ] `/dashboard/reports` dapat dibuka.
- [ ] Sidebar label sudah `Laporan`.
- [ ] `/dashboard/insights` redirect atau alias aman.
- [ ] Zustand tidak menyimpan raw financial data.
- [ ] Calculation engine tidak menghasilkan NaN.
- [ ] Summary cards benar.
- [ ] Financial health score benar.
- [ ] Chart income/expense benar.
- [ ] Expense breakdown hanya expense.
- [ ] Top categories tidak mengarang tren.
- [ ] Daily expenses menampilkan no-spend days.
- [ ] Budget performance benar.
- [ ] Goals progress benar.
- [ ] Debt summary memakai remaining amount.
- [ ] Anomalies berjalan.
- [ ] Projection berjalan.
- [ ] AI insight aman atau fallback tersedia.
- [ ] Export PDF berhasil.
- [ ] Export Excel berhasil.
- [ ] Export CSV berhasil.
- [ ] Empty states tersedia.
- [ ] Error states tersedia.
- [ ] Mobile layout aman.
- [ ] Build berhasil.
- [ ] Lint tidak error kritis.

---

## 20. Recommended Next Action

Langkah implementasi pertama yang disarankan:

```txt
PR 1 — Reports Foundation
```

Isi PR 1:

1. `app/dashboard/reports/page.tsx`
2. `app/dashboard/reports/reports-client-view.tsx`
3. `lib/reports/report-types.ts`
4. `lib/reports/date-utils.ts`
5. `stores/use-report-store.ts`
6. `components/reports/report-header.tsx`
7. `components/reports/report-section-card.tsx`
8. `components/reports/report-empty-state.tsx`

PR ini harus kecil dan tidak mengubah behavior lama terlalu banyak. Setelah foundation stabil, lanjut ke calculation engine.

## Export Modal Implementation Reference

Task detail untuk Export Modal, termasuk component, entitlement helper, dataset selector, transaction field selector, export validation, paywall behavior, dan usage tracking mengacu pada:

`docs/REPORTS_EXPORT_SPECIFICATION.md`

Task Phase 6 harus mengikuti dokumen tersebut sebagai acuan utama.