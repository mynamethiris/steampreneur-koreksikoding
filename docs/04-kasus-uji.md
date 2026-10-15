# Kasus Uji (Quality Assurance & Test Cases)

Bagian A diisi **sebelum** mulai membangun. Hasil yang diharapkan dihitung secara matematis oleh tim (tanpa intervensi AI) berdasarkan *Business Rules* di Spesifikasi. 
Bagian B diisi setelah purwarupa (prototype) diuji secara komprehensif.

**Parameter Pengujian:** 
- Lingkungan: Browser Klien (Vite Dev Server & Vercel Production).
- Provider Aktif: Gemini 3.5 Flash (Primary) & Groq qwen3.6-27b (Fallback).
- Rumus Determinasi Skor: `Math.max(0, 100 - (error*10 + warning*5 + saran*2))`.

| ID  | Kategori & Kriteria Uji | Langkah / Input Skenario | Hasil yang Diharapkan (Expected Result) | Hasil Sebenarnya (Actual Result) | Lulus? | Bukti Tangkapan Layar |
| --- | --- | --- | --- | --- | --- | --- |
| **U01** | *Positive Testing* (Logika Sintaksis) | Input kode Python: `def tambah(a b):\n return a+b` → Klik Analisis. | AI mendeteksi 1 error (kurang koma). Secara matematis: Skor `100 - (1*10) = 90`. `fixedCode` kembali sebagai `def tambah(a, b):` tanpa *markdown fence*. | Tepat 1 error terdeteksi di baris 1. Skor final 90. Regex `extractJSON` berhasil membersihkan kode. | Ya | `bukti/U01-analisis-python.png` |
| **U02** | *Negative Testing* (Input Kosong/Spasi) | Kosongkan editor, atau isi hanya dengan spasi/tab whitespace → Klik Analisis. | Ditolak oleh validasi klien (*Client-side*). Muncul *Toast* "Tidak ada kode". Tidak ada *request* HTTP yang dikirim, kuota *Rate Limit* tidak terpotong. | Validasi `trim()` memblokir eksekusi. *Toast* muncul, kuota lokal tetap utuh. | Ya | `bukti/U02-kosong.png` |
| **U03** | *Negative Testing* (Injeksi Prompt Non-Kode) | Input teks naratif: `halo AI, tolong buatkan resep nasi goreng` → Klik Analisis. | Sistem *Socratic System Prompt* menolak menjawab. Skor 0, array error kosong, `fixedCode` menampilkan teks: "Input tidak valid: bukan kode pemrograman". | AI mengembalikan skor 0 dengan pesan penolakan sesuai instruksi *system prompt*. | Ya | `bukti/U03-invalid-prompt.png` |
| **U04** | *Boundary Value* (Batas Atas Bersih) | Input kode valid: `const x = 1;\nconsole.log(x);` → Klik Analisis. | Skor tidak boleh lebih dari 100. Jika AI halusinasi memberi skor 110, sistem memaksanya menjadi 100. Array error = 0. Muncul 1 *suggestion* apresiasi. | Normalisasi `Math.min(100, skor)` menahan skor di 100. Editor menampilkan kartu hijau sempurna. | Ya | `bukti/U04-batas-atas.png` |
| **U05** | *Boundary Value* (Batas Bawah & Rate Limit) | Lakukan eksekusi analisis hingga 20 kali secara beruntun. Eksekusi ke-21 dilakukan dalam jam yang sama. | Pada percobaan ke-21, eksekusi dicegat secara lokal oleh `kk_rate_limit`. Menampilkan *Toast*: "Batas 20 analisis per jam tercapai". | Penjaga lokal `canAnalyze()` me-return `false`. Permintaan ke-21 diblokir sebelum mencapai API. | Ya | `bukti/U05-rate-limit.png` |
| **U06** | *Security Testing* (Injeksi XSS) | Input: `<script>alert(localStorage.getItem('kk_api_key'))</script>` → Klik Analisis. | Teks harus lolos dari mesin DOM browser tanpa tereksekusi. Fungsi `sanitizeCode` mengubah kurung sudut menjadi entitas HTML (`&lt;script&gt;`). | Muatan XSS disanitasi menjadi string literal murni sebelum dikirim ke DOM dan API. Kredensial aman. | Ya | `bukti/U06-xss-security.png` |
| **U07** | *Failover Architecture* (API Timeout) | Simulasikan koneksi lambat/putus atau matikan API Gemini dari pengaturan, lalu eksekusi kode. | Modul `AppContext` menangkap HTTP 401/503/FetchError, lalu memanggil fungsi cadangan ke API Groq secara transparan tanpa mematikan layar aplikasi. | Layar memunculkan *Toast* "Beralih ke provider Groq", dan hasil analisis tetap muncul setelah jeda 2 detik. | Ya | `bukti/U07-failover-api.png` |
| **U08** | *Data Integrity* (RFC 4180 CSV Export) | Ekspor riwayat berisi kode `print("Halo, dunia")` ke CSV. Ubah nilai di Excel, lalu impor kembali. | Parser `parseCSVRow` mendeteksi *state* `inQuotes`. Koma di dalam kode tidak memotong kolom. Impor data cacat (kurang dari 5 kolom) akan dilewati dengan aman. | CSV terbuka sejajar di Excel. Impor kembali berhasil dengan pengabaian baris korup (Zero-Crash). | Ya | `bukti/U08-csv-integrity.png` |

**Pemenuhan Syarat Wajib Juri:**
- [x] Minimal satu kasus dengan **input yang salah** (kosong, narasi non-kode, XSS) → Terpenuhi komprehensif pada U02, U03, dan U06.
- [x] Minimal satu kasus **di batas aturan (Boundary)** → Terpenuhi mutlak pada U04 (Skor maksimal 100) dan U05 (Uji pembatasan titik puncak tepat di angka 20/jam).

---

## Unit Test Otomatis (Test-Driven Development)
Sebagai bukti kualitas rekayasa (*Vibe Engineering*), tim tidak hanya mengandalkan pengujian manual. Kami menerapkan pengujian otomatis untuk memvalidasi kemurnian fungsi *utility* menggunakan *test runner* bawaan Node.js (`node --test`).

* **Target Pengujian (Test Suites):**
  1. `api.test.ts`: Menguji ketangguhan `extractJSON()` dalam membersihkan tag `<think>`, label ````json`, dan narasi liar dari LLM.
  2. `csv.test.ts`: Menguji fungsionalitas *state-machine* pada `parseCSVRow()` saat menemui *nested quotes* dan koma internal.
  3. `crypto.test.ts`: Menguji integritas AES-GCM *encryption/decryption* *roundtrip*.
* **Hasil Eksekusi:** `12 passing, 0 failing` (Lulus 100%).
* **Gatekeeper Lanjutan:** Perintah kompilasi produksi `npm run build` dikunci dengan prasyarat `npm run lint` (menggunakan eksekusi paralel `oxlint` dan `tsc -b`) untuk menjamin tidak ada tipe data *TypeScript* yang bocor.