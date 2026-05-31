# REPORTS_EXPORT_SPECIFICATION — Fitur Export Laporan Ngaturin

## 1. Informasi Dokumen

**Nama Sistem:** Ngaturin  
**Nama Modul:** Laporan  
**Subfitur:** Export Configuration Modal  
**Tipe Dokumen:** Export Specification  
**Versi:** 1.0 Final Draft  
**Status:** Source of truth untuk desain dan implementasi Export Laporan  
**Target Route:** `/dashboard/reports`  

Dokumen terkait:

- `docs/PRD_LAPORAN.md`
- `docs/SRS_LAPORAN.md`
- `docs/TDD_LAPORAN.md`
- `docs/REPORTS_DATA_MAPPING.md`
- `docs/REPORTS_IMPLEMENTATION_PLAN.md`

Dokumen ini menjadi acuan utama untuk implementasi Export Laporan, termasuk UI modal, format file, dataset selection, field selection, paywall, entitlement, naming convention, error handling, dan task implementasi.

---

## 2. Tujuan

Fitur Export Laporan harus memberikan kontrol kepada pengguna sebelum file dibuat. Export tidak boleh hanya berupa tombol langsung unduh.

Tujuan utama:

1. Memungkinkan user memilih format export.
2. Memungkinkan user memilih dataset yang akan diekspor.
3. Memungkinkan user memilih field transaksi untuk CSV dan Excel.
4. Menyesuaikan opsi export berdasarkan paket langganan Free, Plus, dan Pro.
5. Mencegah export data yang tidak tersedia atau tidak dimiliki aksesnya.
6. Menjaga privacy data finansial user.
7. Menyediakan file export yang konsisten, rapi, dan sesuai periode aktif.

---

## 3. Ringkasan Fitur

Fitur Export Laporan terdiri dari:

1. Tombol/trigger Export di halaman Laporan.
2. Modal `Ekspor Data`.
3. Format selector:
   - PDF.
   - Excel `.xlsx`.
   - CSV.
4. Rentang tanggal mengikuti periode laporan aktif.
5. Dataset selection.
6. Field selection transaksi.
7. Paywall/locked state sesuai entitlement.
8. Tombol `Unduh`.
9. Loading, success, dan error state.

---

## 4. Referensi UX

Export mengacu pada pola modal dari referensi UI yang diberikan:

1. Modal berada di tengah layar.
2. Background halaman di belakang dibuat dim/blur.
3. Modal memiliki rounded corner besar.
4. Tombol close berada di kanan atas.
5. Format dipilih melalui segmented control.
6. Data yang diekspor ditampilkan sebagai list checkbox.
7. Dataset transaksi dapat diexpand untuk memilih field.
8. Locked dataset menampilkan label paket.
9. CTA utama adalah tombol `Unduh` full width.

---

## 5. Paywall Model

### 5.1 Paket Langganan

Ngaturin menggunakan tiga paket:

1. Free.
2. Plus.
3. Pro.

### 5.2 Entitlement Source

Entitlement export berasal dari tabel Supabase:

```txt
subscription_plans
plan_features
feature_usage_events
```

Function Supabase yang tersedia:

```sql
public.get_user_active_plan(target_user_id uuid default auth.uid())
public.user_has_feature(feature text, target_user_id uuid default auth.uid())
public.get_user_feature_entitlement(feature text, target_user_id uuid default auth.uid())
```

### 5.3 Feature Keys

Feature key terkait Export:

```txt
reports.export.csv
reports.export.excel
reports.export.pdf
reports.debt_export
reports.ai_insight
reports.investment_snapshot
reports.advanced_trends
```

### 5.4 Paket dan Akses Export

| Paket | CSV | Excel | PDF | AI Insight | Investment Snapshot | Advanced Trends |
|---|---|---|---|---|---|---|
| Free | Ya | Tidak | Tidak | Tidak | Tidak | Tidak |
| Plus | Ya | Ya | Ya | Terbatas | Tidak | Tidak |
| Pro | Ya | Ya | Ya | Ya | Ya | Ya |

### 5.5 Prinsip Paywall

1. Export CSV tetap tersedia untuk Free.
2. Export Excel dan PDF tersedia untuk Plus dan Pro.
3. AI Insight dalam export hanya masuk jika user memiliki entitlement `reports.ai_insight`.
4. Investment Snapshot hanya tersedia untuk Pro.
5. Advanced Trends hanya tersedia untuk Pro.
6. Locked state harus informatif, bukan menyembunyikan fitur sepenuhnya.

---

## 6. Export Modal UI Specification

### 6.1 Modal Layout

Struktur modal:

```txt
Ekspor Data                                      [X]

Format
[PDF] [Excel (.xlsx)] [CSV]

Rentang Tanggal
01 Mar 2026 - 31 Mar 2026
Mengikuti periode laporan aktif

Data yang Diekspor
[✓] Ringkasan Laporan
[✓] Transaksi                         6/8
    [✓] Tanggal       [✓] Tipe
    [✓] Deskripsi     [✓] Kategori
    [✓] Jumlah        [✓] Dompet
    [ ] Tagihan       [ ] Utang/Piutang
[✓] Performa Anggaran
[✓] Goals
[✓] Utang & Piutang
[ ] Insight AI
[🔒] Investment Snapshot — Pro

[Unduh]
```

### 6.2 Komponen UI

File komponen yang direkomendasikan:

```txt
components/reports/report-export-modal.tsx
components/reports/report-export-card.tsx
components/reports/export-format-selector.tsx
components/reports/export-dataset-list.tsx
components/reports/export-field-selector.tsx
components/reports/export-locked-item.tsx
```

### 6.3 Modal Props

```ts
interface ReportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: string;
  report: FinancialReportResult;
  transactions: Transaction[];
  generatedInsight?: GeneratedInsight | null;
  entitlements: ReportExportEntitlements;
}
```

---

## 7. Format Behavior

### 7.1 CSV

CSV difokuskan untuk transaksi mentah.

Behavior:

1. Dataset utama: Transaksi.
2. Dataset lain tidak ditampilkan atau disabled.
3. Field selection transaksi wajib tersedia.
4. File output satu file `.csv`.
5. Free, Plus, dan Pro dapat menggunakan CSV.

Filename:

```txt
transaksi-ngaturin-YYYY-MM.csv
```

### 7.2 Excel

Excel difokuskan untuk multi-sheet data laporan.

Behavior:

1. User dapat memilih dataset/sheet.
2. Transaksi memiliki field selection.
3. Dataset premium tampil locked jika entitlement tidak tersedia.
4. Output satu file `.xlsx`.
5. Hanya Plus dan Pro.

Filename:

```txt
laporan-ngaturin-YYYY-MM.xlsx
```

### 7.3 PDF

PDF difokuskan untuk laporan ringkas.

Behavior:

1. User dapat memilih section laporan.
2. Field-level transaction selection tidak wajib, kecuali ada tabel transaksi ringkas.
3. Output satu file `.pdf`.
4. Hanya Plus dan Pro.

Filename:

```txt
laporan-ngaturin-YYYY-MM.pdf
```

---

## 8. Dataset Selection Rules

### 8.1 Dataset Key

```ts
export type ExportDatasetKey =
  | "summary"
  | "financial_score"
  | "transactions"
  | "top_categories"
  | "budget_performance"
  | "goals"
  | "debts"
  | "categories"
  | "ai_insight"
  | "investment_snapshot"
  | "advanced_trends";
```

### 8.2 Dataset Per Format

#### CSV

| Dataset | Default | Required | Entitlement |
|---|---:|---:|---|
| Transactions | Ya | Ya | `reports.export.csv` |

#### Excel

| Dataset | Default | Required | Entitlement |
|---|---:|---:|---|
| Ringkasan | Ya | Tidak | `reports.export.excel` |
| Transaksi | Ya | Tidak | `reports.export.excel` |
| Budget Performance | Ya | Tidak | `reports.export.excel` |
| Goals | Ya | Tidak | `reports.export.excel` |
| Debts | Ya | Tidak | `reports.export.excel` + optional `reports.debt_export` |
| Categories | Ya | Tidak | `reports.export.excel` |
| Insight AI | Tidak | Tidak | `reports.ai_insight` |
| Investment Snapshot | Tidak | Tidak | `reports.investment_snapshot` |

#### PDF

| Dataset | Default | Required | Entitlement |
|---|---:|---:|---|
| Ringkasan | Ya | Tidak | `reports.export.pdf` |
| Financial Score | Ya | Tidak | `reports.export.pdf` |
| Top Categories | Ya | Tidak | `reports.export.pdf` |
| Budget Performance | Ya | Tidak | `reports.export.pdf` |
| Goals | Ya | Tidak | `reports.export.pdf` |
| Debt Summary | Ya | Tidak | `reports.export.pdf` |
| Insight AI | Tidak | Tidak | `reports.ai_insight` |
| Investment Snapshot | Tidak | Tidak | `reports.investment_snapshot` |

### 8.3 Dataset Validation

1. Minimal satu dataset harus dipilih.
2. Dataset locked tidak boleh masuk payload export.
3. Dataset kosong dapat ditampilkan disabled dengan label `Tidak ada data`.
4. Dataset AI hanya aktif jika insight sudah dibuat atau dapat dibuat oleh user.

---

## 9. Transaction Field Selection Rules

### 9.1 Field Valid Berdasarkan Schema Saat Ini

Field transaksi yang valid:

```ts
export type TransactionExportField =
  | "date"
  | "description"
  | "category"
  | "type"
  | "amount"
  | "wallet"
  | "bill"
  | "debt";
```

### 9.2 Label Field

| Field | Label UI | Source |
|---|---|---|
| `date` | Tanggal | `transactions.date` |
| `description` | Deskripsi | `transactions.description` |
| `category` | Kategori | `transactions.category` |
| `type` | Tipe | `transactions.type` |
| `amount` | Jumlah | `transactions.amount` |
| `wallet` | Dompet | `wallets.name` via `wallet_id` |
| `bill` | Tagihan | `recurring_bills.name` via `bill_id` |
| `debt` | Utang/Piutang | `debts.person_name` / `debts.type` via `debt_id` |

### 9.3 Field yang Tidak Boleh Ditampilkan pada MVP

Field berikut tidak boleh ditampilkan karena belum ada di schema Supabase saat ini:

1. Sub Kategori.
2. Ke Dompet.
3. Catatan.
4. Tags.

### 9.4 Default Selected Fields

Default field transaksi:

```txt
Tanggal
Deskripsi
Kategori
Tipe
Jumlah
Dompet
```

Optional unchecked:

```txt
Tagihan
Utang/Piutang
```

### 9.5 Field Count Indicator

Format:

```txt
6/8
```

atau:

```txt
6/8 field
```

Rule:

```txt
selectedFields.length / availableFields.length
```

---

## 10. Export State Management

### 10.1 Local State Modal

Export modal dapat menggunakan local component state.

```ts
interface ExportModalState {
  format: "pdf" | "excel" | "csv";
  selectedDatasets: ExportDatasetKey[];
  selectedTransactionFields: TransactionExportField[];
  expandedDatasets: ExportDatasetKey[];
  isExporting: boolean;
  error: string | null;
}
```

### 10.2 Zustand

Zustand tidak wajib menyimpan export modal state. Jika ingin menyimpan, cukup:

1. `isExportModalOpen`.
2. `lastExportFormat`.

Jangan simpan generated file atau raw export payload di Zustand.

### 10.3 Reset Behavior

Ketika format berubah:

1. Dataset selection disesuaikan dengan format.
2. Field selection transaksi tetap dipertahankan jika masih relevan.
3. Error state direset.

Ketika periode laporan berubah:

1. Modal jika terbuka dapat tetap terbuka, tetapi date range berubah.
2. Export payload harus mengikuti periode terbaru.

---

## 11. Entitlement Resolution Flow

### 11.1 Frontend Input

Frontend membutuhkan entitlement map:

```ts
interface ReportExportEntitlements {
  activePlan: "free" | "plus" | "pro";
  features: Record<string, {
    isEnabled: boolean;
    limitValue: number | null;
    metadata?: Record<string, unknown>;
  }>;
}
```

### 11.2 Fetch Entitlements

Disarankan membuat helper:

```ts
getReportEntitlements(userId): Promise<ReportExportEntitlements>
```

Query dapat membaca:

1. `get_user_active_plan()`.
2. `plan_features` untuk active plan.

### 11.3 Locked State

Jika feature disabled:

1. Checkbox disabled.
2. Label lock ditampilkan.
3. Badge paket ditampilkan, misalnya `Plus` atau `Pro`.
4. Klik item dapat membuka upgrade prompt.

### 11.4 Export Guard

Sebelum export dijalankan:

1. Validasi entitlement format.
2. Validasi dataset entitlement.
3. Validasi minimal satu dataset.
4. Validasi minimal satu field transaksi jika dataset transaksi dipilih.

---

## 12. Export Payload Contract

### 12.1 General Contract

```ts
export interface ExportReportInput {
  period: string;
  format: "pdf" | "excel" | "csv";
  selectedDatasets: ExportDatasetKey[];
  selectedTransactionFields: TransactionExportField[];
  report: FinancialReportResult;
  transactions: Transaction[];
  generatedInsight?: GeneratedInsight | null;
  entitlements: ReportExportEntitlements;
}
```

### 12.2 CSV Payload

Required:

1. `format = csv`.
2. `selectedDatasets = [transactions]`.
3. `selectedTransactionFields.length > 0`.

### 12.3 Excel Payload

Required:

1. `format = excel`.
2. At least one selected dataset.
3. Entitlement `reports.export.excel = true`.

### 12.4 PDF Payload

Required:

1. `format = pdf`.
2. At least one selected dataset.
3. Entitlement `reports.export.pdf = true`.

---

## 13. File Naming Rules

### 13.1 CSV

```txt
transaksi-ngaturin-YYYY-MM.csv
```

### 13.2 Excel

```txt
laporan-ngaturin-YYYY-MM.xlsx
```

### 13.3 PDF

```txt
laporan-ngaturin-YYYY-MM.pdf
```

### 13.4 Future Custom Range

Jika nanti ada custom date range:

```txt
laporan-ngaturin-YYYY-MM-DD_to_YYYY-MM-DD.xlsx
```

---

## 14. Error Handling

### 14.1 No Dataset Selected

Message:

```txt
Pilih minimal satu data untuk diekspor.
```

### 14.2 No Transaction Field Selected

Message:

```txt
Pilih minimal satu field transaksi.
```

### 14.3 Feature Locked

Message:

```txt
Fitur ini tersedia di paket Plus atau Pro.
```

atau:

```txt
Fitur ini tersedia di paket Pro.
```

### 14.4 No Data

Message:

```txt
Tidak ada data pada periode ini untuk diekspor.
```

### 14.5 Export Failed

Message:

```txt
Export gagal. Periksa data laporan dan coba lagi.
```

---

## 15. Security and Privacy Rules

1. Export hanya memuat data user aktif.
2. Export tidak boleh memuat data user lain.
3. File export tidak disimpan permanen tanpa persetujuan user.
4. Data finansial mentah tidak disimpan di localStorage.
5. Export payload tidak dikirim ke AI.
6. Entitlement harus divalidasi sebelum export, bukan hanya di UI.
7. Jika export dilakukan server-side, endpoint harus membutuhkan session/JWT.

---

## 16. Usage Tracking

### 16.1 Table

Usage tracking menggunakan:

```txt
feature_usage_events
```

### 16.2 Event Keys

Event yang direkam:

```txt
reports.export.csv
reports.export.excel
reports.export.pdf
```

### 16.3 Metadata

Metadata contoh:

```json
{
  "period": "2026-03",
  "format": "excel",
  "datasets": ["summary", "transactions", "budget_performance"],
  "transactionFieldCount": 6
}
```

### 16.4 Timing

Usage event dicatat setelah export berhasil, bukan saat user membuka modal.

---

## 17. Acceptance Criteria

### 17.1 Modal

1. Tombol Export membuka modal.
2. Modal dapat ditutup.
3. Modal menampilkan format selector.
4. Modal menampilkan rentang tanggal.
5. Modal menampilkan dataset sesuai format.
6. Modal menampilkan field selector transaksi.
7. Modal menampilkan locked state untuk fitur premium.

### 17.2 CSV

1. CSV tersedia untuk Free, Plus, dan Pro.
2. CSV hanya mengekspor transaksi.
3. User dapat memilih field transaksi.
4. Field yang tidak ada di schema tidak muncul.
5. File name sesuai format.

### 17.3 Excel

1. Excel hanya tersedia untuk Plus dan Pro.
2. Excel mendukung multi-sheet.
3. Dataset locked tidak masuk file.
4. Transaksi menggunakan selected fields.
5. File name sesuai format.

### 17.4 PDF

1. PDF hanya tersedia untuk Plus dan Pro.
2. PDF berisi section laporan ringkas.
3. Insight AI hanya masuk jika user memiliki akses dan insight tersedia.
4. File name sesuai format.

### 17.5 Paywall

1. Free melihat Excel/PDF sebagai locked.
2. Plus melihat Investment Snapshot dan Advanced Trends sebagai locked.
3. Pro melihat semua fitur export lanjutan terbuka.
4. Locked item tidak bisa dipilih.

### 17.6 Error Handling

1. Tidak ada dataset dipilih menampilkan error.
2. Tidak ada field transaksi dipilih menampilkan error.
3. Export gagal menampilkan error.
4. Loading state tampil saat export berjalan.

---

## 18. Implementation Tasks

### Task E1 — Create Export Specification Types

File:

```txt
lib/reports/export-types.ts
```

Isi:

1. `ExportFormat`.
2. `ExportDatasetKey`.
3. `TransactionExportField`.
4. `ReportExportEntitlements`.
5. `ExportReportInput`.

### Task E2 — Create Entitlement Helper

File:

```txt
lib/reports/report-entitlements.ts
```

Tanggung jawab:

1. Fetch active plan.
2. Fetch plan features.
3. Return entitlement map.

### Task E3 — Create Export Modal Component

File:

```txt
components/reports/report-export-modal.tsx
```

Tanggung jawab:

1. Render modal.
2. Manage format state.
3. Manage dataset selection.
4. Manage transaction field selection.
5. Render locked states.

### Task E4 — Update Export Card Trigger

File:

```txt
components/reports/report-export-card.tsx
```

Tanggung jawab:

1. Render button `Export`.
2. Open modal.
3. Pass report and entitlements.

### Task E5 — Update Export Functions

File:

```txt
lib/reports/report-export.ts
```

Tanggung jawab:

1. Support selected datasets.
2. Support selected transaction fields.
3. Validate entitlement.
4. Generate CSV/Excel/PDF.

### Task E6 — Add Usage Tracking

Tanggung jawab:

1. Insert `feature_usage_events` after successful export.
2. Include period, format, datasets metadata.

### Task E7 — QA Export Modal

Test:

1. Free user.
2. Plus user.
3. Pro user.
4. Empty data.
5. No field selected.
6. No dataset selected.
7. CSV output.
8. Excel output.
9. PDF output.

---

## 19. Document Update References

Dokumen ini menjadi single source of truth untuk Export Laporan.

Dokumen lain cukup merujuk ke dokumen ini:

1. `PRD_LAPORAN.md` untuk scope produk export modal.
2. `SRS_LAPORAN.md` untuk functional requirement export modal.
3. `TDD_LAPORAN.md` untuk component design.
4. `REPORTS_IMPLEMENTATION_PLAN.md` untuk task export modal.

---

## 20. Definition of Done

Export Laporan dianggap selesai jika:

1. Export menggunakan modal konfigurasi.
2. Format PDF, Excel, CSV tersedia sesuai entitlement.
3. CSV field selection berjalan.
4. Excel dataset selection berjalan.
5. PDF section selection berjalan.
6. Paywall Free/Plus/Pro tampil benar.
7. Locked dataset tidak dapat diekspor.
8. Export mengikuti periode aktif.
9. File name sesuai format.
10. Export error ditangani.
11. Usage event dicatat setelah export berhasil.
12. Tidak ada field yang tidak tersedia di database ditampilkan pada modal MVP.
