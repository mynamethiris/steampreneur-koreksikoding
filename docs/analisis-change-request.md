# Analisis Change Request

Isi bagian ini **sebelum** mengubah kode, lalu commit dan push (contoh pesan: `dokumen: analisis change request`). Juri memeriksa bahwa commit ini muncul sebelum commit perubahan kode.

**Change request:** pencarian, filter, dan ekspor CSV (lihat Tugas 3 di lembar challenge). Repo dokumen ada di https://github.com/mynamethiris/steampreneur-koreksikoding pada folder `docs`.

**Kriteria penerimaan yang akan dipenuhi dan cara kami memenuhinya:**
- **Pencarian Real-Time (Client-Side Filtering):** Pengguna dapat mengetik kata kunci dan daftar langsung terfilter tanpa *reload*. Cara: Memanfaatkan state `search`, `filteredAnalysis`, dan `filteredChallenges`. Operasi komparasi distandardisasi menggunakan `toLowerCase()` dan `includes()` untuk pencarian *case-insensitive* dengan kompleksitas O(N) yang ringan di memori browser.
- **Isolasi State Navigasi Tab:** Perpindahan antara tab Analisis dan Tantangan berjalan mulus. Cara: Menggunakan state `activeTab` dengan *shared layout animation* `framer-motion` (`layoutId="riwayat-tab"`). Setiap transisi tab secara eksplisit memicu `setSearch('')` guna mereset *state* pencarian dan mencegah *data-leak* visual antar tab.
- **Ekspor CSV Berstandar RFC 4180:** Pengguna dapat mengunduh CSV yang terjamin rapi saat dibuka di Excel. Cara: Fungsi `exportToCSV` dirancang membungkus nilai string dengan tanda kutip ganda ganda (`"..."`) dan melakukan *escaping* internal (`""`) agar koma di dalam baris kode tidak merusak struktur kolom. *Payload* disajikan menggunakan objek `Blob` browser (`riwayat-analisis.csv` 5 kolom, `riwayat-tantangan.csv` 4 kolom).
- **Validasi Impor Data Ketat (State-Machine Parser):** Sistem mencegah korupsi data saat pengguna mengimpor balik file. Cara: Fungsi `parseCSVRow` bertindak sebagai *finite state machine* yang melacak status `inQuotes`. Baris korup (kurang kolom) diabaikan, dan *header* divalidasi secara ketat untuk menolak file yang tertukar secara anggun (memberikan *error toast* jelas tanpa merusak *database* lama).
- **Zero-Regression pada Alur Inti:** Fitur baru tidak boleh merusak fungsi utama aplikasi. Cara: Menerapkan Prinsip Terbuka/Tertutup (*Open/Closed Principle*). Modul `runAnalysis` di `AppContext.tsx`, sistem *prompt* AI, manajemen kredensial API, dan batas *rate limit* sama sekali tidak disentuh.

## 1. Analisis Dampak Arsitektur (Impact Analysis)
| Bagian yang terdampak | File / fungsi | Perubahan yang diperlukan |
|---|---|---|
| Spesifikasi | `docs/01-spesifikasi.md` poin 3 pada repo dokumen | Tidak ada perubahan lingkup (*scope creep*). Spesifikasi awal sudah mencakup "ekspor/impor riwayat JSON/CSV, pencarian dan filter riwayat". Pekerjaan ini adalah realisasi arsitektural dari spesifikasi tersebut tanpa memodifikasi dokumen induk. |
| Kode (UI & Persistensi) | `RiwayatPage.tsx`, `api.ts`, `db.ts` | **RiwayatPage:** Injeksi state `search`, `activeTab`, dan fungsi *handler* (`handleExportJSON/CSV`, `handleImport`). **api.ts:** Penambahan rutin Blob generator `exportToJSON/CSV` dan formatter tanggal lokal. **db.ts:** Penambahan antarmuka ORM `getAllHistory`, `importHistory`. *Dampak sistem: Terisolasi sempurna pada lapisan UI riwayat, tidak mengganggu performa CodeMirror.* |
| Skenario Uji (Test) | `docs/04-kasus-uji.md` U05 pada repo dokumen | Skenario U05 ("simpan + cari + filter + ekspor") diekspansi menjadi serangkaian Pengujian Regresi (*Regression Testing*) C01-C05 di bawah ini untuk memvalidasi batas tepi (edge cases) pemrosesan string CSV. |
| README | `README.md` pada kedua repo | Pembaruan minor. Deskripsi pada bagian fitur ditambahkan kalimat teknis terkait dukungan format ekspor lintas-platform (CSV/JSON RFC 4180). |

## 2. Skenario Pengujian Regresi (Regression Testing)
| ID | Langkah / input | Hasil yang diharapkan |
|---|---|---|
| C01 | Isi Riwayat dengan 3 entri kode (mengandung kata "tambah", "kurang", "kali"). Ketik "tambah" di kolom pencarian. Hapus teks pencarian. | *State Mutability:* Saat diketik, layar secara reaktif hanya merender 1 entri ("tambah"). Saat dihapus, 3 entri kembali tampil. Input acak memunculkan *empty state* "Tidak ada hasil pencarian". |
| C02 | Klik tab Tantangan, ketik kata kunci acak. Pindah kembali ke tab Analisis. | *Tab Lifecycle:* Filter bekerja *case-insensitive*. Saat perpindahan tab terjadi, *state* kata kunci otomatis ter-reset (kosong), mencegah sisa pencarian mengotori daftar tab lain. |
| C03 | Klik Ekspor CSV di tab Analisis. Buka file hasil unduhan di Microsoft Excel / Google Sheets. | *RFC 4180 Compliance:* File terunduh sempurna. Baris berkoma (seperti kode `console.log(a, b)`) tidak terpisah ke kolom lain karena sistem *escaping* kutip ganda bekerja. Header `Tanggal,Skor,Error,Warning,Saran` konsisten. |
| C04 | Impor balik file CSV dari C03. Lakukan injeksi kesalahan: impor file tantangan ke tab analisis, dan impor file korup/kosong. | *Strict Validation:* Impor sukses memunculkan notifikasi *Toast*. Baris kurang dari 5 kolom otomatis dilewati (tidak merusak aplikasi). Modul menolak keras file yang disilang (tantangan ke analisis) dengan pesan validasi elegan. |
| C05 | Klik Ekspor CSV di tab Tantangan, ubah sebagian teks di Excel, lalu impor balik ke aplikasi. | *Data Integrity:* File `riwayat-tantangan.csv` (4 kolom) sukses dimodifikasi dan dikembalikan ke sistem lokal (IndexedDB) sebagai entri baru yang valid tanpa menimbulkan duplikasi *Primary Key* yang crash. |

## 3. Setelah selesai
- [ ] Kasus uji lama tetap lulus (Zero-Regression terkonfirmasi)
- [ ] Kasus uji baru lulus (Batas tepi / edge cases aman)
- [ ] Spesifikasi diperbarui
- [ ] README diperbarui