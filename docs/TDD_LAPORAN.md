# TDD — Technical Design Document Fitur Laporan Ngaturin

## 1. Informasi Dokumen

**Nama Sistem:** Ngaturin  
**Nama Modul:** Laporan  
**Dokumen Terkait:** `docs/SRS_LAPORAN.md`  
**Tipe Dokumen:** Technical Design Document  
**Versi:** 1.0 Final Draft  
**Status:** Acuan teknis implementasi awal  
**Target Route:** `/dashboard/reports`  
**Legacy Route:** `/dashboard/insights`  
**Stack:** Next.js, React, TypeScript, Supabase, Zustand, Recharts  

Dokumen ini menjembatani SRS dengan implementasi kode. Fokus dokumen ini adalah arsitektur frontend, flow data, desain store, calculation engine, struktur komponen, AI insight flow, export architecture, dan rencana implementasi teknis.

---

## 2. Tujuan Teknis

Tujuan teknis fitur Laporan:

1. Mengganti fitur Smart Analytics lama dengan modul Laporan yang lebih modular.
2. Memisahkan data fetching, UI state, kalkulasi finansial, chart rendering, AI insight, dan export.
3. Menghindari file client view yang terlalu besar seperti pola lama pada `insights-client-view.tsx`.
4. Menjadikan Supabase sebagai source of truth.
5. Menjadikan Zustand hanya sebagai filter dan UI state manager.
6. Menjadikan calculation layer sebagai pure function yang mudah diuji.
7. Menjadikan AI sebagai narator insight, bukan calculator.
8. Memastikan UI responsif, aman dari NaN, dan tahan terhadap data kosong.

---

## 3. Ringkasan Arsitektur

Arsitektur fitur Laporan menggunakan pola berikut:

```txt
Supabase / Server Data Fetching
        ↓
app/dashboard/reports/page.tsx
        ↓ props
reports-client-view.tsx
        ↓
Zustand Store untuk filter dan UI state
        ↓
useFinancialReport(...)
        ↓
lib/reports/calculations.ts + anomaly-rules.ts + projections.ts
        ↓
Report UI Components
        ↓
AI Insight + Export Actions
```

Prinsip utama:

1. Server component mengambil data awal.
2. Client component mengatur interaksi, filter, chart, export, dan AI insight.
3. Zustand tidak menyimpan raw data Supabase.
4. Semua angka laporan berasal dari calculation layer.
5. Komponen UI hanya menerima props hasil kalkulasi.

---

## 4. Design Constraints

### 4.1 Tidak Melakukan Migrasi Database untuk MVP

Implementasi awal harus memakai schema existing:

1. `transactions.category` masih text.
2. `budgets.category` masih text.
3. `recurring_bills.category` masih text.
4. `wallets` belum wajib memiliki saldo.
5. `goals` belum wajib memiliki history kontribusi.

### 4.2 Tidak Menyimpan Data Finansial Mentah di Zustand

Zustand hanya menyimpan:

1. Filter.
2. Trend interval.
3. View mode.
4. UI expanded state.
5. Insight hasil generate sementara.

### 4.3 AI Tidak Menjadi Calculator

AI hanya menerima aggregated metrics dan tidak boleh menghasilkan angka baru.

### 4.4 Compatibility dengan Route Lama

Route `/dashboard/insights` tidak boleh memunculkan UI Smart Analytics lama setelah migration complete.

---

## 5. Struktur Direktori Final

```txt
app/dashboard/reports/page.tsx
app/dashboard/reports/reports-client-view.tsx
app/dashboard/insights/page.tsx

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
components/reports/report-empty-state.tsx
components/reports/report-section-card.tsx

hooks/use-financial-report.ts
stores/use-report-store.ts

lib/reports/report-types.ts
lib/reports/calculations.ts
lib/reports/date-utils.ts
lib/reports/formatters.ts
lib/reports/anomaly-rules.ts
lib/reports/projections.ts
lib/reports/recommendations.ts
lib/reports/ai-report.ts
lib/reports/report-export.ts

lib/reports/__tests__/calculations.test.ts
lib/reports/__tests__/anomaly-rules.test.ts
lib/reports/__tests__/projections.test.ts
```

Catatan: file test dapat ditambahkan bertahap sesuai testing setup project.

---

## 6. Data Flow Detail

### 6.1 Page Server Flow

`app/dashboard/reports/page.tsx` bertugas:

1. Validasi user session.
2. Mengambil data Supabase milik user.
3. Mengirim data ke `ReportsClientView`.

Pseudo-flow:

```ts
export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [transactions, budgets, categories, wallets, bills, debts, goals, investments] = await Promise.all([
    fetchTransactions(user.id),
    fetchBudgets(user.id),
    fetchCategories(user.id),
    fetchWallets(user.id),
    fetchRecurringBills(user.id),
    fetchDebts(user.id),
    fetchGoals(user.id),
    fetchInvestments(user.id),
  ]);

  return <ReportsClientView initialData={{ transactions, budgets, categories, wallets, bills, debts, goals, investments }} />;
}
```

### 6.2 Client Flow

`reports-client-view.tsx` bertugas:

1. Membaca filter dari Zustand.
2. Memanggil `useFinancialReport`.
3. Mendistribusikan hasil kalkulasi ke komponen.
4. Menangani AI insight dan export action.

Pseudo-flow:

```ts
export function ReportsClientView({ initialData }: ReportsClientViewProps) {
  const { filters, trendInterval } = useReportStore();

  const report = useFinancialReport({
    ...initialData,
    filters,
    trendInterval,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <ReportHeader />
      <ReportFilters data={initialData} />
      <FinancialHealthScore data={report.financialHealthScore} />
      <ReportSummaryCards summary={report.summary} />
      <IncomeExpenseTrend data={report.incomeExpenseTrend} />
      <ExpenseBreakdownChart data={report.expenseBreakdown} />
      <TopCategoriesCard data={report.topCategories} />
      <DailyExpenseChart data={report.dailyExpenses} />
      <QuickSummaryCard data={report.quickSummary} />
      <BudgetPerformanceTable data={report.budgetPerformance} />
      <GoalsProgressCard data={report.goalsProgress} />
      <DebtSummaryCard data={report.debtSummary} />
      <AiInsightReport report={report} />
      <ReportExportCard report={report} transactions={report.filteredTransactions} />
    </div>
  );
}
```

---

## 7. Data Fetching Design

### 7.1 Fetch Strategy MVP

Untuk MVP, data dapat diambil sekaligus per user dari tabel relevan, lalu difilter di client calculation layer.

Kelebihan:

1. Implementasi lebih cepat.
2. Filter UI lebih responsif.
3. Tidak perlu refetch saat filter berubah.

Kelemahan:

1. Kurang optimal jika transaksi user sangat banyak.
2. Payload awal bisa membesar.

### 7.2 Fetch Strategy Lanjutan

Untuk versi lanjutan, transaksi sebaiknya difetch berdasarkan range tanggal:

1. Periode aktif.
2. Periode sebelumnya.
3. Optional buffer untuk chart tahunan.

Query range:

```txt
currentStart = YYYY-MM-01
currentEnd = first day of next month
previousStart = first day of previous month
previousEnd = currentStart
```

### 7.3 Data Normalization

Karena kategori masih text, calculation layer harus melakukan normalisasi ringan:

```ts
export function normalizeCategory(category?: string | null) {
  return category?.trim() || "Tanpa Kategori";
}
```

Tidak disarankan mengubah casing secara agresif pada MVP karena bisa merusak tampilan nama kategori user. Untuk grouping, dapat memakai lower-case key tetapi tetap menyimpan display name pertama.

---

## 8. Type System Design

Semua type laporan ditempatkan di:

```txt
lib/reports/report-types.ts
```

Type utama:

```ts
export type TransactionType = "income" | "expense" | "transfer";
export type TransactionTypeFilter = "all" | TransactionType;
export type TrendInterval = "daily" | "weekly" | "monthly" | "yearly";

export interface ReportFilters {
  selectedMonth: string;
  selectedCategory: string;
  selectedWallet: string;
  selectedType: TransactionTypeFilter;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  savingsRate: number;
}

export interface FinancialReportResult {
  filteredTransactions: Transaction[];
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

Catatan: jika project sudah memiliki type seperti `Transaction` di `@/types/finance`, gunakan type existing dan buat adapter jika field tidak konsisten.

---

## 9. Zustand Store Design

File:

```txt
stores/use-report-store.ts
```

Store hanya mengelola filter dan UI state.

```ts
import { create } from "zustand";
import type { ReportFilters, TransactionTypeFilter, TrendInterval } from "@/lib/reports/report-types";

type ReportViewMode = "overview" | "budget" | "goals" | "ai";

interface GeneratedInsight {
  summary: string;
  comparison?: string;
  topCategoriesInsight?: string;
  anomalies: string[];
  projection?: string;
  recommendations: string[];
  generatedAt: string;
}

interface ReportStoreState {
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

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const defaultFilters: ReportFilters = {
  selectedMonth: getCurrentMonth(),
  selectedCategory: "all",
  selectedWallet: "all",
  selectedType: "all",
};

export const useReportStore = create<ReportStoreState>((set) => ({
  filters: defaultFilters,
  trendInterval: "daily",
  viewMode: "overview",
  isInsightExpanded: false,
  generatedInsight: null,

  setSelectedMonth: (month) =>
    set((state) => ({
      filters: { ...state.filters, selectedMonth: month },
      generatedInsight: null,
    })),

  setSelectedCategory: (category) =>
    set((state) => ({
      filters: { ...state.filters, selectedCategory: category },
      generatedInsight: null,
    })),

  setSelectedWallet: (wallet) =>
    set((state) => ({
      filters: { ...state.filters, selectedWallet: wallet },
      generatedInsight: null,
    })),

  setSelectedType: (type) =>
    set((state) => ({
      filters: { ...state.filters, selectedType: type },
      generatedInsight: null,
    })),

  setTrendInterval: (interval) => set({ trendInterval: interval }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setInsightExpanded: (value) => set({ isInsightExpanded: value }),
  setGeneratedInsight: (insight) => set({ generatedInsight: insight }),
  resetFilters: () => set({ filters: defaultFilters, trendInterval: "daily", generatedInsight: null }),
}));
```

Persist tidak digunakan pada fase awal.

---

## 10. Hook Design — `useFinancialReport`

File:

```txt
hooks/use-financial-report.ts
```

Tanggung jawab:

1. Menjadi orchestrator calculation layer.
2. Menerima raw data dari props dan filter dari Zustand.
3. Mengembalikan `FinancialReportResult`.

Pseudo-code:

```ts
export function useFinancialReport(input: UseFinancialReportInput): FinancialReportResult {
  return useMemo(() => {
    const filteredTransactions = filterTransactions(input.transactions, input.filters);
    const currentExpenseTransactions = filteredTransactions.filter((tx) => tx.type === "expense");

    const previousPeriodTransactions = filterTransactions(input.transactions, {
      ...input.filters,
      selectedMonth: getPreviousMonth(input.filters.selectedMonth),
    });

    const summary = calculateSummary(filteredTransactions);
    const incomeExpenseTrend = calculateIncomeExpenseTrend(filteredTransactions, input.filters.selectedMonth, input.trendInterval);
    const expenseBreakdown = calculateExpenseBreakdown(currentExpenseTransactions, input.categories);
    const topCategories = calculateTopCategories(currentExpenseTransactions, previousPeriodTransactions.filter((tx) => tx.type === "expense"));
    const dailyExpenses = calculateDailyExpenses(currentExpenseTransactions, input.filters.selectedMonth);
    const quickSummary = calculateQuickSummary(filteredTransactions, dailyExpenses, input.filters.selectedMonth);
    const budgetPerformance = calculateBudgetPerformance(input.budgets, currentExpenseTransactions, input.filters.selectedMonth);
    const goalsProgress = calculateGoalsProgress(input.goals);
    const debtSummary = calculateDebtSummary(input.debts);
    const projection = calculateProjections(summary, dailyExpenses, input.filters.selectedMonth);
    const anomalies = detectAnomalies({ summary, budgetPerformance, dailyExpenses, goalsProgress, debtSummary, projection });
    const recommendations = generateRuleBasedRecommendations({ anomalies, budgetPerformance, projection, goalsProgress, debtSummary });
    const financialHealthScore = calculateFinancialHealthScore({ summary, budgetPerformance, debtSummary, dailyExpenses, selectedMonth: input.filters.selectedMonth });

    return {
      filteredTransactions,
      summary,
      financialHealthScore,
      incomeExpenseTrend,
      expenseBreakdown,
      topCategories,
      dailyExpenses,
      quickSummary,
      budgetPerformance,
      goalsProgress,
      debtSummary,
      anomalies,
      projection,
      recommendations,
    };
  }, [input.transactions, input.budgets, input.categories, input.debts, input.goals, input.filters, input.trendInterval]);
}
```

Catatan teknis: dependency object `input.filters` harus stabil dari Zustand. Jika terjadi rerender berlebih, destructure dependency satu per satu.

---

## 11. Calculation Engine Design

File utama:

```txt
lib/reports/calculations.ts
```

### 11.1 `calculateSummary`

Rules:

1. Income hanya dari `type === "income"`.
2. Expense hanya dari `type === "expense"`.
3. Transfer diabaikan.
4. Savings rate fallback ke 0 jika income 0.

```ts
export function calculateSummary(transactions: Transaction[]): ReportSummary {
  const totalIncome = sumByType(transactions, "income");
  const totalExpense = sumByType(transactions, "expense");
  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;

  return { totalIncome, totalExpense, netCashflow, savingsRate };
}
```

### 11.2 `calculateExpenseBreakdown`

Rules:

1. Hanya expense.
2. Group by normalized category.
3. Persentase fallback 0 jika total expense 0.
4. Sort descending.

### 11.3 `calculateDailyExpenses`

Rules:

1. Generate semua tanggal dalam bulan aktif.
2. Isi amount 0 untuk tanggal tanpa transaksi.
3. Tandai tanggal amount tertinggi sebagai `isHighest`.

### 11.4 `calculateBudgetPerformance`

Rules:

1. Match budget category dengan transaction category berbasis normalized string.
2. Budget tanpa transaksi tetap muncul.
3. Progress visual capped 100 di UI, bukan di data.
4. `usedPercentage` tetap boleh >100.
5. `timeRisk` dihitung dari expected usage.

### 11.5 `calculateDebtSummary`

Rules:

1. Abaikan `is_settled = true`.
2. Gunakan `remainingAmount = max(amount - paid_amount, 0)`.
3. Overdue jika `due_date < today` dan remainingAmount > 0.

### 11.6 `calculateFinancialHealthScore`

Score formula MVP:

```txt
Savings ratio: 25 poin
Budget discipline: 25 poin
Cashflow: 20 poin
Debt health: 15 poin
Spending consistency: 15 poin
```

Status:

```txt
85–100 = Sangat Sehat
70–84 = Sehat
50–69 = Waspada
0–49 = Kritis
```

Fungsi harus mengembalikan breakdown dimensi agar transparan.

---

## 12. Date Utilities Design

File:

```txt
lib/reports/date-utils.ts
```

Fungsi minimal:

```ts
export function getCurrentMonth(): string;
export function getPreviousMonth(month: string): string;
export function getMonthDateRange(month: string): { start: Date; end: Date };
export function getDaysInMonth(month: string): number;
export function getElapsedDaysInMonth(month: string): number;
export function isCurrentMonth(month: string): boolean;
export function formatDateId(date: Date): string;
```

Rules:

1. `selectedMonth` memakai format `YYYY-MM`.
2. Bulan berjalan memakai elapsed day sampai hari ini.
3. Bulan lampau memakai total hari dalam bulan.
4. Bulan masa depan dapat menghasilkan elapsed day 0 atau empty state.

---

## 13. Component Design

### 13.1 `ReportHeader`

Props:

```ts
interface ReportHeaderProps {
  title?: string;
  subtitle?: string;
}
```

Tanggung jawab:

1. Menampilkan judul Laporan.
2. Menampilkan subtitle.
3. Optional export shortcut.

### 13.2 `ReportFilters`

Props:

```ts
interface ReportFiltersProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
}
```

Tanggung jawab:

1. Render dropdown bulan.
2. Render filter kategori.
3. Render filter wallet.
4. Render filter tipe transaksi.
5. Update Zustand store.

### 13.3 `FinancialHealthScore`

Props:

```ts
interface FinancialHealthScoreProps {
  data: FinancialHealthScore;
}
```

Tanggung jawab:

1. Render skor utama.
2. Render status.
3. Render breakdown dimensi.
4. Render label estimasi.

### 13.4 `ReportSummaryCards`

Props:

```ts
interface ReportSummaryCardsProps {
  summary: ReportSummary;
}
```

Cards:

1. Yang Ditabung.
2. Rasio Menabung.
3. Pemasukan.
4. Pengeluaran.

### 13.5 `IncomeExpenseTrend`

Props:

```ts
interface IncomeExpenseTrendProps {
  data: IncomeExpenseTrendPoint[];
}
```

Chart:

1. X-axis label.
2. Bar income.
3. Bar expense.
4. Optional line net.
5. Tooltip Rupiah.

### 13.6 `ExpenseBreakdownChart`

Props:

```ts
interface ExpenseBreakdownChartProps {
  data: ExpenseBreakdownItem[];
}
```

Chart:

1. Donut chart.
2. Tooltip.
3. Legend.
4. Empty state.

### 13.7 `TopCategoriesCard`

Props:

```ts
interface TopCategoriesCardProps {
  data: TopCategoryItem[];
}
```

UI:

1. List maksimal 5 item.
2. Nominal.
3. Percentage.
4. Trend badge.

### 13.8 `DailyExpenseChart`

Props:

```ts
interface DailyExpenseChartProps {
  data: DailyExpensePoint[];
  averageDailyExpense: number;
}
```

Chart:

1. Bar per tanggal.
2. Reference line average.
3. Highlight highest.

### 13.9 `QuickSummaryCard`

Props:

```ts
interface QuickSummaryCardProps {
  data: QuickSummary;
}
```

UI:

1. Rata-rata per hari.
2. Hari terboros.
3. Total transaksi.
4. Hari tanpa pengeluaran.

### 13.10 `BudgetPerformanceTable`

Props:

```ts
interface BudgetPerformanceTableProps {
  data: BudgetPerformanceItem[];
}
```

Desktop:

1. Table.
2. Progress bar.
3. Status badge.

Mobile:

1. Card list atau horizontal scroll.

### 13.11 `GoalsProgressCard`

Props:

```ts
interface GoalsProgressCardProps {
  data: GoalProgressItem[];
}
```

UI:

1. Progress bar.
2. Current / target.
3. Deadline.
4. Completed badge.

### 13.12 `DebtSummaryCard`

Props:

```ts
interface DebtSummaryCardProps {
  data: DebtSummary;
}
```

UI:

1. Total utang aktif.
2. Total piutang aktif.
3. Posisi bersih.
4. Overdue warning.
5. Empty positive state jika tidak ada utang.

### 13.13 `AiInsightReport`

Props:

```ts
interface AiInsightReportProps {
  report: FinancialReportResult;
}
```

Tanggung jawab:

1. Render tombol Buat Insight.
2. Kirim calculated metrics ke AI layer.
3. Simpan result di Zustand.
4. Render insight.
5. Render error state.

### 13.14 `ReportExportCard`

Props:

```ts
interface ReportExportCardProps {
  report: FinancialReportResult;
  transactions: Transaction[];
}
```

Tanggung jawab:

1. Export PDF.
2. Export Excel.
3. Export CSV.
4. Loading dan error state.

---

## 14. AI Insight Flow

### 14.1 Flow

```txt
User klik Buat Insight
        ↓
AiInsightReport mengambil FinancialReportResult
        ↓
Build AiReportInput
        ↓
Call AI service / API route
        ↓
Validate output
        ↓
Store result di Zustand generatedInsight
        ↓
Render insight
```

### 14.2 AI Input Builder

File:

```txt
lib/reports/ai-report.ts
```

Fungsi:

```ts
export function buildAiReportInput(report: FinancialReportResult, period: string): AiReportInput;
```

### 14.3 AI Guardrails

1. Jangan kirim semua raw transactions kecuali benar-benar diperlukan.
2. Jangan izinkan AI membuat angka baru.
3. Jika data kurang, AI harus menyebut data belum cukup.
4. Jika AI gagal, tampilkan fallback rule-based recommendations.

### 14.4 API Route Optional

Jika project menggunakan API route:

```txt
app/api/reports/ai-insight/route.ts
```

Request body:

```ts
interface GenerateInsightRequest {
  input: AiReportInput;
}
```

Response:

```ts
interface GenerateInsightResponse {
  insight: AiReportOutput;
}
```

---

## 15. Export Architecture

File:

```txt
lib/reports/report-export.ts
```

Functions:

```ts
export async function exportReportToPdf(input: ExportReportInput): Promise<void>;
export async function exportReportToExcel(input: ExportReportInput): Promise<void>;
export function exportReportToCsv(input: ExportReportInput): void;
```

Type:

```ts
export interface ExportReportInput {
  period: string;
  report: FinancialReportResult;
  transactions: Transaction[];
  generatedInsight?: GeneratedInsight | null;
}
```

### 15.1 PDF Export

Isi:

1. Header.
2. Periode.
3. Summary.
4. Financial score.
5. Top categories.
6. Budget table.
7. Goals.
8. Debt summary.
9. AI insight jika tersedia.
10. Transaction table ringkas.

### 15.2 Excel Export

Sheets:

1. Ringkasan.
2. Transaksi.
3. Budget Performance.
4. Goals.
5. Debts.
6. Categories.

### 15.3 CSV Export

CSV hanya untuk transaksi sesuai filter.

---

## 16. Loading, Empty, dan Error Strategy

### 16.1 Loading State

Loading diperlukan pada:

1. Initial page load.
2. Generate AI insight.
3. Export PDF/Excel/CSV.

### 16.2 Empty State

Komponen reusable:

```txt
components/reports/report-empty-state.tsx
```

Props:

```ts
interface ReportEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}
```

### 16.3 Error State

Error tidak boleh menampilkan stack trace.

Pesan error:

1. Data fetch gagal: `Terdapat masalah saat memuat laporan.`
2. AI gagal: `Insight AI belum bisa dibuat saat ini.`
3. Export gagal: `Export gagal. Periksa data laporan dan coba lagi.`

---

## 17. Styling dan UI Implementation Notes

### 17.1 Container

Gunakan:

```txt
max-w-7xl mx-auto space-y-6 pb-20
```

### 17.2 Card Style

Gunakan pattern:

```txt
rounded-[2rem] bg-white dark:bg-card shadow-[0_20px_50px_rgba(44,47,48,0.04)] p-6
```

Sesuaikan dengan design system existing Ngaturin.

### 17.3 Chart Colors

Gunakan warna konsisten:

1. Income: hijau.
2. Expense: merah/salmon.
3. Net/cashflow: ungu/biru.
4. Neutral: muted.

### 17.4 Mobile Layout

Gunakan:

```txt
grid grid-cols-1 lg:grid-cols-2 gap-6
```

Full width section:

```txt
col-span-full
```

---

## 18. Navigation Migration Design

### 18.1 Sidebar Update

File kemungkinan:

```txt
components/layout/sidebar.tsx
```

Perubahan:

1. Ganti label `Smart Analytics` atau `Insight` menjadi `Laporan`.
2. Ganti href ke `/dashboard/reports`.
3. Pastikan icon sesuai.
4. Pastikan active state untuk `/dashboard/reports` dan `/dashboard/insights` jika compatibility route masih ada.

### 18.2 Legacy Route

`app/dashboard/insights/page.tsx` dapat dibuat redirect:

```ts
import { redirect } from "next/navigation";

export default function InsightsPage() {
  redirect("/dashboard/reports");
}
```

Jika redirect berisiko mengganggu existing link, route lama dapat render ReportsPage sementara, tetapi redirect lebih bersih.

---

## 19. Testing Design

### 19.1 Unit Test Focus

Prioritas unit test:

1. `calculateSummary`.
2. `calculateDailyExpenses`.
3. `calculateBudgetPerformance`.
4. `calculateDebtSummary`.
5. `calculateProjections`.
6. `detectAnomalies`.

### 19.2 Critical Test Cases

1. No transactions.
2. Income zero.
3. Expense zero.
4. Transfer only.
5. Budget amount zero.
6. Debt partially paid.
7. Debt overpaid.
8. Future month.
9. Previous period missing.
10. Invalid date.

### 19.3 Manual QA Checklist

1. Open `/dashboard/reports`.
2. Change month filter.
3. Change category filter.
4. Change wallet filter.
5. Verify summary cards.
6. Verify charts.
7. Verify budget table.
8. Verify goals progress.
9. Verify debt summary.
10. Generate AI insight.
11. Export PDF.
12. Export Excel.
13. Export CSV.
14. Test mobile viewport.
15. Test empty account.

---

## 20. Implementation Phases

### Phase 1 — Foundation

Files:

1. `app/dashboard/reports/page.tsx`.
2. `app/dashboard/reports/reports-client-view.tsx`.
3. `stores/use-report-store.ts`.
4. `lib/reports/report-types.ts`.
5. `lib/reports/date-utils.ts`.
6. `lib/reports/calculations.ts`.
7. `hooks/use-financial-report.ts`.

Deliverables:

1. Route baru.
2. Store.
3. Basic calculation.
4. Basic layout.

### Phase 2 — Core UI

Components:

1. Header.
2. Filters.
3. Financial score.
4. Summary cards.
5. Income expense trend.
6. Expense breakdown.
7. Top categories.
8. Daily expense.
9. Quick summary.

### Phase 3 — Extended Report

Components:

1. Budget performance.
2. Goals progress.
3. Debt summary.
4. Empty state.
5. Error state.

### Phase 4 — AI and Export

Files:

1. `lib/reports/ai-report.ts`.
2. `components/reports/ai-insight-report.tsx`.
3. `lib/reports/report-export.ts`.
4. `components/reports/report-export-card.tsx`.

### Phase 5 — Migration Cleanup

Tasks:

1. Update sidebar.
2. Redirect legacy route.
3. Remove unused old Smart Analytics code if safe.
4. Add tests.
5. Run build and lint.

---

## 21. Performance Considerations

1. Gunakan `useMemo` di `useFinancialReport`.
2. Hindari menghitung ulang chart data di setiap component.
3. Jangan menyimpan duplicated calculated result di Zustand.
4. Export hanya dijalankan on-demand.
5. Jika dataset membesar, pindahkan filtering transaksi ke server query.
6. Jika chart berat, lazy render chart setelah mount seperti pola existing `chartsReady`.

---

## 22. Security and Privacy Considerations

1. Semua fetch harus berdasarkan user aktif.
2. Jangan kirim raw transactions penuh ke AI.
3. Jangan persist data finansial ke localStorage.
4. Export hanya memakai data user aktif.
5. Jangan expose Supabase service role key di client.
6. Jangan tampilkan error internal ke user.

---

## 23. Risks and Mitigations

### 23.1 Data Category Inconsistency

Risiko: grouping kategori tidak akurat.

Mitigasi:

1. Normalisasi ringan.
2. Gunakan fallback `Tanpa Kategori`.
3. Rencanakan migrasi `category_id`.

### 23.2 Over-Engineering

Risiko: terlalu banyak komponen sebelum MVP berjalan.

Mitigasi:

1. Implementasi bertahap.
2. Prioritaskan calculation layer dan core UI.
3. AI dan export belakangan.

### 23.3 AI Hallucination

Risiko: AI membuat klaim yang tidak didukung data.

Mitigasi:

1. Input AI berupa metrics.
2. Prompt guardrails.
3. UI tidak memakai angka dari AI sebagai source of truth.

### 23.4 NaN and Invalid Data

Risiko: data kosong menyebabkan NaN.

Mitigasi:

1. Helper safe divide.
2. Fallback amount 0.
3. Unit test edge cases.

---

## 24. Definition of Technical Done

Implementasi dianggap selesai secara teknis jika:

1. Route `/dashboard/reports` aktif.
2. Sidebar mengarah ke Laporan.
3. Legacy route `/dashboard/insights` tidak lagi menampilkan UI lama.
4. Zustand store tersedia dan hanya menyimpan UI/filter state.
5. `useFinancialReport` tersedia.
6. Calculation layer terpisah dari UI.
7. Semua section utama render dari props hasil kalkulasi.
8. AI insight memakai calculated metrics.
9. Export functions terpisah dari component.
10. Empty state dan error state tersedia.
11. Layout desktop dan mobile layak.
12. Tidak ada NaN pada skenario edge case utama.
13. Build project berhasil.
14. Linting tidak menghasilkan error kritis.

---

## 25. Open Questions

1. Apakah route lama `/dashboard/insights` langsung redirect atau dipertahankan sementara sebagai alias?
2. Apakah AI insight akan memakai API route internal atau hook/service existing?
3. Apakah export PDF perlu menyertakan chart visual atau cukup data tabel dan ringkasan?
4. Apakah budget `month` sudah selalu konsisten `YYYY-MM` di seluruh data existing?
5. Apakah data transaksi perlu dibatasi per tahun untuk menghindari payload besar?
6. Apakah report perlu memiliki mode `Semua Waktu`, atau hanya laporan bulanan?

Keputusan awal yang disarankan:

1. Redirect `/dashboard/insights` ke `/dashboard/reports`.
2. Gunakan laporan bulanan sebagai default dan fokus utama.
3. Export PDF fase awal cukup ringkasan dan tabel, chart visual optional.
4. AI insight gunakan calculated metrics saja.
