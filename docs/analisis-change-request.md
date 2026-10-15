# Analisis Change Request

Isi bagian ini **sebelum** mengubah kode, lalu commit dan push (contoh pesan: `dokumen: analisis change request`). Juri memeriksa bahwa commit ini muncul sebelum commit perubahan kode.

**Change request:** pencarian, filter, dan ekspor CSV (lihat Tugas 3 di lembar challenge). Repo dokumen ada di https://github.com/mynamethiris/steampreneur-koreksikoding pada folder `docs`.

**Kriteria penerimaan yang akan dipenuhi dan cara kami memenuhinya:**
- Pengguna ketik kata kunci dan daftar langsung filter tanpa reload. Cara: state `search` plus `filteredAnalysis` untuk kode dan `filteredChallenges` untuk judul. Filter pakai `toLowerCase` plus `includes` sehingga huruf besar kecil tidak masalah.
- Pengguna pindah tab Analisis dan Tantangan dengan mudah. Cara: state `activeTab` plus tab animasi `layoutId="riwayat-tab"`. Setiap ganti tab, `search` di-reset ke kosong lewat `setSearch('')`.
- Pengguna unduh CSV dan buka di Excel. Cara: `exportToCSV` dengan bungkus kutip dan escape `""` plus `downloadFile` lewat Blob. File analisis bernama `riwayat-analisis.csv` dengan 5 kolom. File tantangan bernama `riwayat-tantangan.csv` dengan 4 kolom.
- Pengguna impor balik JSON dan CSV dengan aman. Cara: `parseCSVRow` yang paham status `inQuotes`, lewati baris kurang kolom, lalu cek isi `score` dan `code` untuk analisis atau `title` dan `difficulty` untuk tantangan. File tertukar ditolak dengan pesan jelas dan data lama tetap aman.
- Alur analisis tidak berubah. Cara: tidak menyentuh `runAnalysis` di `AppContext.tsx`, tidak ubah prompt, tidak ubah kunci dan batas.

## 1. Dampak
| Bagian yang terdampak | File / fungsi | Perubahan yang diperlukan |
|---|---|---|
| Spesifikasi | `docs/01-spesifikasi.md` poin 3 pada repo dokumen | Tidak perlu tambah baru. Poin 3 sudah tulis "ekspor/impor riwayat JSON/CSV, pencarian dan filter riwayat". Kerja ini hanya pastikan kode sama dengan tulisan itu. |
| Kode | `src/pages/RiwayatPage.tsx`, `src/lib/api.ts`, `src/lib/db.ts` pada repo kode | `RiwayatPage`: `search`, `activeTab`, `filteredAnalysis`, `filteredChallenges`, `handleExportJSON`, `handleExportCSV`, `handleImport`, `handleImportChallenges`, `parseCSVRow`, modal lihat, hapus, restore. `api.ts`: `exportToJSON`, `exportToCSV`, `downloadFile`, `formatTimestamp` format Indonesia. `db.ts`: database `koreksikoding-db` dengan store `history` dan `challenges`, fungsi `getAllHistory`, `getAllChallengeHistory`, `importHistory`, `importChallengeHistory`. Tidak ubah `runAnalysis`. |
| Kasus uji / test | `docs/04-kasus-uji.md` U05 pada repo dokumen | Tidak perlu ID baru di repo dokumen. U05 sudah uji "simpan + cari + filter + ekspor CSV". Tabel di bawah hanya perincian U05 untuk cek manual. |
| README | `README.md` pada kedua repo | Tidak perlu ubah. README repo kode sudah ada baris "Riwayat Analisis - Tersimpan lokal di IndexedDB, bisa di-export ke JSON/CSV". README repo dokumen masih ringkas. Kedua repo tidak punya folder bukti. |

## 2. Kasus uji baru
| ID | Langkah / input | Hasil yang diharapkan |
|---|---|---|
| C01 | Isi Riwayat dengan 3 entri kode berisi kata "tambah", "kurang", "kali". Ketik "tambah" di kolom cari. Hapus lagi. | Saat ketik "tambah" hanya 1 entri tampil. Saat dihapus 3 entri tampil lagi. Kalau tidak cocok tampil pesan "Tidak ada hasil pencarian". |
| C02 | Klik tab Tantangan lalu ketik judul tantangan. Pindah lagi ke tab Analisis. | Filter judul tidak peduli huruf besar kecil. Setiap ganti tab kolom cari kembali kosong. |
| C03 | Klik Ekspor CSV di tab Analisis lalu buka di Excel. | File `riwayat-analisis.csv` terunduh. Header `Tanggal,Skor,Error,Warning,Saran`. Jumlah baris sama dengan jumlah entri. Tanggal format Indonesia misal `12 Okt 2026, 10.00`. Nilai berkoma tetap satu kolom karena dikutip. |
| C04 | Impor balik file CSV dari C03. Lalu coba impor file tantangan ke tab analisis. Coba impor file kosong. | Impor benar tampil toast jumlah berhasil dan entri bertambah. Baris kurang dari 5 kolom dilewati. File tertukar ditolak dengan pesan bukan analisis dan data tidak rusak. File kosong ditolak. |
| C05 | Klik Ekspor CSV di tab Tantangan lalu impor balik. | File `riwayat-tantangan.csv` terunduh dengan header `Tanggal,Judul,Tingkat,Bahasa`. Impor balik tambah entri. Baris kurang dari 4 kolom dilewati. File analisis yang masuk ke tab tantangan ditolak. |

## 3. Setelah selesai
- [ ] Kasus uji lama tetap lulus
- [ ] Kasus uji baru lulus
- [ ] Spesifikasi diperbarui
- [ ] README diperbarui
