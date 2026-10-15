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
- **Apa yang dilakukan:** Fungsi ini menebak bahasa kode dari isinya. Cara ceknya urut dari yang paling mudah dikenali. Pertama coba baca sebagai JSON. Kalau gagal, cek pola XML, lalu YAML, lalu HTML, lalu CSS, lalu SQL, lalu C, Go, Python, Java, PHP, TypeScript, dan terakhir JavaScript.
- **Kenapa dibuat seperti ini:** File baru bernama `untitled` tanpa akhiran. Pengguna sering tempel kode tanpa nama file. Jadi tebakan dari isi sangat membantu. Yang spesifik dicek dulu supaya tidak salah tebak.
- **Contoh:** jika inputnya `{"a": 1}`, hasilnya `json` karena bisa dibaca sebagai JSON. Jika inputnya `def tambah(a,b):`, hasilnya `python` karena cocok dengan pola kata `def`.
- **Jika input salah atau kosong:** jika kode kurang dari 30 huruf, langsung jawab `javascript`. Contoh `x=1` terlalu pendek dan bisa salah dibaca. Jika tidak ada pola yang cocok, jawab `javascript` juga.

### Penjelasan 2
- **Ditulis oleh:** Favian
- **File dan fungsi:** `src/lib/crypto.ts`, fungsi `encryptApiKey` dan `decryptApiKey`
- **Apa yang dilakukan:** Fungsi ini mengunci API key sebelum disimpan di browser. Kunci dibuat dari kata dasar plus garam `koreksikoding-v1` dengan cara PBKDF2 100 ribu putaran. Lalu kunci dipakai untuk enkripsi AES-GCM. Hasil simpan diawali `enc:v1:`.
- **Kenapa dibuat seperti ini:** Supaya orang yang buka localStorage tidak bisa langsung baca key. Tanpa kunci ini, key polos bisa dicuri orang.
- **Contoh:** jika inputnya `AIza123`, hasilnya `enc:v1:...` yaitu teks acak yang panjang. Saat dibaca lagi, `decryptApiKey` mengubah teks acak itu kembali jadi `AIza123`.
- **Jika input salah atau kosong:** jika input kosong, jawab kosong. Jika teks tidak diawali `enc:v1:`, dianggap belum dikunci dan dikembalikan apa adanya. Jika gagal buka kunci, key lama tidak dibuang.

### Penjelasan 3
- **Ditulis oleh:** Akmal
- **File dan fungsi:** `src/pages/RiwayatPage.tsx`, fungsi `handleExportCSV` dan `parseCSVRow`, plus `exportToCSV` di `src/lib/api.ts`
- **Apa yang dilakukan:** Fungsi ini mengubah daftar riwayat jadi file CSV dan bisa dibaca lagi. Saat ekspor, header analisis adalah `Tanggal, Skor, Error, Warning, Saran`. Setiap nilai dibungkus tanda kutip. Tanda kutip di dalam nilai digandakan jadi `""`. Saat impor, `parseCSVRow` membaca baris dengan ingat status di dalam kutip atau tidak.
- **Kenapa dibuat seperti ini:** Potong koma biasa dengan `split` akan rusak kalau isi kode ada koma. Dengan bungkus kutip, file tetap rapi dan bisa dibuka di Excel.
- **Contoh:** jika inputnya nilai `90`, hasilnya `"90"` di file CSV. Jika inputnya `dia bilang "halo", lalu pergi`, hasilnya `"dia bilang ""halo"", lalu pergi"`.
- **Jika input salah atau kosong:** jika baris kurang dari 5 kolom, baris itu dilewati. Jika file bukan `.json` atau `.csv`, tampil error jenis tidak didukung. Jika hasil baca kosong, tampil error data kosong.

### Penjelasan 4
- **Ditulis oleh:** Akmal
- **File dan fungsi:** `src/components/AnalysisPanel.tsx`, bagian tab Hasil, Perbaikan, Penjelasan, Konsep, Vulnerability, Duplikasi
- **Apa yang dilakukan:** Bagian ini menampilkan hasil analisis ke layar. Ada kartu angka untuk jumlah error, warning, saran, dan skor 0 sampai 100. Ada daftar error per baris. Jika baris diklik, editor lompat ke baris itu. Ada tombol salin dan unduh untuk kode perbaikan.
- **Kenapa dibuat seperti ini:** Supaya pengguna cepat paham salahnya di mana dan langsung dapat kode benar. Satu layar dibagi tab agar tidak penuh.
- **Contoh:** jika inputnya hasil dengan 1 error dan skor 90, hasilnya layar tampil kartu Error 1 dan Skor 90. Jika tombol salin ditekan, kode perbaikan masuk ke clipboard.
- **Jika input salah atau kosong:** jika belum ada hasil, tampil pesan kosong dan ajakan untuk analisis dulu. Jika satu tab error, tab lain tetap tampil karena ada penangkap error per tab.

### Penjelasan 5
- **Ditulis oleh:** Bastian
- **File dan fungsi:** `src/lib/api.ts`, fungsi `analyzeCode`, `extractJSON`, dan `sanitizeFixedCode`
- **Apa yang dilakukan:** `analyzeCode` mengirim kode ke AI. Untuk Gemini dikirim dengan kunci di URL. Untuk Groq dan custom dikirim dengan header Bearer. AI diminta jawab JSON saja. Jawaban kotor dibersihkan dulu dari tag pikir `<think>` dan pagar kode. Lalu `extractJSON` mencari bagian `{...}` yang valid. `sanitizeFixedCode` membersihkan pagar dan label bahasa di kode perbaikan.
- **Kenapa dibuat seperti ini:** Model reasoning sering tambah teks di luar JSON. Tanpa pembersih ini, baca JSON gagal dan analisis gagal total. Suhu `temperature` diset 0.1 supaya jawaban stabil.
- **Contoh:** jika inputnya jawaban mentah berisi `<think>ok</think>` plus pagar json plus skor 90, hasilnya objek bersih dengan `score` 90 dan `fixedCode` tanpa pagar dan tanpa kata `python` di baris pertama.
- **Jika input salah atau kosong:** jika tidak ketemu `{...}` yang valid, keluar error tidak ada JSON valid. Error ini ditangkap dan tampil sebagai toast gagal analisis. Jika `fixedCode` kosong, dipakai kode asli sebagai ganti.

### Penjelasan 6
- **Ditulis oleh:** Bastian
- **File dan fungsi:** `src/store/AppContext.tsx`, fungsi `runAnalysis`, plus `canAnalyze`, `recordAnalysis`, `sanitizeCode` di `src/lib/api.ts`
- **Apa yang dilakukan:** `runAnalysis` adalah tombol utama analisis. Urutannya: cek file kosong, cek key, cek daftar model, cek batas 20 kali per jam. Lalu bersihkan kode dari tag jahat dan potong 50000 huruf. Lalu kirim ke AI, rapikan hasil, catat pemakaian, simpan ke IndexedDB. Jika error 401, 403, 503 atau model sibuk, coba satu kali ke provider lain.
- **Kenapa dibuat seperti ini:** Supaya kuota tidak habis sia sia, privasi aman tanpa server, dan satu model gagal tidak buat pengguna gagal total.
- **Contoh:** jika inputnya kode 60000 huruf, hasilnya yang dikirim hanya 50000 huruf pertama. Jika Gemini sibuk 503 dan Groq ada key, hasilnya otomatis pindah ke Groq dan tampil toast pindah provider.
- **Jika input salah atau kosong:** jika file kosong, tampil toast tidak ada kode dan tidak potong kuota. Jika semua key kosong, tampil notifikasi isi key. Jika gagal simpan riwayat, hasil tetap tampil di layar.

---

## Bagian B: Pertanyaan yang dijawab bersama

1. Jika aturan bisnis utama di spesifikasi berubah (tuliskan contoh perubahannya), file dan fungsi mana yang harus diubah? Jelaskan alasannya.
   Contoh perubahan: rumus skor jadi `100 - (error x 15 + warning x 3 + saran x 1)` dan batas naik ke 50 kali per jam.
   Yang diubah: (a) `src/lib/prompts.ts` di `ANALYSIS_PROMPT_ID` dan `EN` supaya AI hitung dengan bobot baru. (b) `src/store/AppContext.tsx` di `buildAnalysisResult` jika batas atas bawah skor berubah. (c) `src/lib/api.ts` di nilai `ANALYSIS_LIMIT` dari 20 ke 50 yang dipakai `canAnalyze`, `recordAnalysis`, dan `getRateLimitRemaining`. (d) Dokumen spesifikasi, dokumen uji, dan teks bahasa di `src/locales/id.json` dan `en.json`. Alasan: aturan ada di tiga tempat yaitu perintah ke AI, kode penjaga di browser, dan dokumen janji ke penguji.

2. Bagaimana data mengalir dari saat pengguna mengisi form sampai hasilnya tampil di layar? Sebutkan file dan fungsi yang dilewati secara berurutan.
   Langkah 1: pengguna ketik di `CodeEditor.tsx`, lalu `updateFileContent` di `AppContext.tsx` simpan ke `kk_koreksi_editor_state`. Langkah 2: pengguna tekan Analisis atau Ctrl Enter di `EditorPage.tsx`, lalu `runAnalysis` jalan. Langkah 3: `runAnalysis` cek key, cek `canAnalyze`, lalu `sanitizeCode` di `api.ts`. Langkah 4: `analyzeCode` di `api.ts` ambil perintah dari `prompts.ts` lalu panggil Gemini atau Groq. Langkah 5: `parseAnalysisResponse`, `extractJSON`, dan `sanitizeFixedCode` rapikan jawaban. Langkah 6: `buildAnalysisResult` dan `normalizeIssues` buat hasil akhir. Langkah 7: `setAnalysisResult` tampilkan, `recordAnalysis` catat kuota, `db.addHistory` di `db.ts` simpan ke IndexedDB. Langkah 8: `AnalysisPanel.tsx` baca hasil lewat `useApp` dan tampilkan tab.

3. Pilih satu unit test. Apa yang diuji, dan dalam kondisi apa test itu akan gagal?
   Pilih uji input bukan kode. Inputnya `halo apa kabar aku lapar`. Harusnya skor 0 dan `fixedCode` tulis Input tidak valid. Test gagal jika: (a) perintah validasi dihapus sehingga AI karang error palsu. (b) `extractJSON` gagal baca sehingga muncul toast error teknis bukan hasil valid. (c) bahasa salah tebak sehingga pesan bukan kode javascript tidak sesuai harapan.

4. Pilih satu saran AI yang kalian tolak. Apa sarannya dan kenapa kalian menolaknya?
   Saran: pindahkan panggilan AI ke server proxy dan simpan riwayat di server. Kami tolak karena janji privasi kami adalah tanpa server dan kode tidak disimpan di server. Pindah ke server tambah biaya dan tambah kerja rawat server. Sebagai ganti kami kuatkan browser: kunci AES-GCM, batas lokal, dan bersih XSS.

5. Bagian kode mana yang paling sulit dipahami, dan bagaimana kalian akhirnya memahaminya?
   Yang paling sulit adalah `extractJSON` yaitu pencari `{...}` dengan hitung buka tutup plus ingat status di dalam string, dan `decryptApiKey` yang async. Awalnya kami kira `JSON.parse` biasa cukup. Setelah gagal untuk output reasoning, kami cetak jawaban mentah ke console, gambar alur di kertas kapan `{` di dalam string harus diabaikan, lalu uji dengan 5 contoh liar yaitu blok think, pagar ganda, JSON ganda, dan label bahasa. Untuk kripto, kami baca panduan `SubtleCrypto` lalu coba pindah key lama ke baru sampai tidak ada key hilang.
