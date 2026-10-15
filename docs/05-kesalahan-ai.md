# Kesalahan AI yang Kami Temukan

Catat setiap kali AI memberikan hasil yang salah, tidak sesuai spesifikasi, atau tidak perlu.
Ini bukan catatan kegagalan tim. Justru ini bukti bahwa tim memeriksa hasil AI.

| No | Apa yang diminta | Kesalahan AI | Bagaimana kami mengetahuinya | Perbaikan yang kami lakukan |
|---|---|---|---|---|
| 1 | Prompt analisis JSON only | AI (model Groq reasoning) mengembalikan `<think>...</think>` + fence ```json sebelum JSON sehingga `JSON.parse` gagal | Uji U01 gagal dengan error "Tidak ada JSON yang valid"; cek Network → raw text ada blok think | Tambah `stripThinkingBlocks()` dan `extractJSON()` yang memindai `{...}` dengan pelacakan depth + string/escape di `src/lib/api.ts`; tambah aturan prompt "JSON only, no fence". Uji ulang U01 lulus. |
| 2 | Kode perbaikan bahasa sama | `fixedCode` untuk input Python dikembalikan dalam JavaScript (`function tambah(a,b)`) | Review manual + uji U01: bahasa berubah, melanggar aturan bisnis | Pertegas prompt "fixedCode HARUS bahasa yang SAMA, JANGAN konversi" + tambah `sanitizeFixedCode()` yang membuang label bahasa di baris pertama (`/^(python|javascript|...)\s*\n/i`). |
| 3 | Deteksi bahasa dari isi | `detectLanguageFromContent()` menebak `const x = 1` pendek sebagai `css` karena pola `\{` | Uji tempel snippet pendek: bahasa salah, highlighting rusak | Tambah guard `if (s.length < 30) return 'javascript'` + urutan cek JSON → XML → YAML → HTML → CSS → SQL → C/Go/Python/Java/PHP/TS/JS. Verifikasi dengan 22 sampel bahasa. |
| 4 | Enkripsi API key | AI awal menyarankan simpan API key plain di localStorage | Review keamanan: tidak memenuhi kebutuhan privasi di spesifikasi | Ganti ke PBKDF2 (100.000 iterasi, salt `koreksikoding-v1`) + AES-GCM IV 12-byte, format `enc:v1:`, migrasi versi `kk_encryption_version` di `src/lib/crypto.ts`. Key lama tetap bisa dibaca lalu dienkripsi ulang. |
| 5 | Impor CSV riwayat | AI membuat parser `line.split(',')` sehingga kode/komentar berkoma memecah kolom | Uji impor CSV hasil ekspor sendiri gagal / kolom bergeser | Tulis `parseCSVRow()` manual dengan status `inQuotes` + escape `""` di `RiwayatPage.tsx`; tambah validasi `isValidAnalysis` vs `isValidChallenge` agar file tertukar ditolak. |
| 6 | Saran pindah ke backend | AI reviewer menyarankan simpan riwayat di server + kirim API key lewat backend | Bertentangan dengan spesifikasi "Tidak ada backend, privasi terjaga" | Ditolak dengan alasan (lihat `06-catatan-review.md`). Tetap IndexedDB + fetch langsung browser → provider. |
