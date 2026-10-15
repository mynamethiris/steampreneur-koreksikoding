# Spesifikasi Produk: KoreksiKoding (SRS Enterprise)

**Nama tim:** KoreksiKoding  
**Nama produk:** KoreksiKoding: Platform Asisten Pembelajaran Pemrograman Berbasis Generative-AI Socratic dan Gamifikasi Numerasi untuk Siswa SMK  
**Alur inti yang dibangun:** "Pengguna menempel kode di editor CodeMirror, menekan Analisis (Ctrl+Enter), lalu melihat daftar error/warning/saran baris demi baris, skor kualitas kode deterministik (0-100), dan perbaikan kode instan yang aman."

## 1. Masalah & Latar Belakang Kuantitatif
Pelajar SMK, mahasiswa informatika pemula, dan developer otodidak sering mengalami *stuck* saat kode mengalami kegagalan kompilasi/runtime, namun pesan error bawaan compiler atau AI umum sering kali terlalu abstrak, menggunakan bahasa Inggris tingkat lanjut, dan tidak memberikan konteks edukatif. 
* **Metrik Dampak (Target):** Mereduksi waktu *debugging* mandiri siswa dari rata-rata 45 menit menjadi kurang dari 2 menit melalui ekstraksi Socratic AI berbasis pola error compiler riil.
* **Solusi:** Memberikan penjelasan berbahasa Indonesia yang ramah pemula, identifikasi nomor baris 1-indexed secara presisi, cuplikan kode perbaikan (*fixed code*), serta konsep modular tanpa mengharuskan pengguna melakukan setup *backend* server eksternal.

## 2. Pengguna Utama & Persona
- **Pelajar / Mahasiswa / Siswa SMK TKJT:** Menempel tugas (Python, JavaScript, Java, C++, dll), ingin tahu letak kesalahan dan cara memperbaikinya. Butuh penjelasan bahasa Indonesia, panduan konsep modular, serta perbandingan kode benar vs salah.
- **Developer Pemula / Otodidak:** Membutuhkan penilaian skor kualitas kilat, deteksi kerentanan keamanan dasar (CWE), pendeteksian duplikasi, serta riwayat analisis yang dapat diekspor.
- **Guru / Mentor Pemrograman:** Membutuhkan alat bantu validasi tugas cepat, opsi berbagi cuplikan (*snippet link* berlaku 2 jam), serta arsip riwayat tantangan coding siswa.

## 3. Hasil Wawancara Calon Pengguna
*Wawancara dilakukan secara langsung dan daring dengan subjek perwakilan (5 orang) siswa SMK TKJT dan mentor bootcamp (28-30 September 2026).*

| Pertanyaan Analis | Temuan / Jawaban Pengguna | Implikasi pada Sistem |
|---|---|---|
| Apa hambatan terbesar saat kode Anda *error*? | Pesan error compiler terlalu kaku, bingung mencari letak baris yang salah. | Sistem wajib menampilkan nomor baris 1-indexed secara presisi dan penjelasan bahasa Indonesia. |
| Apakah Anda nyaman mengirim kode tugas ke server luar? | Khawatir masalah privasi kode dan data pribadi. | Seluruh pemrosesan langsung dari browser ke API (client-side execution), penyimpanan lokal (IndexedDB). |
| Fitur apa yang paling membantu proses belajar? | Tombol salin perbaikan instan dan skor kualitas kode untuk evaluasi mandiri. | Integrasi tombol *Copy Fixed Code*, perhitungan skor matematis transparan, dan riwayat otomatis. |

> *Observasi tambahan:* Pengguna memakai perangkat mobile Android serta laptop lab sekolah dengan koneksi terbatas, sehingga antarmuka dirancang sangat ringan, responsif (*split-pane* di desktop, tab dinamis di mobile), serta menyediakan mode gelap/terang.

## 4. Fitur Wajib (Hanya Untuk Alur Inti)
1. **Editor Kode CodeMirror 6:** Mendukung 22 bahasa pemrograman utama (`python`, `javascript`, `typescript`, `jsx`, `tsx`, `java`, `c`, `cpp`, `cs`, `go`, `rust`, `php`, `ruby`, `kotlin`, `swift`, `dart`, `html`, `css`, `sql`, `json`, `xml`, `yaml`), deteksi bahasa otomatis dari nama file/isi, unggah file, dan sistem tab multi-file.
2. **Mesin Analisis Socratic AI:** Eksekusi sekali klik (`Ctrl+Enter`) untuk mengirim payload JSON terstruktur ke provider aktif (Gemini sebagai default, fallback Groq/OpenAI-compatible), menghasilkan *error/warning/suggestion* per baris, skor kualitas 0-100, `fixedCode`, penjelasan perbedaan salah vs benar, konsep, *refactoring score*, kerentanan (CWE), dan duplikasi.
3. **Panel Hasil & Rekapitulasi Data:** Salin/unduh kode perbaikan instan, penyimpanan otomatis ke IndexedDB, ekspor/impor riwayat dalam format JSON dan CSV, pencarian serta filter riwayat, fungsi *restore* ke editor, serta manajemen pengaturan API key terenkripsi.

## 5. Di Luar Cakupan (Out of Scope)
- Eksekusi langsung / *compiler runtime* kode di dalam browser atau server (*code runner* sisi klien).
- Sistem autentikasi pengguna berbasis server, *backend database* terpusat, atau kolaborasi *real-time*.
- Modifikasi otomatis (*auto-fix*) langsung ke *filesystem* lokal perangkat tanpa konfirmasi eksplisit dari pengguna.
- Marketplace prompt publik atau papan peringkat global (*global leaderboard*).

## 6. Aturan Bisnis & Logika Perhitungan Matematis
- **Rumus Skor Kualitas (Quality Score):** 
  $$\text{Skor} = \max\left(0, \min\left(100, 100 - (\text{error} \times 10 + \text{warning} \times 5 + \text{saran} \times 2)\right)\right)$$
  Dihitung dan dinormalisasi secara deterministik di klien (`src/lib/api.ts`, `src/lib/prompts.ts`).
- **Sanitasi Keamanan Input (`sanitizeCode`):** Menghapus tag berbahaya seperti `<script>`, `<iframe>`, `<object>`, `<embed>`, `<svg>`, `<link>`, `<style>`, `<base>`, atribut penanganan *event* (`on*`), dan protokol `javascript:`, dengan batas panjang input maksimal 50.000 karakter.
- **Validasi Input Non-Kode:** Jika input hanya berupa komentar atau teks acak, AI wajib mengembalikan daftar temuan kosong, skor 0, dan `fixedCode` berisi `"Input tidak valid: ini bukan kode ... yang dikenali."` (`ANALYSIS_PROMPT_ID/EN`).
- **Integritas Bahasa & Kode Bersih:** `fixedCode` wajib menggunakan bahasa yang sama persis dengan sumber (konversi bahasa hanya melalui halaman khusus Converter). Jika kode bersih tanpa temuan, skor otomatis 100, `fixedCode` identik dengan kode asli, dan diberi minimal satu saran positif `"Kode sudah baik"`.
- **Manajemen API Key & Fallback:** API key wajib tersedia sebelum analisis. Jika provider aktif kosong, sistem otomatis mencari provider cadangan yang memiliki key; jika gagal (status 401/403/503/busy), sistem otomatis mencoba provider cadangan sekali sebelum memunculkan peringatan.
- **Batasan Frekuensi (Rate Limit):** Penegakan batas ketat 20 permintaan per jam; analisis ke-21 dalam jendela waktu tersebut akan ditolak secara anggun dengan informasi sisa kuota.

## 7. Desain Penyimpanan Data (Data Persistence)
| Jenis Data | Struktur / Contoh Data | Media Penyimpanan & Lokasi Kode |
|---|---|---|
| Riwayat Analisis | `{id, code: "def tambah...", language: "python", timestamp: 1728000000000, score: 85, errorCount: 1, result: {...}}` | IndexedDB `koreksikoding-db`, object store `history` (`src/lib/db.ts`) |
| Riwayat Tantangan | `{id, challengeId: "py-01", title: "Balik String", difficulty: "easy", completed: true, editorContent: "..."}` | IndexedDB object store `challenges` |
| Enkripsi Kredensial | `{id: "gemini", model: "gemini-3.5-flash", apiKey: "enc:v1:..."}` | LocalStorage `kk_providers` (AES-GCM via `src/lib/crypto.ts`) |
| State Editor Multi-file | `{files: [{id, name: "untitled", language: "javascript", content: "..."}], activeFileId}` | LocalStorage `kk_koreksi_editor_state` |
| Konfigurasi & UI | Tema, bahasa editor, tab aktif, custom prompt, mobile tab | LocalStorage (`kk_theme`, `kk_editor_language`, `kk_active_result_tab`, dll.) |

*Catatan Etika & Privasi:* Tidak ada data kode sumber atau kredensial API key yang dikirim ke server pihak ketiga milik kami. Seluruh komunikasi dilakukan langsung dari browser pengguna ke penyedia layanan AI.

## 8. Kriteria Selesai (Acceptance Criteria)
- [ ] Pengguna dapat menempel kode Python/JavaScript, memilih bahasa secara otomatis/manual, menekan Analisis (atau `Ctrl+Enter`), dan melihat rincian error baris demi baris beserta skor dalam waktu < 60 detik (dengan API key valid).
- [ ] `fixedCode` yang dirender selalu konsisten menggunakan bahasa pemrograman sumber dan dapat disalin/diunduh secara bersih tanpa bocoran *markdown fence*.
- [ ] Setiap hasil analisis tersimpan otomatis di Riwayat, dapat dicari, difilter (Analisis/Tantangan), diekspor ke format JSON/CSV, serta dipulihkan kembali ke dalam editor.
- [ ] Ketiadaan API key ditangani dengan mekanisme penolakan anggun (*graceful degradation*) yang mengarahkan pengguna ke panel pengaturan, bukan menyebabkan crash aplikasi.
- [ ] Masukan non-kode (misal teks bebas) menghasilkan skor 0 dan peringatan validasi yang tepat alih-alih error eksekusi teknis.
- [ ] Batasan kuota *rate limit* 20/jam berfungsi efektif menolak kelebihan permintaan dengan pesan notifikasi yang jelas.
- [ ] Perintah `npm install && npm run dev` berjalan mulus di lingkungan bersih, serta proses `npm run build` sukses sepenuhnya melewati pemeriksaan `tsc -b && vite build`.