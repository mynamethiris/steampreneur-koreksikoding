# Spesifikasi Produk

**Nama tim:** KoreksiKoding
**Nama produk:** KoreksiKoding: Platform Asisten Pembelajaran Pemrograman Berbasis Generative-AI Socratic dan Gamifikasi Numerasi untuk Siswa SMK
**Alur inti yang dibangun:** "Pengguna menempel kode di editor, menekan Analisis, lalu melihat daftar error/warning/saran, skor nilai, dan kode yang sudah diperbaiki."

## 1. Masalah
Pelajar, mahasiswa, dan developer pemula sering stuck saat kode error tetapi pesan error compiler/AI umum sulit dipahami. Mereka butuh penjelasan berbahasa Indonesia, lokasi baris yang tepat, kode perbaikan yang bisa langsung disalin, dan konteks belajar (konsep + latihan) tanpa harus setup backend atau mengirim kode ke server milik orang lain.

Yang mengalaminya: siswa SMK/RPL, mahasiswa informatika semester awal, peserta bootcamp, dan guru yang memeriksa tugas coding.

## 2. Pengguna
- **Pelajar / mahasiswa:** menempel tugas (Python, JavaScript, Java, C++, dll), ingin tahu salah di mana dan cara memperbaiki. Butuh bahasa Indonesia, penjelasan sederhana, dan contoh benar vs salah.
- **Developer pemula / otodidak:** butuh skor kualitas, deteksi keamanan (CWE) dan duplikasi, serta riwayat analisis yang bisa diekspor.
- **Guru / mentor:** butuh hasil yang bisa dibagikan (snippet link 2 jam), panduan belajar + kuis, dan riwayat tantangan coding.

Kebutuhan utama: cepat (satu klik), privat (tanpa backend), multi-bahasa (ID/EN), dan bisa dipakai di HP maupun desktop.

## 3. Hasil wawancara calon pengguna
Narasumber (tulis perannya saja, tanpa data pribadi, misalnya "pelanggan kantin, kelas XI"):
- Mahasiswa informatika semester 2
- Siswa SMK RPL kelas XI
- Mentor bootcamp JavaScript

Cara wawancara (langsung / lewat pesan) dan tanggal:
- Lewat pesan dan tatap muka ringan, 28-30 September 2026

| Pertanyaan kami | Jawaban narasumber |
|---|---|
| Saat kode error, apa yang biasanya kamu lakukan? | Copy error ke Google / ChatGPT, tapi jawabannya kepanjangan dan campur bahasa Inggris. |
| Apa yang paling menyulitkan dari jawaban AI umum? | Tidak tahu baris mana yang salah, kode perbaikan beda bahasa, tidak ada skor. |
| Apakah kamu mau menyimpan API key / kode di server? | Tidak, maunya di browser saja, privasi terjaga. |
| Fitur apa yang paling diinginkan? | Tempel kode -> langsung tahu salahnya, ada tombol salin perbaikan, ada riwayat yang bisa diunduh CSV. |
| Apakah butuh belajar lanjutan? | Ya, konsep singkat + tantangan latihan + tes mengetik kode. |

Jika tidak memungkinkan wawancara, tulis persona pengguna dan dasar asumsi kalian di sini.
> Wawancara di atas sudah dilakukan. Asumsi tambahan: pengguna memakai HP Android dan laptop sekolah dengan koneksi terbatas, sehingga UI harus ringan, responsif (split-pane desktop, tab di mobile), dan ada mode gelap/terang.

## 4. Fitur wajib (hanya untuk alur inti)
1. Editor kode CodeMirror 6 dengan 22 bahasa (python, javascript, typescript, jsx, tsx, java, c, cpp, cs, go, rust, php, ruby, kotlin, swift, dart, html, css, sql, json, xml, yaml), deteksi bahasa dari nama file dan isi, upload file, multi-file tab.
2. Analisis AI satu klik (Ctrl+Enter): kirim kode + prompt JSON ke provider aktif (Gemini default, fallback Groq/custom OpenAI-compatible), tampilkan error/warning/suggestion per baris, skor 0-100, fixedCode, changes, explanation (salah vs benar), concepts, refactoringScore, vulnerabilities (CWE), duplications.
3. Panel hasil + aksi lanjutan: salin/unduh kode perbaikan, simpan otomatis ke IndexedDB, ekspor/impor riwayat JSON/CSV, pencarian dan filter riwayat, restore ke editor, pengaturan provider dan API key terenkripsi.

## 5. Di luar cakupan (tidak dikerjakan dalam challenge ini)
- Eksekusi / running kode di browser atau server (tidak ada runner).
- Login akun, backend, database server, kolaborasi real-time.
- Auto-fix langsung ke file tanpa konfirmasi pengguna.
- Marketplace prompt atau leaderboard global.

## 6. Aturan bisnis dan perhitungan
- Skor kualitas: `skor = 100 - (jumlah_error * 10 + jumlah_warning * 5 + jumlah_saran * 2)`, minimum 0, maksimum 100. Dihitung oleh AI dan dinormalisasi di klien `Math.max(0, Math.min(100, skor))` (`src/lib/api.ts`, `src/lib/prompts.ts`).
- Batas input: kode disanitasi (`sanitizeCode`) hapus `<script>`, `iframe/object/embed/svg/link/style/base`, atribut `on*`, `javascript:` dan dipotong maksimal 50.000 karakter.
- Validasi input bukan kode: jika input hanya komentar/teks acak, AI wajib mengembalikan errors/warnings/suggestions kosong, skor 0, `fixedCode` berisi "Input tidak valid: ini bukan kode ... yang dikenali." (`ANALYSIS_PROMPT_ID/EN`).
- Kode bersih: jika tidak ada temuan, skor 100, `fixedCode` sama dengan kode asli, minimal satu suggestion "Kode sudah baik".
- `fixedCode` wajib bahasa yang sama dengan bahasa sumber. Dilarang konversi bahasa di alur analisis (konversi hanya lewat halaman Converter).
- Nomor baris 1-indexed.
- API key wajib ada sebelum analisis. Jika provider aktif kosong, otomatis fallback ke provider lain yang punya key; jika tidak ada, tampilkan notifikasi isi API key. Jika model 401/403/503/busy, otomatis coba provider cadangan sekali.
- Snippet sharing berlaku 2 jam (diatur di halaman Share/Snippet, bukan alur inti).

## 7. Data yang disimpan
| Data | Contoh isi | Disimpan di mana |
|---|---|---|
| Riwayat analisis | `{id, code: "def tambah(a,b): return a+b", language: "python", timestamp: 1728000000000, score: 85, errorCount: 1, result: {...}}` | IndexedDB `koreksikoding-db` object store `history` (indeks `timestamp`) via `src/lib/db.ts` |
| Riwayat tantangan | `{id, challengeId: "py-01", title: "Balik String", difficulty: "easy", completed: true, editorContent: "..."}` | IndexedDB object store `challenges` (indeks `timestamp`, `challengeId`) |
| Provider AI + API key terenkripsi | `{id: "gemini", model: "gemini-3.5-flash", apiKey: "enc:v1:..."}` | `localStorage` `kk_providers` (AES-GCM, `src/lib/crypto.ts`), versi di `kk_encryption_version` |
| Provider aktif | `"gemini"` | `localStorage` `kk_active_provider` |
| State editor multi-file | `{files: [{id, name: "untitled", language: "javascript", content: "..."}], activeFileId}` | `localStorage` `kk_koreksi_editor_state` (+ migrasi dari `kk_editor_state`) |
| Hasil analisis terakhir | `{score: 85, fixedCode: "...", errors: [...]}` | `localStorage` `kk_analysis_state` |
| Rate limit | `{count: 3, windowStart: 1728000000000}` | `localStorage` `kk_rate_limit` |
| Tema, bahasa editor, tab hasil, custom prompt, mobile tab | `"dark"`, `"python"`, `"hasil"`, `"..."` | `localStorage` `kk_theme`, `kk_editor_language`, `kk_active_result_tab`, `kk_custom_prompt`, `kk_editor_mobile_tab` |
| Progres tantangan selesai | `["py-01", "js-02"]` | `localStorage` `kk_completed_challenges` |

Tidak ada data kode atau API key yang dikirim ke server milik kami. Panggilan API langsung dari browser ke provider (Gemini/Groq/custom).

## 8. Kriteria "selesai"
Setiap kriteria harus bisa diuji (bisa dijawab ya atau tidak).
- [ ] Pengguna bisa menempel kode Python/JavaScript, pilih bahasa otomatis/manual, tekan Analisis (atau Ctrl+Enter), dan melihat error per baris + skor dalam < 60 detik (dengan API key valid).
- [ ] `fixedCode` yang ditampilkan selalu dalam bahasa yang sama dengan input dan bisa disalin/diunduh tanpa sisa markdown fence.
- [ ] Setiap hasil analisis tersimpan di Riwayat dan bisa dicari, difilter (Analisis/Tantangan), diekspor ke JSON dan CSV, serta di-restore ke editor.
- [ ] Tanpa API key, aplikasi menolak analisis dan menampilkan notifikasi pengaturan, bukan crash.
- [ ] Input bukan kode (misal "halo apa kabar") menghasilkan skor 0 dan pesan "Input tidak valid", bukan error teknis.
- [ ] Rate limit 20/jam ditegakkan: analisis ke-21 dalam satu jam ditolak dengan pesan sisa kuota.
- [ ] `npm install && npm run dev` berjalan di komputer bersih dan `npm run build` lolos `tsc -b && vite build`.
