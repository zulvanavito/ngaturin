# REPORTS_DATA_MAPPING — Fitur Laporan Ngaturin

## 1. Informasi Dokumen

**Nama Sistem:** Ngaturin  
**Nama Modul:** Laporan  
**Tipe Dokumen:** Reports Data Mapping Document  
**Versi:** 1.0 Final Draft  
**Status:** Acuan implementasi calculation engine dan data fetching  
**Dokumen Terkait:**

- `docs/SRS_LAPORAN.md`
- `docs/TDD_LAPORAN.md`

Dokumen ini memetakan struktur data Supabase Ngaturin ke seluruh section fitur Laporan. Fokus dokumen ini adalah sumber data, kolom yang digunakan, formula, strategi join, strategi agregasi, normalisasi kategori, dan mapping data ke UI, AI insight, serta export.

---

## 2. Tujuan Dokumen

Dokumen ini bertujuan memastikan implementasi fitur Laporan tidak ambigu saat membaca data dari Supabase dan menghitung metrik finansial.

Tujuan spesifik:

1. Menentukan tabel Supabase yang digunakan oleh setiap section Laporan.
2. Menentukan kolom yang digunakan, diabaikan, dan perlu diwaspadai.
3. Menentukan formula per metrik.
4. Menentukan strategi join dan relasi antar tabel.
5. Menentukan strategi agregasi transaksi, budget, goals, debts, bills, dan investments.
6. Menentukan strategi normalisasi kategori karena schema saat ini masih berbasis text.
7. Menentukan input data untuk financial health score.
8. Menentukan input data untuk AI insight.
9. Menentukan sumber data untuk export PDF, Excel, dan CSV.

---

## 3. Ringkasan Schema Supabase yang Digunakan

Project Supabase Ngaturin memiliki tabel utama yang relevan untuk Laporan:

| Tabel | Fungsi Utama di Laporan |
|---|---|
| `transactions` | Sumber utama pemasukan, pengeluaran, cashflow, tren, kategori, harian, dan proyeksi |
| `budgets` | Sumber alokasi budget bulanan dan performa anggaran |
| `categories` | Metadata kategori, icon, tipe, dan budget group |
| `wallets` | Filter dompet dan metadata wallet |
| `recurring_bills` | Tagihan rutin dan komitmen bulanan |
| `debts` | Utang, piutang, overdue, dan posisi bersih |
| `goals` | Progress tujuan finansial |
| `investments` | Ringkasan aset investasi |
| `investment_transactions` | Aktivitas beli, jual, update, dividen investasi |
| `investment_history` | Snapshot historis performa investasi |

Tabel lain seperti `subscriptions`, `blog_posts`, `admin_audit_logs`, `newsletter_subscribers`, dan gamification tidak masuk calculation utama fitur Laporan MVP.

---

## 4. Prinsip Umum Mapping Data

### 4.1 Supabase sebagai Source of Truth

Semua data finansial berasal dari Supabase. Zustand tidak menjadi source of truth untuk data finansial.

### 4.2 Calculation Layer sebagai Sumber Angka UI

Semua angka yang tampil di UI harus berasal dari calculation layer, bukan dihitung langsung secara tersebar di komponen.

### 4.3 AI Tidak Menghasilkan Angka Baru

AI hanya menerima calculated metrics. AI tidak boleh membuat angka yang tidak tersedia di input.

### 4.4 Transfer Tidak Masuk Cashflow Utama

Transaksi `type = transfer` tidak dihitung sebagai income atau expense utama.

### 4.5 Kategori Text Harus Dinormalisasi Ringan

Karena `transactions.category`, `budgets.category`, dan `recurring_bills.category` masih text, grouping harus menggunakan normalisasi ringan.

### 4.6 Data Kosong Harus Aman

Semua formula harus aman terhadap:

1. Array kosong.
2. Nilai null.
3. Amount 0.
4. Invalid date.
5. Division by zero.
6. Data periode sebelumnya kosong.

---

## 5. Global Filter Mapping

### 5.1 Filter State

Filter laporan berasal dari Zustand:

```ts
interface ReportFilters {
  selectedMonth: string; // YYYY-MM
  selectedCategory: string; // category name or "all"
  selectedWallet: string; // wallet id or "all"
  selectedType: "all" | "income" | "expense" | "transfer";
}
```

### 5.2 Filter ke Tabel

| Filter | Tabel Terdampak | Kolom | Catatan |
|---|---|---|---|
| `selectedMonth` | `transactions` | `date` | Filter transaksi berdasarkan bulan |
| `selectedMonth` | `budgets` | `month` | Match string `YYYY-MM` |
| `selectedCategory` | `transactions` | `category` | Match normalized category |
| `selectedCategory` | `budgets` | `category` | Match normalized category |
| `selectedWallet` | `transactions` | `wallet_id` | Match UUID wallet |
| `selectedType` | `transactions` | `type` | Untuk daftar transaksi/export; metrik utama tetap punya rule sendiri |

### 5.3 Filter Periode

Input:

```txt
selectedMonth = YYYY-MM
```

Range:

```txt
startDate = YYYY-MM-01
endDate = first day of next month, exclusive
```

Rule:

```txt
transaction.date >= startDate AND transaction.date < endDate
```

### 5.4 Periode Pembanding

Periode pembanding untuk tren kategori:

```txt
previousMonth = selectedMonth - 1 month
```

Jika tidak ada data periode sebelumnya, trend bernilai `no_comparison`.

---

## 6. Category Normalization Strategy

### 6.1 Masalah

Saat ini kategori pada transaksi dan budget masih berbasis text, bukan `category_id`. Ini menyebabkan risiko kategori yang sama terbaca berbeda.

Contoh:

```txt
Makan
makan
Makanan
Food
```

### 6.2 Normalisasi MVP

Gunakan fungsi:

```ts
export function normalizeCategoryKey(category?: string | null): string {
  return (category || "Tanpa Kategori").trim().toLowerCase();
}

export function getCategoryDisplayName(category?: string | null): string {
  return (category || "Tanpa Kategori").trim() || "Tanpa Kategori";
}
```

### 6.3 Rule Display Name

Untuk grouping, gunakan normalized key. Untuk tampilan, gunakan display name dari data pertama yang ditemukan atau metadata dari `categories.name` jika tersedia.

### 6.4 Fallback

Jika category kosong/null:

```txt
Tanpa Kategori
```

### 6.5 Future Improvement

Fase lanjutan disarankan menambahkan `category_id` pada:

1. `transactions`.
2. `budgets`.
3. `recurring_bills`.

---

## 7. Table Mapping — `transactions`

### 7.1 Fungsi di Laporan

`transactions` adalah tabel paling penting untuk Laporan.

Digunakan untuk:

1. Total pemasukan.
2. Total pengeluaran.
3. Net cashflow.
4. Rasio menabung.
5. Tren pemasukan vs pengeluaran.
6. Rincian pengeluaran.
7. Kategori teratas.
8. Pengeluaran harian.
9. Ringkasan cepat.
10. Proyeksi akhir bulan.
11. Export transaksi.
12. Relasi tagihan dan utang jika `bill_id` atau `debt_id` tersedia.

### 7.2 Kolom Digunakan

| Kolom | Tipe | Digunakan Untuk |
|---|---|---|
| `id` | bigint | Identitas transaksi, export, relation reference |
| `user_id` | uuid | Security/user ownership |
| `description` | text | Export dan detail transaksi |
| `amount` | numeric | Semua perhitungan nominal |
| `category` | text | Grouping kategori |
| `type` | text | Income/expense/transfer classification |
| `date` | date | Filter periode, trend, daily expense |
| `wallet_id` | uuid nullable | Filter wallet, join wallet |
| `bill_id` | uuid nullable | Relasi ke recurring bills |
| `debt_id` | uuid nullable | Relasi ke debts |
| `created_at` | timestamptz | Optional sorting/debug |
| `updated_at` | timestamptz | Optional audit/debug |

### 7.3 Kolom Diabaikan untuk MVP

Tidak ada kolom yang sepenuhnya diabaikan, tetapi `created_at` dan `updated_at` tidak digunakan untuk calculation utama.

### 7.4 Business Rules

| Type | Treatment |
|---|---|
| `income` | Masuk total pemasukan |
| `expense` | Masuk total pengeluaran |
| `transfer` | Tidak masuk income/expense utama |

### 7.5 Formula dari Transactions

```txt
totalIncome = sum(amount where type = income)
totalExpense = sum(amount where type = expense)
netCashflow = totalIncome - totalExpense
savingsRate = totalIncome > 0 ? netCashflow / totalIncome * 100 : 0
```

### 7.6 Section yang Menggunakan Transactions

| Section UI | Mapping |
|---|---|
| Summary Cards | income, expense, netCashflow, savingsRate |
| Financial Health Score | savings ratio, cashflow, consistency |
| Income Expense Trend | group by date/week/month/year |
| Expense Breakdown | expense group by category |
| Top Categories | expense group by category + previous period comparison |
| Daily Expense | expense group by date |
| Quick Summary | total transactions, highest day, no-spend days |
| Projection | average daily expense |
| AI Insight | calculated metrics derived from transactions |
| Export | transaction detail table |

---

## 8. Table Mapping — `budgets`

### 8.1 Fungsi di Laporan

`budgets` digunakan untuk Performa Anggaran dan dimensi Disiplin Anggaran pada financial health score.

### 8.2 Kolom Digunakan

| Kolom | Tipe | Digunakan Untuk |
|---|---|---|
| `id` | uuid | Identitas budget |
| `user_id` | uuid | User ownership |
| `category` | text | Match dengan transaksi expense |
| `amount` | numeric | Alokasi budget |
| `month` | text | Filter periode budget |
| `created_at` | timestamptz | Optional |
| `updated_at` | timestamptz | Optional |

### 8.3 Formula Budget Performance

```txt
realized = sum(expense.amount where normalize(expense.category) = normalize(budget.category))
allocated = budget.amount
remaining = allocated - realized
usedPercentage = allocated > 0 ? realized / allocated * 100 : 0
```

### 8.4 Budget Status

| usedPercentage | Status |
|---:|---|
| 0–60 | Aman |
| 61–85 | Waspada |
| 86–100 | Hampir Habis |
| >100 | Over-budget |

### 8.5 Time Risk Formula

```txt
expectedUsage = elapsedDaysInMonth / totalDaysInMonth * 100
if usedPercentage > expectedUsage + 25 then timeRisk = faster_than_expected
else timeRisk = normal
```

### 8.6 Section yang Menggunakan Budgets

| Section UI | Mapping |
|---|---|
| Budget Performance | alokasi, realisasi, progress, status |
| Financial Health Score | budget discipline dimension |
| Anomaly Detection | over-budget, faster-than-expected |
| AI Insight | budget warnings and recommendations |
| Excel Export | Budget Performance sheet |
| PDF Export | Budget summary table |

---

## 9. Table Mapping — `categories`

### 9.1 Fungsi di Laporan

`categories` digunakan untuk metadata kategori dan memperkaya tampilan laporan.

### 9.2 Kolom Digunakan

| Kolom | Tipe | Digunakan Untuk |
|---|---|---|
| `id` | uuid | Identitas kategori |
| `user_id` | uuid | User ownership |
| `name` | text | Display name dan mapping |
| `icon` | text | Icon kategori |
| `type` | text | Filter income/expense/all |
| `budget_group` | text | Needs/wants/savings analysis optional |
| `created_at` | timestamptz | Optional |

### 9.3 Mapping ke Transaksi

Karena tidak ada `category_id`, mapping dilakukan menggunakan normalized name:

```txt
normalizeCategoryKey(categories.name) === normalizeCategoryKey(transactions.category)
```

### 9.4 Fallback

Jika kategori transaksi tidak ditemukan di `categories`:

1. Display name = `transactions.category`.
2. Icon = fallback icon.
3. Type = inferred dari transaksi.
4. Budget group = unknown atau fallback `wants` jika perlu.

### 9.5 Section yang Menggunakan Categories

| Section UI | Mapping |
|---|---|
| Expense Breakdown | icon, display name |
| Top Categories | icon, display name |
| Report Filters | daftar kategori |
| Budget Performance | display category metadata |
| Export Excel | Categories sheet |

---

## 10. Table Mapping — `wallets`

### 10.1 Fungsi di Laporan

`wallets` digunakan untuk filter dompet dan metadata transaksi.

### 10.2 Kolom Digunakan

| Kolom | Tipe | Digunakan Untuk |
|---|---|---|
| `id` | uuid | Match `transactions.wallet_id` |
| `user_id` | uuid | User ownership |
| `name` | text | Display name filter/export |
| `icon` | text | UI filter |
| `type` | text | Optional wallet grouping |
| `color` | text | UI color optional |
| `is_default` | boolean | Optional sorting/filter default |
| `created_at` | timestamptz | Optional |

### 10.3 Mapping ke Transactions

```txt
transactions.wallet_id = wallets.id
```

### 10.4 Section yang Menggunakan Wallets

| Section UI | Mapping |
|---|---|
| Report Filters | wallet dropdown |
| Export CSV/Excel | wallet name |
| Optional wallet summary | expense/income per wallet |

### 10.5 Limitation

Schema wallets belum terlihat memiliki `balance`. Karena itu, Laporan MVP tidak boleh mengklaim saldo liquid atau runway berbasis wallet balance.

---

## 11. Table Mapping — `recurring_bills`

### 11.1 Fungsi di Laporan

`recurring_bills` digunakan untuk tagihan rutin dan komitmen bulanan. Pada MVP, section khusus tagihan rutin bersifat optional, tetapi data ini dapat masuk AI insight dan projection enhancement.

### 11.2 Kolom Digunakan

| Kolom | Tipe | Digunakan Untuk |
|---|---|---|
| `id` | uuid | Match `transactions.bill_id` |
| `user_id` | uuid | User ownership |
| `name` | text | Display bill |
| `amount` | numeric | Nominal tagihan |
| `category` | text nullable | Mapping kategori |
| `due_day` | integer | Jatuh tempo bulanan |
| `is_active` | boolean | Filter tagihan aktif |
| `billing_cycle` | text | Siklus tagihan |
| `plan_name` | text nullable | Detail paket |
| `is_autopay` | boolean | Optional insight |
| `created_at` | timestamptz | Optional |

### 11.3 Mapping ke Transactions

```txt
transactions.bill_id = recurring_bills.id
```

### 11.4 Formula Tagihan Rutin

```txt
activeMonthlyBills = bills where is_active = true and billing_cycle = monthly or null/default monthly
monthlyBillCommitment = sum(activeMonthlyBills.amount)
upcomingBills = bills where is_active = true and due_day >= currentDay
```

### 11.5 Section yang Menggunakan Recurring Bills

| Section UI | Mapping |
|---|---|
| Optional Bills Summary | total active bills, nearest due bills |
| Projection Enhancement | upcoming unpaid commitments |
| AI Insight | warning tagihan mendekati jatuh tempo |
| Export PDF/Excel | optional bills table |

### 11.6 Limitation

Belum ada status paid/unpaid langsung pada recurring bills. Pembayaran dapat diindikasikan dari transaksi dengan `bill_id`, tetapi tidak selalu lengkap.

---

## 12. Table Mapping — `debts`

### 12.1 Fungsi di Laporan

`debts` digunakan untuk ringkasan utang, piutang, posisi bersih, overdue, dan dimensi kesehatan utang pada financial health score.

### 12.2 Kolom Digunakan

| Kolom | Tipe | Digunakan Untuk |
|---|---|---|
| `id` | uuid | Identitas debt |
| `user_id` | uuid | User ownership |
| `type` | text | `hutang` atau `piutang` |
| `person_name` | text | Display person |
| `amount` | numeric | Nominal awal |
| `paid_amount` | numeric | Nominal sudah dibayar |
| `description` | text nullable | Detail/export |
| `due_date` | date nullable | Overdue dan nearest due |
| `is_settled` | boolean | Filter aktif/lunas |
| `created_at` | timestamptz | Optional |
| `updated_at` | timestamptz | Optional |

### 12.3 Formula Remaining Amount

```txt
remainingAmount = max(amount - paid_amount, 0)
```

### 12.4 Formula Debt Summary

```txt
activeDebtTotal = sum(remainingAmount where type = hutang and is_settled = false)
activeReceivableTotal = sum(remainingAmount where type = piutang and is_settled = false)
netPosition = activeReceivableTotal - activeDebtTotal
overdueCount = count(active debts/piutang where due_date < today and remainingAmount > 0 and is_settled = false)
```

### 12.5 Section yang Menggunakan Debts

| Section UI | Mapping |
|---|---|
| Debt Summary | active debt, receivable, net position, overdue |
| Financial Health Score | debt health dimension |
| Anomaly Detection | overdue debt, high debt ratio |
| AI Insight | debt warnings |
| Export PDF/Excel | debt table |

### 12.6 Important Rule

Jangan gunakan `amount` penuh untuk utang aktif jika `paid_amount` sudah ada. Selalu gunakan `remainingAmount`.

---

## 13. Table Mapping — `goals`

### 13.1 Fungsi di Laporan

`goals` digunakan untuk progress target finansial.

### 13.2 Kolom Digunakan

| Kolom | Tipe | Digunakan Untuk |
|---|---|---|
| `id` | uuid | Identitas goal |
| `user_id` | uuid | User ownership |
| `title` | text | Nama goal |
| `description` | text nullable | Detail goal |
| `target_amount` | numeric | Target nominal |
| `current_amount` | numeric | Nominal terkumpul |
| `deadline` | date nullable | Deadline dan risk |
| `category` | text nullable | Optional grouping |
| `color` | text nullable | UI |
| `is_completed` | boolean | Status selesai |
| `is_auto_save` | boolean | Optional insight |
| `auto_save_amount` | numeric | Optional projection |
| `created_at` | timestamptz | Optional |
| `updated_at` | timestamptz | Optional |

### 13.3 Formula Goal Progress

```txt
percentage = target_amount > 0 ? current_amount / target_amount * 100 : 0
visualPercentage = min(percentage, 100)
remainingAmount = max(target_amount - current_amount, 0)
```

### 13.4 Goal Risk Formula Optional

Jika deadline tersedia:

```txt
timeElapsedPercentage = elapsedDaysSinceCreated / totalDaysFromCreatedToDeadline * 100
progressGap = timeElapsedPercentage - percentage
if progressGap > 25 then status = behind_schedule
```

Gunakan formula ini hanya jika `created_at` dan `deadline` valid.

### 13.5 Section yang Menggunakan Goals

| Section UI | Mapping |
|---|---|
| Goals Progress | title, progress, target, deadline |
| Financial Health Score | optional savings/goal discipline later |
| Anomaly Detection | goal behind schedule |
| AI Insight | goal recommendations |
| Export PDF/Excel | goals table |

### 13.6 Limitation

Belum ada tabel `goal_transactions`, sehingga sumber perubahan `current_amount` belum dapat diaudit. Jangan klaim progress berasal dari transaksi tertentu kecuali nanti ada relasi eksplisit.

---

## 14. Table Mapping — `investments`

### 14.1 Fungsi di Laporan

`investments` digunakan untuk ringkasan aset investasi. Pada MVP, investasi tidak wajib menjadi bagian utama financial score kecuali dimasukkan sebagai informasi tambahan.

### 14.2 Kolom Digunakan

| Kolom | Tipe | Digunakan Untuk |
|---|---|---|
| `id` | uuid | Identitas investasi |
| `user_id` | uuid | User ownership |
| `name` | text | Nama aset |
| `type` | text | Saham, reksadana, kripto, emas, deposito, lainnya |
| `symbol` | text nullable | Optional display |
| `amount` | numeric | Unit/jumlah optional |
| `total_invested` | numeric | Total modal |
| `current_value` | numeric | Nilai saat ini |
| `created_at` | timestamptz | Optional |
| `updated_at` | timestamptz | Optional |

### 14.3 Formula Investment Summary

```txt
totalInvested = sum(total_invested)
totalCurrentValue = sum(current_value)
totalGainLoss = totalCurrentValue - totalInvested
returnPercentage = totalInvested > 0 ? totalGainLoss / totalInvested * 100 : 0
```

### 14.4 Section yang Menggunakan Investments

| Section UI | Mapping |
|---|---|
| Optional Investment Summary | total value, gain/loss, allocation |
| AI Insight | investment contribution if relevant |
| Export Excel | optional investments sheet |

### 14.5 MVP Decision

Investasi dapat ditampilkan sebagai optional section atau tetap berada di tab/halaman investasi. Untuk Laporan MVP, investment summary tidak harus memengaruhi financial health score.

---

## 15. Table Mapping — `investment_transactions`

### 15.1 Fungsi di Laporan

Digunakan untuk aktivitas investasi jika Laporan ingin membedakan cashflow investasi dari tabungan biasa.

### 15.2 Kolom Digunakan

| Kolom | Tipe | Digunakan Untuk |
|---|---|---|
| `id` | uuid | Identitas transaksi investasi |
| `investment_id` | uuid | Relasi ke investments |
| `user_id` | uuid | User ownership |
| `type` | text | buy, sell, update, dividend |
| `amount` | numeric | Unit/jumlah |
| `price_per_unit` | numeric | Harga per unit |
| `total_value` | numeric | Nilai transaksi |
| `transaction_date` | timestamptz | Filter waktu |
| `notes` | text nullable | Export/detail |
| `created_at` | timestamptz | Optional |

### 15.3 MVP Decision

Tidak wajib masuk perhitungan Laporan MVP. Dapat digunakan di fase lanjutan untuk laporan investasi.

---

## 16. Table Mapping — `investment_history`

### 16.1 Fungsi di Laporan

Digunakan untuk histori performa investasi.

### 16.2 Kolom Digunakan

| Kolom | Tipe | Digunakan Untuk |
|---|---|---|
| `id` | uuid | Identitas history |
| `investment_id` | uuid | Relasi ke investments |
| `user_id` | uuid | User ownership |
| `recorded_at` | timestamptz | Timestamp snapshot |
| `recorded_date` | date | Date snapshot |
| `amount` | numeric | Unit/jumlah |
| `total_invested` | numeric | Modal saat snapshot |
| `current_value` | numeric | Nilai saat snapshot |

### 16.3 MVP Decision

Tidak wajib masuk Laporan MVP kecuali ingin menampilkan tren aset investasi. Untuk MVP, cukup gunakan `investments.current_value` dan `total_invested` jika investment summary ditampilkan.

---

## 17. Section-to-Data Mapping

### 17.1 Header dan Filters

| UI Element | Source | Mapping |
|---|---|---|
| Month filter | `transactions.date`, `budgets.month` | Generate unique months + current month default |
| Category filter | `categories.name`, `transactions.category` | Merge category master dan kategori transaksi |
| Wallet filter | `wallets` | `wallets.id`, `wallets.name` |
| Type filter | static enum | all, income, expense, transfer |

### 17.2 Financial Health Score

| Dimension | Source | Formula/Input |
|---|---|---|
| Rasio Tabungan | `transactions` | `savingsRate` |
| Disiplin Anggaran | `budgets`, `transactions` | budget performance status |
| Cashflow | `transactions` | `netCashflow`, income vs expense |
| Kesehatan Utang | `debts`, `transactions` | activeDebtTotal, debt-to-income ratio |
| Konsistensi Pengeluaran | `transactions` | daily expense variance/spikes |

### 17.3 Summary Cards

| Card | Source | Formula |
|---|---|---|
| Yang Ditabung | `transactions` | `totalIncome - totalExpense` |
| Rasio Menabung | `transactions` | `netCashflow / totalIncome * 100` |
| Pemasukan | `transactions` | sum income |
| Pengeluaran | `transactions` | sum expense |

### 17.4 Income vs Expense Trend

| Field | Source | Mapping |
|---|---|---|
| label | `transactions.date` | date/week/month/year label |
| income | `transactions` | sum income per interval |
| expense | `transactions` | sum expense per interval |
| net | `transactions` | income - expense per interval |

### 17.5 Expense Breakdown

| Field | Source | Mapping |
|---|---|---|
| category | `transactions.category`, `categories.name` | normalized category display |
| amount | `transactions.amount` | sum expense per category |
| percentage | derived | amount / total expense * 100 |
| icon | `categories.icon` | fallback icon if missing |

### 17.6 Top Categories

| Field | Source | Mapping |
|---|---|---|
| category | `transactions.category` | group expense by category |
| amount | `transactions.amount` | sum expense |
| percentage | derived | amount / total expense * 100 |
| trend | current and previous transactions | up/down/stable/no_comparison |
| trendPercentage | derived | delta / previous amount * 100 |

### 17.7 Daily Expense

| Field | Source | Mapping |
|---|---|---|
| date | selected month | all dates in month |
| amount | `transactions.amount` | sum expense per date |
| isHighest | derived | max daily amount |

### 17.8 Quick Summary

| Field | Source | Formula |
|---|---|---|
| averageDailyExpense | daily expenses | totalExpense / relevantDays |
| highestExpenseDay | daily expenses | max amount day |
| totalTransactions | filtered transactions | count |
| noSpendDays | daily expenses | count amount = 0 |

### 17.9 Budget Performance

| Field | Source | Mapping |
|---|---|---|
| category | `budgets.category` | display category |
| allocated | `budgets.amount` | budget amount |
| realized | `transactions` | sum expense by category |
| remaining | derived | allocated - realized |
| usedPercentage | derived | realized / allocated * 100 |
| status | derived | based on percentage |
| timeRisk | derived | based on elapsed days |

### 17.10 Goals Progress

| Field | Source | Mapping |
|---|---|---|
| id | `goals.id` | goal id |
| title | `goals.title` | display |
| currentAmount | `goals.current_amount` | current progress |
| targetAmount | `goals.target_amount` | target |
| percentage | derived | current / target * 100 |
| deadline | `goals.deadline` | optional |
| isCompleted | `goals.is_completed` | status |

### 17.11 Debt Summary

| Field | Source | Formula |
|---|---|---|
| activeDebtTotal | `debts` | sum remaining hutang |
| activeReceivableTotal | `debts` | sum remaining piutang |
| netPosition | derived | receivable - debt |
| overdueCount | `debts.due_date` | count overdue active debt/piutang |
| nearestDueDebt | `debts.due_date` | nearest unpaid due |

### 17.12 AI Insight

| AI Input | Source |
|---|---|
| Summary | calculated summary |
| Financial score | calculated financial health score |
| Top categories | calculated top categories |
| Budget performance | calculated budget performance |
| Goals progress | calculated goals progress |
| Debt summary | calculated debt summary |
| Anomalies | rule-based anomaly detection |
| Projection | calculated projection |
| Recommendations | rule-based recommendations |

### 17.13 Export

| Export | Source |
|---|---|
| PDF | report result + filtered transactions + generated insight |
| Excel Ringkasan | report summary, score, projection |
| Excel Transaksi | filtered transactions + wallet/category display |
| Excel Budget | budget performance |
| Excel Goals | goals progress |
| Excel Debts | debt summary + raw active debts |
| CSV | filtered transactions only |

---

## 18. Financial Health Score Input Mapping

### 18.1 Score Components

| Component | Max Score | Source |
|---|---:|---|
| Rasio Tabungan | 25 | `transactions` summary |
| Disiplin Anggaran | 25 | `budgets` + `transactions` |
| Cashflow | 20 | `transactions` summary |
| Kesehatan Utang | 15 | `debts` + income summary |
| Konsistensi Pengeluaran | 15 | daily expense data |

### 18.2 Rasio Tabungan

```txt
savingsRate = totalIncome > 0 ? netCashflow / totalIncome * 100 : 0
```

Scoring:

| Savings Rate | Score |
|---:|---:|
| >= 20% | 25 |
| 10–19.99% | 18 |
| 5–9.99% | 10 |
| 0–4.99% | 5 |
| < 0% | 0 |

### 18.3 Disiplin Anggaran

Source:

1. `budgetPerformance`.

Scoring MVP:

| Condition | Score |
|---|---:|
| No budget data | 0 and `isEstimated = true` |
| No over-budget and no faster_than_expected | 25 |
| Has warning/hampir habis | 15–20 |
| Has over-budget | 0–14 |

### 18.4 Cashflow

Source:

1. `summary.netCashflow`.
2. `summary.totalIncome`.
3. `summary.totalExpense`.

Scoring:

| Condition | Score |
|---|---:|
| Income > 0 and netCashflow > 0 | 20 |
| Income > 0 and netCashflow = 0 | 10 |
| Income > 0 and netCashflow < 0 | 0–8 |
| Income = 0 | 0 |

### 18.5 Kesehatan Utang

Source:

1. `debtSummary.activeDebtTotal`.
2. `summary.totalIncome`.
3. `debtSummary.overdueCount`.

Formula:

```txt
debtToIncomeRatio = totalIncome > 0 ? activeDebtTotal / totalIncome * 100 : activeDebtTotal > 0 ? 100 : 0
```

Scoring:

| Condition | Score |
|---|---:|
| No active debt | 15 |
| Debt-to-income <= 20% and no overdue | 10–14 |
| Debt-to-income > 20% or overdue exists | 0–9 |

### 18.6 Konsistensi Pengeluaran

Source:

1. `dailyExpenses`.

Simple MVP rule:

```txt
average = averageDailyExpense
spikeDays = count(day.amount > average * 2 and day.amount > 0)
```

Scoring:

| Condition | Score |
|---|---:|
| Data < 7 days | neutral, estimated |
| No spike days | 15 |
| 1–2 spike days | 8–12 |
| >2 spike days | 0–7 |

---

## 19. Anomaly Detection Mapping

### 19.1 Budget Hampir Habis Terlalu Cepat

Source:

1. `budgetPerformance.usedPercentage`.
2. `budgetPerformance.timeRisk`.

Rule:

```txt
if usedPercentage >= 86 and timeRisk = faster_than_expected
severity = high
```

### 19.2 Over-Budget

Source:

1. `budgetPerformance.status`.

Rule:

```txt
if status = Over-budget
severity = high
```

### 19.3 Daily Expense Spike

Source:

1. `dailyExpenses`.
2. `quickSummary.averageDailyExpense`.

Rule:

```txt
if daily.amount > averageDailyExpense * 2 and daily.amount > 0
severity = medium/high depending amount
```

### 19.4 Savings Rate Low

Source:

1. `summary.savingsRate`.

Rule:

```txt
if savingsRate < 5 and totalIncome > 0
severity = medium
```

### 19.5 Debt Overdue

Source:

1. `debtSummary.overdueCount`.

Rule:

```txt
if overdueCount > 0
severity = high
```

### 19.6 Goal Behind Schedule

Source:

1. `goals`.
2. `goalsProgress`.

Rule:

```txt
if deadline exists and progress is much lower than elapsed time
severity = medium
```

---

## 20. Projection Mapping

### 20.1 Source Data

Projection menggunakan:

1. `summary.totalIncome`.
2. `dailyExpenses`.
3. Selected month date context.

### 20.2 Formula

```txt
averageDailyExpense = totalExpense / elapsedDays
projectedExpense = averageDailyExpense * totalDaysInMonth
projectedSavings = totalIncome - projectedExpense
```

### 20.3 Confidence

| Condition | Confidence |
|---|---|
| elapsedDays < 7 | low |
| elapsedDays 7–14 | medium |
| elapsedDays > 14 | high |
| selectedMonth is past month | historical / no projection |
| selectedMonth is future month | low or no projection |

### 20.4 Limitation

Income tidak diproyeksikan secara harian karena pemasukan personal sering tidak linear. Untuk MVP, projected savings menggunakan total income aktual.

---

## 21. AI Insight Input Mapping

### 21.1 Input Object

AI menerima object:

```ts
interface AiReportInput {
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

### 21.2 Data yang Tidak Dikirim ke AI

1. Full raw transactions.
2. Full raw debts dengan person details jika tidak diperlukan.
3. Full raw wallet data.
4. Full raw investment transactions.
5. Data user profile sensitif.

### 21.3 AI Output Sections

| Output | Source Input |
|---|---|
| Ringkasan | summary, score |
| Perbandingan | topCategories trend, previous period derived data |
| Kategori Teratas | topCategories |
| Anomali | anomalies |
| Prediksi | projection |
| Saran | recommendations |

---

## 22. Export Data Mapping

### 22.1 PDF

| Section PDF | Source |
|---|---|
| Header | selectedMonth |
| Skor Kesehatan | financialHealthScore |
| Ringkasan | summary |
| Kategori Teratas | topCategories |
| Budget | budgetPerformance |
| Goals | goalsProgress |
| Utang/Piutang | debtSummary |
| AI Insight | generatedInsight |
| Transaksi | filteredTransactions |

### 22.2 Excel

#### Sheet 1 — Ringkasan

| Field | Source |
|---|---|
| Period | selectedMonth |
| Total Income | summary.totalIncome |
| Total Expense | summary.totalExpense |
| Net Cashflow | summary.netCashflow |
| Savings Rate | summary.savingsRate |
| Financial Score | financialHealthScore.score |
| Projected Expense | projection.projectedExpense |
| Projected Savings | projection.projectedSavings |

#### Sheet 2 — Transaksi

| Column | Source |
|---|---|
| Tanggal | transactions.date |
| Kategori | transactions.category |
| Deskripsi | transactions.description |
| Tipe | transactions.type |
| Jumlah | transactions.amount |
| Wallet | wallets.name via wallet_id |

#### Sheet 3 — Budget Performance

Source: `budgetPerformance`.

Columns:

1. Category.
2. Allocated.
3. Realized.
4. Remaining.
5. Used Percentage.
6. Status.
7. Time Risk.

#### Sheet 4 — Goals

Source: `goalsProgress`.

Columns:

1. Title.
2. Current Amount.
3. Target Amount.
4. Percentage.
5. Deadline.
6. Completed.

#### Sheet 5 — Debts

Source: `debts` + derived remaining amount.

Columns:

1. Type.
2. Person Name.
3. Amount.
4. Paid Amount.
5. Remaining Amount.
6. Due Date.
7. Settled.

#### Sheet 6 — Categories

Source: `expenseBreakdown` or `categories`.

Columns:

1. Category.
2. Amount.
3. Percentage.
4. Icon.

### 22.3 CSV

CSV hanya berisi filtered transactions.

Columns:

1. date.
2. category.
3. description.
4. type.
5. amount.
6. wallet.

---

## 23. Join Strategy

### 23.1 Transactions to Wallets

```txt
transactions.wallet_id = wallets.id
```

Usage:

1. Wallet filter.
2. Export wallet name.
3. Optional wallet summary.

### 23.2 Transactions to Recurring Bills

```txt
transactions.bill_id = recurring_bills.id
```

Usage:

1. Identify bill-related transactions.
2. Optional paid bill estimation.

### 23.3 Transactions to Debts

```txt
transactions.debt_id = debts.id
```

Usage:

1. Identify debt payment transactions.
2. Optional debt activity report.

### 23.4 Transactions/Budgets to Categories

MVP text mapping:

```txt
normalize(transactions.category) = normalize(categories.name)
normalize(budgets.category) = normalize(categories.name)
```

Future mapping:

```txt
transactions.category_id = categories.id
budgets.category_id = categories.id
```

---

## 24. Aggregation Strategy

### 24.1 Amount Handling

Supabase numeric dapat diterima sebagai string atau number tergantung client typing. Calculation layer harus selalu melakukan conversion aman:

```ts
export function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
```

### 24.2 Group by Category

Use normalized category key:

```ts
const key = normalizeCategoryKey(tx.category);
```

### 24.3 Group by Date

Gunakan ISO date string `YYYY-MM-DD`.

### 24.4 Sort Rules

1. Top categories: amount descending.
2. Budget performance: highest risk first, then used percentage descending.
3. Goals: incomplete first, nearest deadline, then highest progress.
4. Debts: overdue first, nearest due date.

---

## 25. Data Quality Risks

### 25.1 Category Text Risk

Risiko terbesar adalah kategori berbasis text. Ini dapat memecah data kategori yang seharusnya sama.

Mitigasi MVP:

1. Trim.
2. Lowercase key.
3. Fallback display name.
4. Encourage category selection via UI.

### 25.2 Budget Month Text Risk

`budgets.month` berupa text. Jika tidak konsisten, budget tidak akan match.

Mitigasi:

1. Validasi format `YYYY-MM`.
2. Abaikan budget dengan month invalid.
3. Tambahkan utility validator.

### 25.3 Wallet Balance Missing

Tanpa wallet balance, runway dan liquid safety tidak dapat dihitung akurat.

Mitigasi:

1. Jangan klaim liquid runway pada MVP.
2. Gunakan cashflow-based health, bukan balance-based health.

### 25.4 Goal History Missing

Tanpa `goal_transactions`, progress goals tidak dapat diaudit.

Mitigasi:

1. Gunakan `current_amount` sebagai source of truth.
2. Jangan mengklaim asal kontribusi goal.

### 25.5 Debt Partial Payment

Jika calculation memakai `amount`, utang akan overstated.

Mitigasi:

1. Selalu gunakan `remainingAmount = max(amount - paid_amount, 0)`.

---

## 26. MVP Data Contract Summary

Calculation engine harus menerima input:

```ts
interface UseFinancialReportInput {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  wallets: Wallet[];
  recurringBills: RecurringBill[];
  debts: Debt[];
  goals: Goal[];
  investments: Investment[];
  filters: ReportFilters;
  trendInterval: TrendInterval;
}
```

Calculation engine harus mengembalikan:

```ts
interface FinancialReportResult {
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

---

## 27. Implementation Priority

Prioritas mapping untuk implementasi:

1. `transactions` → summary, charts, daily, quick summary.
2. `budgets` + `transactions` → budget performance.
3. `debts` → debt summary.
4. `goals` → goals progress.
5. `categories` → icon/display enrichment.
6. `wallets` → filter/export enrichment.
7. `recurring_bills` → optional insight/projection enhancement.
8. `investments` → optional summary.
9. `investment_transactions` dan `investment_history` → fase lanjutan.

---

## 28. Definition of Data Mapping Done

Data mapping dianggap siap jika:

1. Semua section Laporan memiliki sumber data yang jelas.
2. Semua formula utama terdokumentasi.
3. Semua join strategy terdokumentasi.
4. Category normalization strategy terdokumentasi.
5. Debt remaining amount strategy terdokumentasi.
6. Budget performance mapping terdokumentasi.
7. Financial health score input mapping terdokumentasi.
8. AI input mapping terdokumentasi.
9. Export mapping terdokumentasi.
10. Risiko kualitas data terdokumentasi.
