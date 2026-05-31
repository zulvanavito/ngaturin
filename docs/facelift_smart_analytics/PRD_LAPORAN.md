# PRD — Facelift Total Smart Analytics menjadi Fitur Laporan Ngaturin

## Update Ringan — Export Modal dan Paywall

Dokumen ini diperbarui untuk menegaskan bahwa Export bukan sekadar tombol unduh, melainkan **Export Configuration Modal** yang memungkinkan user memilih format, dataset, field, dan melihat status paywall berdasarkan paket **Free, Plus, Pro**.

### Perubahan Produk yang Ditambahkan

1. Fitur Export pada halaman Laporan harus dibuka melalui modal konfigurasi.
2. Modal Export mendukung format `CSV`, `Excel (.xlsx)`, dan `PDF`.
3. CSV difokuskan untuk export transaksi.
4. Excel difokuskan untuk export multi-sheet.
5. PDF difokuskan untuk laporan ringkas.
6. User dapat memilih dataset yang diekspor sesuai format.
7. User dapat memilih field transaksi untuk CSV dan Excel.
8. Dataset atau format premium harus menampilkan locked state sesuai entitlement paket.
9. Paywall mengikuti tiga paket: `Free`, `Plus`, dan `Pro`.

### Struktur Paket Export

| Paket | Export CSV | Export Excel | Export PDF | AI Insight | Investment Snapshot | Advanced Trends |
|---|---|---|---|---|---|---|
| Free | Ya | Tidak | Tidak | Tidak | Tidak | Tidak |
| Plus | Ya | Ya | Ya | Terbatas | Tidak | Tidak |
| Pro | Ya | Ya | Ya | Ya | Ya | Ya |

### Export Modal sebagai Fitur Produk

Export Modal harus memiliki elemen berikut:

1. Judul: `Ekspor Data`.
2. Format selector: `PDF`, `Excel (.xlsx)`, `CSV`.
3. Rentang tanggal sesuai periode laporan aktif.
4. Dataset selection.
5. Field selection untuk transaksi.
6. Locked state untuk fitur yang tidak termasuk paket user.
7. Tombol utama `Unduh`.
8. Loading state saat file sedang dibuat.
9. Error state saat export gagal.

### Dataset Export MVP

#### CSV

CSV hanya mengekspor transaksi.

Field transaksi yang valid berdasarkan schema Supabase saat ini:

1. Tanggal.
2. Deskripsi.
3. Kategori.
4. Tipe.
5. Jumlah.
6. Dompet.
7. Tagihan.
8. Utang/Piutang.

Field yang tidak boleh ditampilkan pada MVP karena belum ada di schema:

1. Sub Kategori.
2. Ke Dompet.
3. Catatan.

#### Excel

Excel mendukung multi-sheet:

1. Ringkasan.
2. Transaksi.
3. Budget Performance.
4. Goals.
5. Debts.
6. Categories.
7. Insight AI jika tersedia dan user memiliki akses.
8. Investments jika user memiliki akses Pro.

#### PDF

PDF berisi laporan ringkas:

1. Header laporan.
2. Periode.
3. Skor kesehatan finansial.
4. Ringkasan utama.
5. Kategori teratas.
6. Performa anggaran.
7. Progress goals.
8. Ringkasan utang/piutang.
9. Insight AI jika tersedia dan user memiliki akses.

### Acceptance Criteria Tambahan

1. Tombol export membuka modal, bukan langsung download.
2. Modal menyesuaikan opsi berdasarkan format yang dipilih.
3. CSV hanya menampilkan konfigurasi transaksi.
4. Excel menampilkan dataset multi-sheet.
5. PDF menampilkan section laporan ringkas.
6. Field yang tidak tersedia di database tidak boleh muncul.
7. Fitur terkunci menampilkan label upgrade sesuai paket.
8. Export tidak berjalan jika user memilih fitur yang tidak dimiliki paketnya.
9. File export mengikuti filter periode aktif.
10. Nama file mengikuti format `laporan-ngaturin-YYYY-MM` atau `transaksi-ngaturin-YYYY-MM`.

### Catatan Implementasi

Detail teknis lengkap untuk Export Modal dipindahkan ke dokumen khusus:

- `docs/REPORTS_EXPORT_SPECIFICATION.md`

Dokumen PRD utama sebelumnya tetap berlaku sebagai dasar produk fitur Laporan. Update ini menjadi addendum resmi untuk memperjelas perilaku export dan paywall.
