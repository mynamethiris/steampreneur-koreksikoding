# Refleksi Tim

1. Apa yang berjalan baik dalam cara kami bekerja dengan AI?
   Kami memakai AI untuk draf awal yang besar (deteksi bahasa 22 bahasa, prompt JSON, parser CSV) lalu kami uji manual dengan kasus U01-U08. Pembagian jelas: Anggota 1 fokus editor + UI/riwayat, Anggota 2 fokus API + state + keamanan. Setiap hasil AI wajib lolos `tsc`, `oxlint`, dan satu kasus uji sebelum di-merge. Log prompt (03) membuat keputusan bisa dilacak.

2. Kapan AI paling membantu? Kapan AI justru menyulitkan?
   Paling membantu saat membuat boilerplate berulang: peta ekstensi CodeMirror, skema JSON analisis, tabel ekspor CSV, dan terjemahan i18n ID/EN. Paling menyulitkan saat AI terlalu percaya diri: output reasoning dengan `<think>`, konversi bahasa diam-diam di `fixedCode`, dan saran arsitektur backend yang bertentangan dengan kebutuhan privasi. Semua itu butuh verifikasi manual.

3. Kesalahan terbesar yang hampir lolos, dan bagaimana kami menemukannya?
   Parser `extractJSON()` awal memakai `JSON.parse` langsung. Hampir lolos karena diuji hanya dengan Gemini (rapi), tetapi gagal total dengan Groq reasoning. Ditemukan saat Bug Hunt dengan input sama beda provider + uji U01 ulang. Perbaikannya (pemindai depth + strip think + sanitasi fence) didokumentasikan di `05-kesalahan-ai.md` No.1 dan `catatan-bug.md` Bug 1.

4. Apa yang akan kami lakukan berbeda jika mengulang challenge ini?
   Menulis kasus uji (04) dan skema JSON lebih dulu sebelum coding prompt, menambah Vitest sejak hari pertama untuk `extractJSON`, `sanitizeFixedCode`, `exportToCSV`, `canAnalyze`, dan menyiapkan 22 sampel kode kecil untuk uji deteksi bahasa otomatis. Ini akan memangkas 2-3 jam debug manual.

5. Bagaimana kami mengatur waktu? Langkah mana yang jauh lebih lama dari estimasi, dan kenapa?
   Kami memakai target 30-60 menit per langkah (02-rencana). Yang meleset: langkah 4 (prompt + parsing, estimasi 60 → aktual 80 menit) karena harus menangani tiga format liar (think block, fence, label bahasa); langkah 8 (halaman pendukung, 120 → 150 menit) karena i18n ID/EN menggandakan string. Yang menghemat waktu: langkah 9 responsif hanya 40 menit karena memakai Tailwind + pola split-pane/tab yang sudah direncanakan.

6. Bagian mana dari kode yang masih belum kami pahami sepenuhnya? (Jawab dengan jujur.)
   Detail derivasi kunci PBKDF2 ke AES-GCM di `src/lib/crypto.ts` (khususnya manajemen IV dan kegagalan `crypto.subtle` di browser lama) masih kami pakai sebagai pola standar tanpa memahami penuh kriptografinya. Juga perilaku edge `fetchAvailableModels()` untuk endpoint custom yang tidak mengikuti konvensi `/models` atau `/chat/completions` - kami hanya menangani dua pola umum dan fallback ke daftar kosong.
