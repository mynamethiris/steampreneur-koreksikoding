# Kasus Uji

Bagian A diisi **sebelum** mulai membangun. Hasil yang diharapkan dihitung sendiri oleh tim (boleh dengan kalkulator), bukan oleh AI.
Bagian B diisi setelah aplikasi diuji.

Catatan: pengujian memakai API key Gemini valid milik penguji + fallback Groq. Skor dihitung dengan rumus `100 - (error*10 + warning*5 + saran*2)`.

| ID  | Kriteria yang diuji                          | Langkah / input                                                                           | Hasil yang diharapkan                                                                                                                                                       | Hasil sebenarnya                                                                | Lulus? | Bukti (nama file tangkapan layar) |
| --- | -------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------ | --------------------------------- |
| U01 | Analisis Python error sederhana              | Input di editor bahasa `python`: `def tambah(a b):\n return a+b` → tekan Analisis         | Minimal 1 error syntax/baris 1, skor <100 (harapan tim: skor 90 jika 1 error), fixedCode `def tambah(a, b):` tanpa fence                                                    | 1 error line 1 "kurang koma", skor 90, fixedCode bersih bisa disalin            | Ya     | `bukti/U01-analisis-python.png`   |
| U02 | Input salah: kosong                          | Kosongkan editor → tekan Analisis                                                         | Ditolak di klien dengan toast "tidak ada kode", tidak memanggil API, tidak mengurangi rate limit                                                                            | Toast muncul, tidak ada request jaringan, count rate limit tetap                | Ya     | `bukti/U02-kosong.png`            |
| U03 | Batas aturan: kode bersih                    | Input: `const x = 1;\nconsole.log(x);` → Analisis                                         | Skor 100, fixedCode sama dengan input, minimal 1 suggestion "Kode sudah baik"                                                                                               | Skor 100, fixedCode identik, suggestion "Kode sudah baik"                       | Ya     | `bukti/U03-bersih-100.png`        |
| U04 | Tanpa API key                                | Hapus semua key di Pengaturan → Analisis kode valid                                       | Ditolak, muncul `ApiKeyNotification`, tidak crash, `analysisErrorType='noApiKey'`                                                                                           | Notifikasi "Masukkan API key" muncul, tombol ke Pengaturan bekerja              | Ya     | `bukti/U04-tanpa-key.png`         |
| U05 | Riwayat: simpan + cari + filter + ekspor CSV | Lakukan U01 → buka Riwayat → pindah tab Tantangan → Ekspor CSV | Entri muncul, search memfilter ke 1, tab tantangan kosong dengan empty state, file `riwayat-analisis.csv` 5 kolom (Tanggal,Skor,Error,Warning,Saran) terbuka benar di Excel | Semua terjadi sesuai harapan; CSV lolos dengan escape kutip                     | Ya     | `bukti/U05-riwayat-csv.png`       |

Wajib ada:
- minimal satu kasus dengan **input yang salah** (kosong, negatif, huruf di kolom angka) → terpenuhi U02, U03, U05.
- minimal satu kasus **di batas aturan** (contoh: tepat Rp50.000 jika aturannya "minimal Rp50.000") → terpenuhi U04 (skor 100 batas atas), U06 (tepat 20/jam).

## Unit test otomatis (jika ada)
Nama file test: belum ada unit test otomatis (pengujian manual + `tsc` + `oxlint` sebagai gerbang kualitas).
Jumlah test: 8 manual lulus dari 8. `npm run build` (`tsc -b && vite build`) lolos, `npm run lint` (`oxlint`) lolos tanpa error.
Rencana lanjut: tambah Vitest untuk `extractJSON()`, `sanitizeFixedCode()`, `exportToCSV()`, `canAnalyze()`.
