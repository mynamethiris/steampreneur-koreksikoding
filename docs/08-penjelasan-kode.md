# Penjelasan Kode

Tidak ada sesi presentasi, jadi dokumen ini adalah bukti utama bahwa tim memahami kode yang dihasilkan AI.

Aturan:
- Setiap anggota menjelaskan **minimal dua bagian kode yang berbeda**. Bagian yang dijelaskan tidak boleh sama dengan anggota lain.
- Tulis dengan bahasa sendiri. Boleh bertanya ke AI untuk memahami, tetapi jangan menyalin jawabannya.
- Sebut nama file dan fungsi yang nyata, serta contoh nilai yang nyata.
- Jika memungkinkan, setiap anggota meng-commit bagiannya sendiri dari akun GitHub masing-masing.

---

## Bagian A: Penjelasan per anggota

### Penjelasan 1
- **Ditulis oleh:** Favian
- **File dan fungsi:** `src/lib/api.ts`, fungsi `detectLanguageFromContent`
- **Apa yang dilakukan:** 
Fungsi ini merupakan sistem deteksi bahasa berbasis heuristik (*heuristic fallback*). Pertama, menguji string dengan `JSON.parse`. Jika gagal, ia melakukan pemindaian regex berjenjang: XML, YAML, HTML, CSS, SQL, dan bahasa pemrograman terstruktur (C, Go, Python, Java, PHP, TypeScript), hingga fallback terakhir ke JavaScript.
- **Kenapa dibuat seperti ini:** 
Saat pengguna menempelkan (*paste*) kode mentah tanpa nama file (ekstensi tidak diketahui), sistem butuh kepastian bahasa untuk *syntax highlighting* CodeMirror dan konteks prompt AI. Pemindaian diurutkan dari format data paling kaku (JSON/XML) ke bahasa dinamis agar akurasi deteksi maksimal.
- **Contoh:** 
Jika input `{"status": 200}`, *return value* adalah `json`. Jika input `def hitung_gaji(jam):`, *return value* adalah `python`.
- **Jika input salah atau kosong:** 
Untuk mencegah *false-positive* pada kode yang sangat pendek (misal `x = 10`), saya menambahkan *threshold* penjagaan. Jika panjang string < 30 karakter dan tidak ada regex kuat yang cocok, nilai akan dipaksa (*clamp*) menjadi `javascript`.

### Penjelasan 2
- **Ditulis oleh:** Favian
- **File dan fungsi:** `src/lib/crypto.ts`, fungsi `encryptApiKey` dan `decryptApiKey`
- **Apa yang dilakukan:** 
Modul ini menangani kriptografi asimetris sisi klien (*Client-side Cryptography*) menggunakan Web Crypto API. Kunci diturunkan menggunakan algoritma PBKDF2 (100.000 iterasi) dari sebuah *salt* (`koreksikoding-v1`). Proses enkripsi data API Key dieksekusi menggunakan standar militer AES-GCM, dan hasil akhirnya disisipkan *header* identifikasi `enc:v1:`.
- **Kenapa dibuat seperti ini:** 
Menyimpan API Key dalam bentuk *plaintext* di `localStorage` sangat rentan terhadap serangan XSS (*Cross-Site Scripting*). Dengan AES-GCM, meskipun penyerang bisa membaca `localStorage`, mereka hanya akan melihat teks acak tak bermakna (Ciphertext).
- **Contoh:** 
Input `gsk_12345ABCD` (Groq API Key) akan dienkripsi menjadi *ciphertext* seperti `enc:v1:aB3x9...`. Saat akan digunakan untuk panggilan API, fungsi `decryptApiKey` membongkar teks acak tersebut kembali menjadi `gsk_12345ABCD`.
- **Jika input salah atau kosong:** 
Jika fungsi `decryptApiKey` menerima string yang tidak diawali `enc:v1:`, sistem membiarkannya (mengasumsikan itu adalah key format lama yang belum dienkripsi). Jika proses dekripsi gagal, sistem menolak menghapus nilai aslinya untuk mencegah kehilangan key tak terduga.

### Penjelasan 3
- **Ditulis oleh:** Andante
- **File dan fungsi:** `src/pages/RiwayatPage.tsx`, fungsi `handleExportCSV` dan `parseCSVRow`, serta `exportToCSV` di `src/lib/api.ts`
- **Apa yang dilakukan:** 
Fungsi ini membangkitkan dan membedah format file CSV berstandar RFC 4180. `exportToCSV` memastikan setiap nilai kolom dibungkus tanda kutip ganda (`"..."`), dan kutip ganda internal di-*escape* menjadi ganda (`""`). Sebaliknya, `parseCSVRow` membaca baris CSV menggunakan mekanisme *Finite State Machine* (FSM) yang melacak state `inQuotes`.
- **Kenapa dibuat seperti ini:** 
Fungsi bawaan `string.split(',')` akan merusak data jika kode pemrograman yang disimpan memiliki koma bawaan (contoh: `console.log(a, b)`). Implementasi *state-machine* ini menjamin koma di dalam string kode diabaikan saat pemotongan kolom.
- **Contoh:** 
Input teks kode `print("Halo, Dunia!")` akan diekspor menjadi `"print(""Halo, Dunia!"")"`. Saat diimpor, `parseCSVRow` mendeteksi kutip ganda berurutan dan mengembalikannya ke bentuk asal.
- **Jika input salah atau kosong:** 
Jika file yang diimpor bukan format `.csv` atau `.json`, sistem memblokirnya. Jika baris CSV yang dibaca berjumlah kurang dari 5 kolom (korup), fungsi *parser* dengan aman melewati (`continue`) baris tersebut tanpa memicu *crash* pada aplikasi.

### Penjelasan 4
- **Ditulis oleh:** Andante
- **File dan fungsi:** `src/components/AnalysisPanel.tsx`, bagian integrasi tab Hasil, Perbaikan, Penjelasan, Konsep, Vulnerability, Duplikasi
- **Apa yang dilakukan:** 
Komponen presentasional ini bertugas me-render payload JSON dari AI ke dalam metrik visual (*StatCard*) dan daftar item interaktif. Fitur utamanya adalah injeksi *CustomEvent DOM*. Saat item error di panel diklik, fungsi akan memancarkan *event* `korek:scrollToLine` yang ditangkap oleh CodeMirror untuk melakukan *auto-scroll* dan *highlight* ke baris kode yang rusak.
- **Kenapa dibuat seperti ini:** 
Pemisahan ke dalam 5 Tab dilakukan untuk mencegah *Cognitive Overload* pada siswa. Komunikasi berbasis *CustomEvent* dipilih agar Panel dan Editor (CodeMirror) tetap terisolasi (*decoupled*) dan tidak memicu perenderan ulang (*re-render*) komponen global yang berat.
- **Contoh:** 
Jika AI memberikan JSON dengan `line: 12`, menekan item tersebut akan memicu eksekusi `window.dispatchEvent(new CustomEvent('korek:scrollToLine', { detail: { line: 12 } }))`.
- **Jika input salah atau kosong:** 
Komponen dibungkus dengan *Conditional Rendering*. Jika data JSON kosong/belum ada, komponen otomatis me-render *Empty State*. Jika terjadi *error runtime* pada satu tab, modul *ErrorBoundary* memastikan tab lain tetap bisa diakses tanpa aplikasi mengalami layar putih (Blank Screen).

### Penjelasan 5
- **Ditulis oleh:** Bastian
- **File dan fungsi:** `src/lib/api.ts`, fungsi `analyzeCode`, `extractJSON`, dan `sanitizeFixedCode`
- **Apa yang dilakukan:** 
`analyzeCode` adalah lapisan transporter API (menangani header *Bearer* Groq atau parameter URL Gemini). `extractJSON` adalah modul *Robust Parser* yang membersihkan string kotor dari tag model reasoning (contoh: `<think>`), lalu mencari blok objek `{...}` menggunakan algoritma pencari kurung berlapis (*depth-counting bracket matcher*).
- **Kenapa dibuat seperti ini:** 
Model LLM terkadang berhalusinasi menyisipkan narasi di luar instruksi JSON murni. Memanggil `JSON.parse` pada string kotor akan memicu pengecualian fatal (*fatal exception*). Algoritma *bracket matcher* memastikan kita hanya mengambil inti objek secara absolut. Suhu model (*temperature*) dikunci di 0.1 agar jawaban AI lebih matematis dan deterministik.
- **Contoh:** 
Jika LLM menjawab `<think>Aha!</think> \`\`\`json { "score": 90 } \`\`\``, fungsi `extractJSON` akan mengupas seluruh gangguan tersebut dan hanya mengembalikan `{ "score": 90 }` untuk dieksekusi.
- **Jika input salah atau kosong:** 
Jika tidak ada satupun pola `{...}` yang valid ditemukan (halusinasi AI ekstrem), sistem melempar error *custom* yang ditangkap UI sebagai *Toast Notification* "Gagal menganalisis format AI". Jika properti `fixedCode` dari AI kosong, fungsi meminjam kode sumber asli agar aplikasi tidak macet.

### Penjelasan 6
- **Ditulis oleh:** Bastian
- **File dan fungsi:** 
`src/store/AppContext.tsx`, fungsi `runAnalysis` dan utilitas pelindung di `src/lib/api.ts` (`canAnalyze`, `sanitizeCode`)
- **Apa yang dilakukan:** 
`runAnalysis` adalah Orkestrator Utama (*Main Orchestrator*). Ia mengeksekusi pemeriksaan *Pre-flight* (Cek file kosong $\rightarrow$ Cek API Key $\rightarrow$ Verifikasi batas kuota 20/jam di `kk_rate_limit`). Jika lolos, kode disanitasi dari elemen XSS, dipotong maksimal 50.000 karakter, lalu dikirim. Jika menerima status kegagalan jaringan (401, 403, 503, 429), ia otomatis beralih ke provider cadangan (Fallback Mechanism).
- **Kenapa dibuat seperti ini:** 
Pendekatan *Fail-Safe Architecture*. Pengecekan sebelum pemanggilan (Pre-flight) mencegah pembakaran kuota API secara sia-sia. Pemotongan string (50.000 char) mencegah *Payload Too Large* (HTTP 413), dan fungsi *Fallback* memastikan pengguna tidak terhenti belajarnya hanya karena server Gemini atau Groq sedang *down*.
- **Contoh:** 
Pengguna memasukkan 60.000 karakter kode. `sanitizeCode` memangkasnya menjadi 50.000. Jika server Gemini membalas 503 (Service Unavailable), blok `catch` pada Orkestrator akan membaca ketersediaan API Groq dan secara otomatis melakukan *re-fetch* data transparan di latar belakang.
- **Jika input salah atau kosong:** 
Jika editor kosong, eksekusi dihentikan di lapis pertama tanpa memotong kuota harian. Jika seluruh penyedia layanan API mengalami kegagalan, pesan error orisinal diteruskan ke UI, namun data `EditorState` pengguna tetap diselamatkan.

---

## Bagian B: Pertanyaan yang dijawab bersama

1. **Jika aturan bisnis utama di spesifikasi berubah (tuliskan contoh perubahannya), file dan fungsi mana yang harus diubah? Jelaskan alasannya.**
   *Contoh perubahan:* Penyesuaian rumus skor kualitas menjadi `100 - (error*15 + warning*3 + saran*1)` dan batas limit analisis dinaikkan menjadi 50 kali/jam.
   *File yang diubah:* 
   (a) `src/lib/prompts.ts` (pada `ANALYSIS_PROMPT_ID` dan `EN`), agar instruksi sistem (*System Prompt*) ke AI menghitung matematis dengan bobot baru. 
   (b) `src/store/AppContext.tsx` (di dalam `buildAnalysisResult`), untuk penyesuaian normalisasi *clamp* batas bawah skor. 
   (c) `src/lib/api.ts` (mengubah variabel konstanta `ANALYSIS_LIMIT = 50`), yang meradiasikan perubahan ke fungsi penjaga `canAnalyze` dan `getRateLimitRemaining`.
   *Alasan:* Aplikasi kami menerapkan prinsip *Separation of Concerns (SoC)*. Aturan logika berada di *Prompt Layer*, perhitungan UI di *State Layer*, dan batas kuota berada di *Utility/Validation Layer*. Pemisahan ini mencegah perubahan satu fitur merusak fitur lainnya.

2. **Bagaimana data mengalir dari saat pengguna mengisi form sampai hasilnya tampil di layar? Sebutkan file dan fungsi yang dilewati secara berurutan.**
   *Fase 1 (Input):* Pengguna mengetik di `CodeEditor.tsx`, fungsi `updateFileContent` di `AppContext.tsx` menyinkronkan data ke `localStorage`. 
   *Fase 2 (Trigger):* Pengguna mengeksekusi via `EditorPage.tsx` (Klik atau `Ctrl+Enter`), memanggil orkestrator `runAnalysis`.
   *Fase 3 (Pre-flight):* `runAnalysis` memverifikasi kunci, kuota (`canAnalyze`), dan membersihkan injeksi XSS (`sanitizeCode` di `api.ts`).
   *Fase 4 (Transport):* `analyzeCode` merakit JSON Prompt dari `prompts.ts` dan memanggil Rest API Gemini/Groq.
   *Fase 5 (Parsing):* Jawaban dikembalikan, lalu `parseAnalysisResponse`, `extractJSON`, dan `sanitizeFixedCode` mengekstraksi JSON kotor menjadi objek terstruktur.
   *Fase 6 (State & Persistence):* Objek JSON dinormalisasi via `buildAnalysisResult`, status kuota diperbarui (`recordAnalysis`), dan arsip disimpan permanen ke IndexedDB (`db.addHistory`).
   *Fase 7 (Render UI):* State global diperbarui melalui `setAnalysisResult`, memicu re-render pada `AnalysisPanel.tsx` untuk menampilkan visualisasi metrik dan Tab Socratic.

3. **Pilih satu unit test. Apa yang diuji, dan dalam kondisi apa test itu akan gagal?**
   *Kasus Uji:* Uji batas validasi Input Non-Kode (*Edge Case Testing*).
   *Skenario:* Menginputkan teks kasual: `"Halo mas AI, tolong buatkan saya kopi"`. Output yang diharapkan: Skor wajib 0, daftar error kosong, dan `fixedCode` menampilkan teks mitigasi: `"Input tidak valid: ini bukan kode pemrograman yang dikenali."`
   *Kondisi Gagal:* Test ini akan gagal (merah) jika: (a) *System Prompt* gagal mengunci instruksi sehingga AI malah berhalusinasi mencoba mengartikan kalimat tersebut sebagai error Python (`NameError: Halo is not defined`); (b) Algoritma pendeteksi bahasa otomatis salah menebaknya; atau (c) *Robust Parser* `extractJSON` gagal menangkap output JSON AI yang melenceng formatnya.

4. **Pilih satu saran AI yang kalian tolak. Apa sarannya dan kenapa kalian menolaknya?**
   *Saran AI:* Memindahkan pemanggilan API LLM ke *backend server proxy* (Node.js) dan menyimpan data riwayat di server database terpusat (PostgreSQL/MongoDB).
   *Alasan Penolakan:* Kami **MENOLAK TOTAL** usulan ini karena mencederai visi inti arsitektur *Zero-Data Retention* dan *Bring Your Own Key (BYOK)* kami. Pendekatan server terpusat akan memakan biaya infrastruktur bulanan yang membebani sekolah, serta memicu risiko kebocoran privasi kode. Sebagai gantinya, kami berinvestasi kuat pada sisi peramban klien (*Client-Side Engineering*) dengan mengimplementasikan Kriptografi AES-GCM untuk API Key, proteksi XSS mandiri, dan IndexedDB.

5. **Bagian kode mana yang paling sulit dipahami, dan bagaimana kalian akhirnya memahaminya?**
   Bagian paling menantang secara teknis adalah algoritma `extractJSON` (sistem *bracket matcher*) dan *asynchronous Web Crypto* di `decryptApiKey`. 
   Padaawalnya, kami percaya bahwa `JSON.parse` sudah cukup. Namun saat AI model penalaran (*reasoning models*) mulai mengeluarkan tag `<think>`, aplikasi terus *crash*. Untuk mengatasinya, kami mencetak respons *raw* ke konsol, mengambil pena dan kertas, lalu memetakan pohon logika (*Logic Tree*) untuk merancang State-Machine (Kapan karakter '{' harus memicu kedalaman tingkat 1, dan kapan ia harus diabaikan karena berada di dalam *string literal* tanda kutip). Untuk kriptografi, kami mengatasi kebingungan pengembalian data asinkron (*Promise Pending*) dengan mempelajari dokumentasi resmi `window.crypto.subtle` dan merekayasa teknik pemanggilan `await` yang *thread-safe* di React.