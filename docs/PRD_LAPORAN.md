# PRD — Facelift Total Smart Analytics menjadi Fitur Laporan Ngaturin

## 1. Informasi Dokumen

**Nama Produk:** Ngaturin  
**Nama Fitur Baru:** Laporan  
**Fitur Lama:** Smart Analytics / Smart Insights  
**Tipe Dokumen:** Product Requirements Document  
**Versi:** 1.0 Final Draft  
**Status:** Acuan produk untuk implementasi awal  
**Target Platform:** Web Dashboard  
**Target Route:** `/dashboard/reports`  
**Legacy Route:** `/dashboard/insights`  

Dokumen terkait:

- `docs/SRS_LAPORAN.md`
- `docs/TDD_LAPORAN.md`
- `docs/REPORTS_DATA_MAPPING.md`
- `docs/REPORTS_IMPLEMENTATION_PLAN.md`

---

## 2. Ringkasan Eksekutif

Fitur **Laporan** adalah pengganti penuh dari fitur **Smart Analytics / Smart Insights** pada Ngaturin. Tujuan utamanya adalah mengubah halaman yang sebelumnya berfokus pada visualisasi transaksi menjadi pusat analisis keuangan personal yang lebih lengkap, diagnostik, prediktif, dan actionable.

Halaman Laporan harus membantu pengguna memahami kondisi keuangan bulanannya melalui:

1. Skor kesehatan finansial.
2. Ringkasan pemasukan, pengeluaran, tabungan, dan rasio tabungan.
3. Tren pemasukan vs pengeluaran.
4. Rincian pengeluaran per kategori.
5. Kategori pengeluaran teratas.
6. Pengeluaran harian.
7. Ringkasan cepat perilaku transaksi.
8. Performa anggaran.
9. Progress goals.
10. Ringkasan utang dan piutang.
11. Insight AI berbasis hasil kalkulasi sistem.
12. Export laporan dalam format PDF, Excel, dan CSV.

Arah produk yang digunakan:

```txt
Data → Diagnosis → Prediksi → Rekomendasi
```

Dengan pendekatan ini, pengguna tidak hanya melihat grafik, tetapi juga memahami risiko, prioritas, dan tindakan konkret yang perlu dilakukan.

---

## 3. Latar Belakang

Fitur Smart Analytics saat ini sudah memiliki beberapa elemen penting seperti filter transaksi, visualisasi kategori, tren transaksi, status keuangan, export PDF/Excel/CSV, serta tab aset dan kewajiban. Namun, fitur tersebut masih belum cukup kuat sebagai alat pengambilan keputusan keuangan personal.

Kelemahan utama fitur lama:

1. Lebih menyerupai chart viewer daripada laporan finansial.
2. Pengguna masih harus menyimpulkan sendiri kondisi keuangannya.
3. Tidak ada skor kesehatan finansial yang menjelaskan kondisi secara cepat.
4. Tidak ada deteksi risiko budget secara eksplisit.
5. Tidak ada proyeksi akhir bulan yang jelas.
6. Tidak ada rekomendasi tindakan yang spesifik dan dapat dilakukan.
7. AI insight berisiko menjadi narasi umum jika tidak ditopang kalkulasi rule-based.
8. Struktur UI belum mengikuti alur laporan yang sistematis.

Berdasarkan referensi UI Budggt, halaman baru perlu dibuat lebih menyerupai dashboard laporan personal finance modern: ringkasan di atas, detail analitik di tengah, dan rekomendasi di bawah.

---

## 4. Tujuan Produk

Tujuan utama fitur Laporan:

1. Mengganti penuh pengalaman Smart Analytics menjadi fitur Laporan.
2. Memberikan evaluasi kondisi finansial bulanan secara cepat dan jelas.
3. Menampilkan skor kesehatan finansial berbasis beberapa dimensi.
4. Membantu pengguna mengidentifikasi kategori pengeluaran terbesar.
5. Membantu pengguna mengetahui risiko budget sebelum over-budget.
6. Menampilkan progress goals agar tujuan finansial tetap terpantau.
7. Menampilkan ringkasan utang/piutang sebagai bagian dari kesehatan finansial.
8. Menghasilkan Insight AI yang berbasis angka hasil kalkulasi sistem.
9. Menyediakan export laporan yang lebih lengkap dan sesuai periode aktif.
10. Mengurangi beban kognitif pengguna dalam membaca kondisi keuangan.

---

## 5. Masalah yang Diselesaikan

Fitur Laporan harus menjawab pertanyaan pengguna berikut:

1. Apakah kondisi keuangan saya sehat bulan ini?
2. Berapa pemasukan, pengeluaran, dan sisa uang saya?
3. Berapa rasio tabungan saya?
4. Kategori pengeluaran apa yang paling besar?
5. Hari apa yang paling boros?
6. Apakah budget saya masih aman?
7. Apakah ada kategori yang hampir habis atau over-budget?
8. Apakah goals saya berjalan sesuai target?
9. Apakah utang saya masih terkendali?
10. Apakah saya masih aman sampai akhir bulan?
11. Apa tindakan konkret yang harus saya lakukan?
12. Bisakah saya menyimpan atau mengekspor laporan ini?

---

## 6. Sasaran Pengguna

### 6.1 Pengguna Utama

1. Mahasiswa.
2. Pekerja awal karier.
3. Freelancer.
4. Pengguna personal finance yang ingin mengelola keuangan bulanan.
5. Pengguna yang sudah mencatat transaksi, budget, goals, utang/piutang, dan investasi di Ngaturin.

### 6.2 Kebutuhan Pengguna

Pengguna membutuhkan halaman yang dapat:

1. Menyederhanakan data transaksi menjadi laporan yang mudah dipahami.
2. Memberi sinyal risiko lebih awal.
3. Memberi rekomendasi yang spesifik.
4. Membantu evaluasi kebiasaan finansial.
5. Menyediakan laporan yang bisa diekspor.
6. Menjelaskan kondisi keuangan tanpa harus menghitung manual.

### 6.3 Persona Ringkas

#### Persona 1 — Mahasiswa

Kebutuhan:

1. Mengetahui pengeluaran terbesar.
2. Mengontrol uang makan, transportasi, dan hiburan.
3. Melihat apakah tabungan masih aman sampai akhir bulan.

#### Persona 2 — Pekerja Awal Karier

Kebutuhan:

1. Memantau pemasukan dan pengeluaran bulanan.
2. Mengevaluasi budget.
3. Melihat progress dana darurat atau goals.
4. Menghindari lifestyle inflation.

#### Persona 3 — Freelancer

Kebutuhan:

1. Melihat cashflow yang tidak selalu stabil.
2. Membandingkan income dan expense.
3. Mengetahui apakah pengeluaran harus dikurangi saat pemasukan turun.

---

## 7. Ruang Lingkup Produk

### 7.1 In Scope

Fitur yang masuk scope:

1. Rename menu Smart Analytics menjadi Laporan.
2. Route baru `/dashboard/reports`.
3. Redirect atau compatibility route `/dashboard/insights`.
4. Header dan filter periode.
5. Skor kesehatan finansial.
6. Kartu ringkasan utama.
7. Tren pemasukan vs pengeluaran.
8. Rincian pengeluaran per kategori.
9. Kategori teratas.
10. Pengeluaran harian.
11. Ringkasan cepat.
12. Performa anggaran.
13. Progress goals.
14. Ringkasan utang/piutang.
15. Insight AI berbasis rule-based analytics.
16. Export PDF, Excel, CSV.
17. Zustand untuk state UI/filter.
18. Pure calculation layer untuk semua angka laporan.
19. Empty state, error state, dan loading state.
20. Responsiveness desktop dan mobile.

### 7.2 Out of Scope

Hal yang tidak dikerjakan pada tahap awal:

1. Integrasi bank otomatis.
2. Credit scoring.
3. Financial advisor conversational AI penuh.
4. Prediksi investasi real-time.
5. Migrasi besar seluruh kategori ke foreign key.
6. Perhitungan net worth penuh berbasis seluruh aset.
7. Multi-currency.
8. Kolaborasi laporan antar pengguna.
9. Export visual chart sebagai image resolusi tinggi.
10. Integrasi pajak.
11. Penyimpanan permanen AI insight ke database.

---

## 8. Prinsip Produk

### 8.1 Data Lebih Penting daripada Narasi

Semua angka utama harus berasal dari data dan kalkulasi sistem. Narasi AI hanya membantu menjelaskan.

### 8.2 Insight Harus Actionable

Insight harus menjawab tindakan apa yang bisa dilakukan pengguna, bukan sekadar menjelaskan grafik.

### 8.3 Transparansi Skor

Skor kesehatan finansial harus memiliki breakdown dimensi agar pengguna memahami asal nilainya.

### 8.4 Jangan Mengarang Tren

Jika data periode sebelumnya tidak tersedia, sistem harus menyatakan data pembanding belum tersedia.

### 8.5 Aman terhadap Data Kosong

Aplikasi harus tetap berguna meskipun data belum lengkap.

---

## 9. Data Source Produk

Fitur Laporan menggunakan struktur data Supabase yang sudah tersedia.

### 9.1 `transactions`

Digunakan untuk:

1. Total pemasukan.
2. Total pengeluaran.
3. Net cashflow.
4. Rasio menabung.
5. Tren pemasukan vs pengeluaran.
6. Rincian kategori.
7. Kategori teratas.
8. Pengeluaran harian.
9. Ringkasan cepat.
10. Proyeksi akhir bulan.

### 9.2 `budgets`

Digunakan untuk performa anggaran.

### 9.3 `categories`

Digunakan untuk metadata kategori, icon, tipe kategori, dan budget group.

### 9.4 `wallets`

Digunakan untuk filter wallet dan identifikasi sumber transaksi.

### 9.5 `recurring_bills`

Digunakan untuk tagihan rutin dan komitmen bulanan. Pada MVP, section khusus tagihan bersifat optional.

### 9.6 `debts`

Digunakan untuk ringkasan utang, piutang, overdue, dan posisi bersih.

### 9.7 `goals`

Digunakan untuk progress tujuan finansial.

### 9.8 `investments`

Digunakan untuk ringkasan aset investasi jika ditampilkan. Pada MVP, investasi tidak wajib memengaruhi financial health score.

---

## 10. Konsep UI

UI mengacu pada template referensi dashboard analisis keuangan modern seperti Budggt.

Karakter visual:

1. Background terang.
2. Card besar dengan rounded corner.
3. Shadow halus.
4. Aksen hijau khas Ngaturin.
5. Angka utama besar dan tebal.
6. Layout bertingkat dari ringkasan ke detail.
7. Chart minimalis.
8. Section AI insight berada setelah laporan utama.
9. Export laporan tetap tersedia.

---

## 11. Struktur Halaman

Urutan section halaman Laporan:

1. Header + filter periode.
2. Skor kesehatan finansial.
3. Kartu ringkasan utama.
4. Tren pemasukan vs pengeluaran.
5. Rincian pengeluaran + kategori teratas.
6. Pengeluaran harian + ringkasan cepat.
7. Performa anggaran.
8. Progress goals.
9. Ringkasan utang/piutang.
10. Insight AI.
11. Export laporan.

---

## 12. Detail Fitur Produk

### 12.1 Header dan Filter Periode

#### Deskripsi

Bagian atas halaman yang menampilkan judul fitur dan filter laporan.

#### Elemen UI

1. Judul: `Laporan`.
2. Subtitle: `Analisis kebiasaan keuanganmu.`
3. Dropdown bulan dan tahun.
4. Filter kategori.
5. Filter wallet.
6. Filter tipe transaksi.
7. Tombol export.

#### Behavior

1. Default periode adalah bulan berjalan.
2. Semua section mengikuti periode aktif.
3. Jika filter berubah, insight AI lama harus direset atau diberi status tidak sinkron.

#### Acceptance Criteria

1. User dapat memilih bulan laporan.
2. Semua angka berubah sesuai filter aktif.
3. Tidak muncul nilai `NaN`, `undefined`, atau angka kosong.

---

### 12.2 Skor Kesehatan Finansial

#### Deskripsi

Kartu ringkasan utama yang menunjukkan skor kesehatan keuangan pengguna.

#### Elemen UI

1. Circular score.
2. Nilai skor, contoh `78/100`.
3. Status skor:
   - Sangat Sehat.
   - Sehat.
   - Waspada.
   - Kritis.
4. Breakdown dimensi:
   - Rasio Tabungan.
   - Disiplin Anggaran.
   - Cashflow.
   - Kesehatan Utang.
   - Konsistensi Pengeluaran.

#### Formula Awal

Total skor maksimal: 100 poin.

| Dimensi | Maksimum Poin |
|---|---:|
| Rasio Tabungan | 25 |
| Disiplin Anggaran | 25 |
| Cashflow | 20 |
| Kesehatan Utang | 15 |
| Konsistensi Pengeluaran | 15 |

#### Status Skor

| Skor | Status |
|---:|---|
| 85–100 | Sangat Sehat |
| 70–84 | Sehat |
| 50–69 | Waspada |
| 0–49 | Kritis |

#### Catatan

Jika data belum cukup, skor diberi label `Estimasi`.

#### Acceptance Criteria

1. Skor selalu berada pada rentang 0–100.
2. Breakdown dimensi ditampilkan.
3. Formula dapat dijelaskan melalui tooltip atau info text.
4. Jika tidak ada data budget, dimensi anggaran diberi keterangan.

---

### 12.3 Kartu Ringkasan Utama

#### Deskripsi

Empat kartu metrik utama untuk memberikan snapshot kondisi keuangan.

#### Metrik

1. Yang Ditabung.
2. Rasio Menabung.
3. Pemasukan.
4. Pengeluaran.

#### Formula

```txt
pemasukan = sum(transactions.amount where type = income)
pengeluaran = sum(transactions.amount where type = expense)
yang_ditabung = pemasukan - pengeluaran
rasio_menabung = pemasukan > 0 ? yang_ditabung / pemasukan * 100 : 0
```

#### Acceptance Criteria

1. Pemasukan hanya menghitung `income`.
2. Pengeluaran hanya menghitung `expense`.
3. Transfer tidak memengaruhi cashflow utama.
4. Nilai diformat dalam Rupiah.

---

### 12.4 Tren Pemasukan vs Pengeluaran

#### Deskripsi

Grafik untuk membandingkan pemasukan, pengeluaran, dan net cashflow dalam periode aktif.

#### Tipe Chart

1. Grouped bar chart.
2. Alternatif: composed chart.

#### Data

Untuk periode bulanan:

1. X-axis: tanggal atau minggu.
2. Series:
   - Pemasukan.
   - Pengeluaran.
   - Net cashflow.

#### Acceptance Criteria

1. Chart memiliki legenda jelas.
2. Tooltip menampilkan tanggal, pemasukan, pengeluaran, dan net.
3. Data kosong menampilkan empty state.
4. Transfer tidak dihitung.

---

### 12.5 Rincian Pengeluaran

#### Deskripsi

Donut chart yang menunjukkan distribusi pengeluaran berdasarkan kategori.

#### Data

Hanya transaksi `type = expense`.

#### Elemen UI

1. Donut chart.
2. Label kategori.
3. Persentase kategori.
4. Tooltip nominal Rupiah.

#### Formula

```txt
kategori_expense = sum(expense.amount group by category)
persentase = kategori_expense / total_expense * 100
```

#### Acceptance Criteria

1. Income tidak masuk chart.
2. Transfer tidak masuk chart.
3. Kategori diurutkan dari nominal terbesar.

---

### 12.6 Kategori Teratas

#### Deskripsi

Daftar kategori pengeluaran terbesar dalam periode aktif.

#### Elemen UI

1. Nama kategori.
2. Icon kategori jika tersedia.
3. Nominal.
4. Persentase dari total pengeluaran.
5. Status tren:
   - Naik.
   - Turun.
   - Stabil.
   - Belum ada pembanding.

#### Acceptance Criteria

1. Maksimal lima kategori ditampilkan.
2. Jika tidak ada periode sebelumnya, jangan tampilkan klaim tren palsu.
3. Jika kategori tidak punya icon, gunakan fallback icon.

---

### 12.7 Pengeluaran Harian

#### Deskripsi

Grafik batang pengeluaran per tanggal.

#### Data

Transaksi `type = expense`.

#### Elemen UI

1. Bar chart tanggal 1 sampai akhir bulan.
2. Garis rata-rata pengeluaran harian.
3. Highlight hari terboros.

#### Formula

```txt
daily_expense = sum(expense.amount group by date)
average_daily_expense = total_expense / jumlah_hari_relevan
```

Jika bulan aktif adalah bulan berjalan, `jumlah_hari_relevan` adalah hari berjalan sampai hari ini.  
Jika bulan lampau, `jumlah_hari_relevan` adalah jumlah hari dalam bulan tersebut.

#### Acceptance Criteria

1. Tanggal tanpa transaksi tetap tampil dengan nilai 0.
2. Tooltip menampilkan tanggal dan nominal.
3. Rata-rata tidak boleh memakai pembagi statis 30.

---

### 12.8 Ringkasan Cepat

#### Deskripsi

Card ringkasan perilaku transaksi harian.

#### Metrik

1. Rata-rata pengeluaran per hari.
2. Hari terboros.
3. Total transaksi bulan ini.
4. Hari tanpa pengeluaran.

#### Acceptance Criteria

1. Hari terboros menampilkan tanggal dan nominal.
2. Total transaksi mengikuti filter periode.
3. Hari tanpa pengeluaran dihitung dari semua tanggal dalam periode relevan.

---

### 12.9 Performa Anggaran

#### Deskripsi

Tabel evaluasi budget per kategori.

#### Data Source

1. `budgets`.
2. `transactions`.

#### Kolom

| Kolom | Deskripsi |
|---|---|
| Kategori | Nama kategori |
| Alokasi | Nilai budget |
| Realisasi | Total expense kategori |
| Progress | Progress bar |
| % Terpakai | Realisasi / alokasi |
| Status | Aman/Waspada/Hampir Habis/Over-budget |

#### Status

| Persentase | Status |
|---:|---|
| 0–60% | Aman |
| 61–85% | Waspada |
| 86–100% | Hampir Habis |
| >100% | Over-budget |

#### Logic Risiko Waktu

```txt
expected_usage = hari_berjalan / total_hari_bulan * 100
jika actual_usage > expected_usage + 25%
maka status tambahan = lebih cepat dari rencana
```

#### Acceptance Criteria

1. Budget tanpa transaksi tetap muncul.
2. Budget amount 0 tidak menyebabkan error.
3. Kategori over-budget diberi highlight.
4. Status memperhitungkan persentase pemakaian dan konteks waktu.

---

### 12.10 Progress Goals

#### Deskripsi

Section yang menampilkan progress tujuan finansial.

#### Data Source

`goals`.

#### Elemen UI

1. Nama goal.
2. Current amount.
3. Target amount.
4. Persentase progress.
5. Progress bar.
6. Deadline.
7. Status completed.

#### Sorting

Urutan goals:

1. Belum selesai.
2. Deadline terdekat.
3. Progress terbesar.

#### Acceptance Criteria

1. Jika tidak ada goals, tampilkan empty state.
2. Goal completed diberi badge.
3. Persentase progress maksimal ditampilkan 100% secara visual walaupun current amount melebihi target.

---

### 12.11 Ringkasan Utang dan Piutang

#### Deskripsi

Card ringkasan posisi kewajiban pengguna.

#### Data Source

`debts`.

#### Metrik

1. Total utang aktif.
2. Total piutang aktif.
3. Posisi bersih.
4. Jumlah utang/piutang overdue.
5. Utang terdekat jatuh tempo.

#### Formula

```txt
sisa_utang = max(amount - paid_amount, 0)
total_utang_aktif = sum(sisa_utang where type = hutang and is_settled = false)
total_piutang_aktif = sum(sisa_piutang where type = piutang and is_settled = false)
posisi_bersih = total_piutang_aktif - total_utang_aktif
```

#### Acceptance Criteria

1. Debt settled tidak dihitung.
2. Paid amount harus diperhitungkan.
3. Utang overdue diberi warning.

---

### 12.12 Insight AI

#### Deskripsi

Insight otomatis yang menyusun narasi berdasarkan hasil kalkulasi sistem.

#### Prinsip

AI tidak boleh menjadi sumber angka utama. Semua angka harus berasal dari rule-based calculation layer. AI hanya bertugas menarasikan, memprioritaskan, dan menyusun rekomendasi.

#### Struktur Insight

1. Ringkasan.
2. Perbandingan vs periode sebelumnya.
3. Kategori teratas dan tren.
4. Anomali.
5. Prediksi.
6. Saran.

#### Acceptance Criteria

1. AI tidak boleh mengarang angka.
2. Jika data pembanding tidak tersedia, tampilkan pesan data belum cukup.
3. Jika AI gagal, data laporan utama tetap tampil.
4. Insight lama direset saat filter berubah.

---

### 12.13 Export Laporan

#### Format

1. PDF.
2. Excel.
3. CSV.

#### Isi PDF

1. Header laporan.
2. Periode.
3. Skor kesehatan finansial.
4. Ringkasan utama.
5. Kategori teratas.
6. Performa budget.
7. Progress goals.
8. Ringkasan utang/piutang.
9. Insight AI jika tersedia.
10. Tabel transaksi ringkas.

#### Isi Excel

Sheet:

1. Ringkasan.
2. Transaksi.
3. Budget Performance.
4. Goals.
5. Debts.
6. Categories.

#### Isi CSV

CSV hanya berisi transaksi berdasarkan filter aktif.

#### Nama File

```txt
laporan-ngaturin-YYYY-MM.pdf
laporan-ngaturin-YYYY-MM.xlsx
laporan-ngaturin-YYYY-MM.csv
```

#### Acceptance Criteria

1. Export mengikuti filter periode aktif.
2. File tidak kosong jika ada data.
3. Jika data kosong, tombol export disabled atau menampilkan warning.

---

## 13. State Management Produk

### 13.1 Keputusan

Gunakan Zustand untuk UI state dan filter state.

### 13.2 State yang Disimpan di Zustand

1. `selectedMonth`.
2. `selectedCategory`.
3. `selectedWallet`.
4. `selectedType`.
5. `trendInterval`.
6. `viewMode`.
7. `isInsightExpanded`.
8. `generatedInsight`.
9. `lastGeneratedInsightAt`.

### 13.3 State yang Tidak Disimpan di Zustand

1. Seluruh data transaksi mentah.
2. Seluruh data budget mentah.
3. Seluruh data goals mentah.
4. Seluruh data debts mentah.
5. Seluruh data finansial sensitif yang tidak perlu global.

### 13.4 Prinsip

Supabase tetap menjadi source of truth. Zustand hanya mengelola state UI.

---

## 14. Architecture Recommendation Produk

### 14.1 Struktur Direktori yang Direkomendasikan

```txt
app/dashboard/reports/page.tsx
app/dashboard/reports/reports-client-view.tsx

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

hooks/use-financial-report.ts
stores/use-report-store.ts
lib/reports/calculations.ts
lib/reports/formatters.ts
lib/reports/report-export.ts
```

### 14.2 Prinsip Arsitektur

1. Data diambil dari Supabase.
2. Filter dan state UI dikelola Zustand.
3. Kalkulasi dilakukan oleh pure functions.
4. UI component hanya menerima props hasil kalkulasi.
5. AI insight menggunakan hasil kalkulasi, bukan data mentah secara bebas.

---

## 15. UX State

### 15.1 Empty State

#### Tidak ada transaksi

```txt
Belum ada transaksi untuk periode ini. Tambahkan transaksi agar laporan bisa dibuat.
```

CTA: `Tambah Transaksi`.

#### Tidak ada budget

```txt
Belum ada budget untuk periode ini.
```

CTA: `Buat Budget`.

#### Tidak ada goals

```txt
Belum ada tujuan finansial.
```

CTA: `Buat Goals`.

#### Tidak ada utang

```txt
Tidak ada utang aktif — kondisi kewajiban aman.
```

### 15.2 Error State

#### Gagal memuat data

```txt
Terdapat masalah saat memuat laporan. Coba muat ulang halaman.
```

#### Gagal membuat AI Insight

```txt
Insight AI belum bisa dibuat saat ini. Data laporan tetap tersedia.
```

#### Gagal export

```txt
Export gagal. Periksa data laporan dan coba lagi.
```

---

## 16. Validasi dan Edge Cases Produk

Fitur harus aman terhadap kondisi berikut:

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

---

## 17. Risiko Produk

### 17.1 Kategori Tidak Konsisten

Saat ini kategori masih disimpan sebagai text. Ini dapat membuat grouping tidak akurat.

Mitigasi:

1. Normalisasi string kategori.
2. Gunakan fallback grouping.
3. Rencanakan migrasi `category_id` di fase berikutnya.

### 17.2 Skor Finansial Dipersepsikan Tidak Transparan

Mitigasi:

1. Tampilkan breakdown skor.
2. Tambahkan tooltip formula.
3. Beri label estimasi jika data belum lengkap.

### 17.3 AI Mengarang Insight

Mitigasi:

1. AI hanya menerima calculated metrics.
2. Angka tidak boleh dibuat model.
3. Jika data tidak ada, insight harus menyatakan data belum cukup.

### 17.4 Halaman Terlalu Panjang

Mitigasi:

1. Gunakan visual hierarchy yang kuat.
2. Kelompokkan section secara logis.
3. Mobile memakai card stack.

### 17.5 Data Kosong saat Testing

Mitigasi:

1. Siapkan seed/demo data.
2. Pastikan empty state informatif.

---

## 18. Roadmap Implementasi Produk

### Phase 1 — Core Facelift

Deliverables:

1. Route `/dashboard/reports`.
2. Rename sidebar menu menjadi Laporan.
3. Header dan filter.
4. Zustand report store.
5. Calculation layer awal.
6. Skor kesehatan finansial.
7. Summary cards.
8. Tren pemasukan vs pengeluaran.
9. Rincian pengeluaran.
10. Kategori teratas.
11. Pengeluaran harian.
12. Ringkasan cepat.

### Phase 2 — Extended Report

Deliverables:

1. Performa anggaran.
2. Progress goals.
3. Ringkasan utang/piutang.
4. Ringkasan tagihan rutin jika dibutuhkan.
5. Empty state detail.

### Phase 3 — AI Insight dan Export

Deliverables:

1. Rule-based anomaly detection.
2. Projection engine.
3. AI insight generator.
4. Export PDF baru.
5. Export Excel multi-sheet.
6. Export CSV transaksi.

### Phase 4 — Data Quality Improvement

Deliverables:

1. Tambah `category_id` pada transaksi.
2. Tambah `category_id` pada budget.
3. Tambah `category_id` pada recurring bills.
4. Tambah saldo wallet jika ingin menghitung runway.
5. Tambah goal contribution history.
6. Rapikan foreign key duplikat.

---

## 19. Success Metrics

Metrik keberhasilan:

1. Pengguna dapat memahami kondisi keuangan dalam 10 detik pertama.
2. Pengguna dapat melihat kategori pengeluaran terbesar tanpa membuka transaksi.
3. Pengguna dapat mengetahui budget berisiko sebelum over-budget.
4. Pengguna dapat mengekspor laporan sesuai periode.
5. Insight AI menghasilkan rekomendasi spesifik, bukan narasi umum.
6. Tidak ada angka utama yang menghasilkan NaN atau tidak konsisten.
7. Halaman tetap responsif pada desktop dan mobile.
8. Pengguna dapat menemukan menu Laporan dengan jelas dari sidebar.

---

## 20. Acceptance Criteria Global

Fitur dianggap memenuhi requirement produk jika:

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

## 21. Prioritas Produk

### P0 — Wajib untuk MVP

1. Route `/dashboard/reports`.
2. Sidebar Laporan.
3. Filter periode.
4. Zustand store.
5. Calculation summary.
6. Skor kesehatan finansial.
7. Summary cards.
8. Income vs expense trend.
9. Expense breakdown.
10. Top categories.
11. Daily expense.
12. Quick summary.
13. Budget performance.
14. Goals progress.
15. Debt summary.
16. Empty states.

### P1 — Sangat Disarankan

1. Anomaly detection.
2. Projection.
3. Rule-based recommendations.
4. Export CSV.
5. Export Excel.
6. Export PDF.
7. Unit tests calculation.

### P2 — Setelah MVP Stabil

1. AI insight.
2. Investment summary.
3. Recurring bills summary.
4. Advanced trend comparison.
5. Category migration.

Catatan kritis: AI sebaiknya tidak masuk P0 karena kualitas AI bergantung pada calculation layer yang benar.

---

## 22. Definition of Product Done

Fitur Laporan dianggap selesai secara produk jika:

1. User dapat membuka halaman Laporan dari sidebar.
2. User dapat memilih periode laporan.
3. User dapat memahami kondisi keuangan dari skor dan summary cards.
4. User dapat melihat kategori pengeluaran terbesar.
5. User dapat melihat pola pengeluaran harian.
6. User dapat melihat budget yang aman, waspada, hampir habis, atau over-budget.
7. User dapat melihat progress goals.
8. User dapat melihat posisi utang/piutang.
9. User mendapatkan rekomendasi berbasis data.
10. User dapat mengekspor laporan.
11. User tidak melihat angka NaN, undefined, atau data palsu.
12. User mendapat empty state yang jelas jika data belum tersedia.
13. Fitur lama Smart Analytics tidak lagi menjadi pengalaman utama.

---

## 23. Open Questions

1. Apakah `/dashboard/insights` langsung redirect ke `/dashboard/reports`, atau dipertahankan sementara sebagai alias?
2. Apakah AI insight akan memakai API route internal atau service existing?
3. Apakah export PDF perlu menyertakan visual chart atau cukup ringkasan dan tabel?
4. Apakah budget `month` sudah selalu konsisten `YYYY-MM` di seluruh data existing?
5. Apakah laporan perlu mendukung mode `Semua Waktu`, atau hanya laporan bulanan?
6. Apakah recurring bills perlu menjadi section utama atau cukup masuk Insight AI?
7. Apakah investment summary perlu ditampilkan di MVP atau fase lanjutan?

Keputusan awal yang direkomendasikan:

1. Redirect `/dashboard/insights` ke `/dashboard/reports`.
2. Gunakan laporan bulanan sebagai default dan fokus utama.
3. Export PDF fase awal cukup ringkasan dan tabel, chart visual optional.
4. AI insight gunakan calculated metrics saja.
5. Investment dan recurring bills dapat ditunda setelah MVP laporan stabil.
