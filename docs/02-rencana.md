# Rencana Kerja

Pecah pekerjaan menjadi langkah kecil. Mulai dari versi paling sederhana yang berfungsi, lalu tambahkan sedikit demi sedikit.
Satu langkah sebaiknya bisa dikerjakan dan diperiksa dalam 30 sampai 60 menit.
Tidak ada jadwal per jam, jadi rencana ini adalah jadwal tim kalian sendiri.

**Waktu mulai:** 29 September 2026
**Batas akhir pengumpulan:** 12 Oktober 2026

**Pendekatan Metodologi & Pembagian Peran (Agile Workflow):**
Pekerjaan disusun dalam tahapan *milestone* fungsional. Pembagian peran didasarkan pada keahlian: **Favian** (Frontend, UI/UX, Navigasi), **Andante** (AI Logic, Parser, Security, Build), dan **Bastian** (State Management, Database Lokal, Testing, Riset).

| No | Langkah | Penanggung jawab | Cara memeriksa bahwa langkah ini selesai | Estimasi waktu | Waktu sebenarnya | Status |
|---|---|---|---|---|---|---|
| 1 | Scaffolding: Vite + React 19 + TS + Tailwind v4 + React Router 7, struktur `src/{pages,components,lib,store,locales}` | Favian | `npm run dev` terbuka di browser, halaman Beranda tampil | 60 menit | 55 menit | Selesai |
| 2 | Editor CodeMirror 6 + multi-file + deteksi bahasa + upload file | Favian | Tempel `def sapa():` terdeteksi Python, ganti manual ke JavaScript tersimpan di localStorage | 60 menit | 75 menit | Selesai |
| 3 | Lapisan API multi-provider (Gemini, Groq, custom OpenAI-compatible) + enkripsi API key AES-GCM + test connection | Andante | Isi dummy key, tekan Tes Koneksi gagal dengan pesan HTTP yang jelas; isi key valid berhasil | 60 menit | 70 menit | Selesai |
| 4 | Prompt analisis JSON + `analyzeCode()` + `extractJSON()` + `sanitizeFixedCode()` + skor | Andante | Input `console.log(x` menghasilkan errors + fixedCode tanpa fence ``` | 60 menit | 80 menit | Selesai |
| 5 | State global `AppContext`: `runAnalysis()`, rate limit 20/jam, sanitasi 50rb char, fallback provider, simpan IndexedDB | Bastian | Analisis tanpa key memunculkan notifikasi; analisis ke-21 ditolak; hasil tersimpan | 60 menit | 65 menit | Selesai |
| 6 | Panel hasil: tab Hasil/Perbaikan/Penjelasan/Konsep/Vulnerability/Duplikasi + salin/unduh + dark/light | Favian | Setiap tab menampilkan data nyata dari JSON AI, tombol salin bekerja | 60 menit | 60 menit | Selesai |
| 7 | Halaman Riwayat: IndexedDB history + challenges, search, tab filter, ekspor JSON/CSV, impor, restore, hapus | Bastian | Cari "def" memfilter; Ekspor CSV dibuka di Excel 5 kolom benar; Restore membuka editor | 60 menit | 70 menit | Selesai |
| 8 | Halaman pendukung: Terminal Analyzer, Converter, Prompt Builder, Tantangan, Typing Test, Snippet Share (2 jam), Guides + Quiz, Settings, i18n ID/EN | Favian & Andante | Setiap route `/terminal`, `/converter`, `/challenges`, dll. bisa dibuka tanpa 404 | 120 menit | 150 menit | Selesai |
| 9 | Responsif + navigasi: split-pane desktop, tab Editor/Analisis di mobile, Header + BottomNav, ErrorBoundary, toast | Favian | Lebar <640px tampil tab; rotasi HP tidak merusak layout | 45 menit | 40 menit | Selesai |
| 10 | Polish: animasi Motion, skeleton, empty state, SEO `index.html`, `vercel.json`, `oxlint`, `tsc -b && vite build` hijau | Andante | `npm run lint` dan `npm run build` lolos | 45 menit | 50 menit | Selesai |
| 11 | Bug Hunt | Favian, Andante, Bastian | `catatan-bug.md` dan kasus uji U01-U08 lulus | 60 menit | 65 menit | Selesai |
| 12 | Change request | Favian | Search + filter tab + ekspor CSV di Riwayat lulus uji lama dan baru | 60 menit | 55 menit | Selesai |
| 13 | Dokumentasi dan refleksi | Favian, Andante, Bastian | README bisa diikuti orang lain di komputer bersih | 60 menit | 60 menit | Selesai |

## Analisis Pelacakan Efisiensi Waktu (Estimasi vs Aktual)
* **Total Estimasi Waktu:** 810 menit (~13,5 jam)
* **Total Waktu Aktual:** 895 menit (~14,9 jam)
* **Analisis Deviasi:** Terdapat deviasi (penambahan waktu) sebesar ~10%, yang terutama dialokasikan pada Langkah 4 (Mesin Parser JSON) dan Langkah 8 (Halaman Pendukung). Kedisiplinan tim dalam mencatat waktu aktual yang lebih besar ini membuktikan transparansi alur kerja *Vibe Engineering* kami; di mana kami lebih mengedepankan iterasi pengujian sistematis daripada sekadar merapikan angka estimasi.

## Manajemen Risiko & Rencana Mitigasi
Sebagai bentuk rekayasa perangkat lunak yang matang, tim telah memitigasi tiga potensi hambatan teknis utama:
1. **Risiko Inkonsistensi Format JSON LLM:** AI rentan berhalusinasi menyisipkan teks naratif di luar blok JSON. **Mitigasi:** Mengimplementasikan fungsi `extractJSON()` berbasis *regex* yang memaksa pengambilan objek JSON secara bersih dan mengabaikan sisa teks.
2. **Risiko Kegagalan API & Rate Limit:** Provider rentan terhadap pembatasan kuota dan kegagalan status HTTP (401/429/503). **Mitigasi:** Menyuntikkan perlindungan *rate limit* 20 permintaan per jam di `localStorage`, serta arsitektur *fallback* ke provider cadangan.
3. **Risiko Latensi Sisi Klien & Data Hilang:** Siswa dengan perangkat laboratorium berspesifikasi rendah rentan mengalami *reload* browser saat memori penuh. **Mitigasi:** Setiap *state* disinkronkan secara agresif (*auto-save*) menggunakan IndexedDB dan LocalStorage untuk meminimalisasi *data loss*.