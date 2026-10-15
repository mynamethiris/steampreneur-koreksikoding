# Refleksi Tim (Post-Mortem & Metacognitive Analysis)

1. **Apa yang berjalan baik dalam cara kami bekerja dengan AI?**
   Penerapan paradigma *Vibe Engineering* berjalan sangat optimal. Kami memposisikan diri secara tegas sebagai *Navigator* (Pengendali Arsitektur) dan AI sebagai *Driver* (Pekerja Kode). Pembagian peran (Favian di UI/UX, Andante di AI/Security, Bastian di State/Testing) memungkinkan kami melakukan tinjauan sejawat (*Peer Review*) silang terhadap kode AI. Kebijakan "Zero-Merge without Linting" (`tsc` & `oxlint`) berhasil menjaga repositori tetap stabil. Seluruh jejak intervensi kami terhadap kode AI terdokumentasi rapi di log prompt, menjadikan alur pengembangan ini sangat transparan dan terkendali.

2. **Kapan AI paling membantu? Kapan AI justru menyulitkan?**
   **Paling membantu:** Saat menangani tugas-tugas *Generative Boilerplate* bervolume tinggi, seperti memetakan konfigurasi 22 ekstensi CodeMirror, menyusun skema dasar JSON, dan merangkai struktur *routing* React.
   **Paling menyulitkan:** Saat AI mengalami *Architectural Hallucination* (terlalu percaya diri). AI sering mencoba merombak arsitektur dengan menyelundupkan tag `<think>` pada output JSON, melakukan konversi bahasa pemrograman secara diam-diam di variabel `fixedCode`, dan memaksa kami beralih ke arsitektur *Backend* yang jelas-jelas bertentangan dengan kebutuhan privasi klien. Hal ini memaksa kami mengalokasikan banyak waktu ekstra untuk verifikasi manual dan *Prompt Hardening*.

3. **Kesalahan terbesar yang hampir lolos, dan bagaimana kami menemukannya?**
   **Kegagalan Ekstraksi JSON (Parsing Catastrophe):** Pada awalnya, kami menyerahkan ekstraksi data sepenuhnya pada `JSON.parse()` standar. Bug ini hampir lolos karena saat pengujian awal kami hanya menggunakan provider Gemini (yang outputnya sangat rapi). Kesalahan fatal ini baru terdeteksi saat kami melakukan *Failover Testing* menggunakan provider Groq (*reasoning model*). Respon Groq berisi teks naratif ekstensif yang memicu *crash* total pada aplikasi. Perbaikan arsitekturalnya (membangun *Depth-Counting Bracket Matcher*) kami dokumentasikan lengkap di `05-kesalahan-ai.md` (No. 1).

4. **Apa yang akan kami lakukan berbeda jika mengulang challenge ini?**
   Kami akan menerapkan pendekatan **Test-Driven Development (TDD)** sejak Hari Pertama. Daripada langsung menyuruh AI membuat kode, kami seharusnya menyusun *Unit Test* (untuk parser JSON `extractJSON`, pembersih kode `sanitizeFixedCode`, dan generator CSV `exportToCSV`) terlebih dahulu. Kami juga akan menyiapkan 22 *snippet* data *dummy* untuk menguji akurasi detektor bahasa secara otomatis. Pendekatan *Test-First* ini secara realistis akan memangkas 2-3 jam waktu berharga yang sebelumnya terbuang untuk *debugging* antarmuka manual.

5. **Bagaimana kami mengatur waktu? Langkah mana yang jauh lebih lama dari estimasi, dan kenapa?**
   Kami menerapkan konsep *Agile Timeboxing* (30-60 menit per siklus/milestone). 
   **Deviasi Waktu (Over-time):** Langkah 4 (Parser AI) meleset dari estimasi 60 menit menjadi 80 menit karena kami harus menghadapi anomali tiga format AI yang tidak terduga (*think block*, *markdown fence*, *language label*). Langkah 8 (Halaman Pendukung) molor dari 120 ke 150 menit karena implementasi i18n (ID/EN) menuntut pelacakan variabel *string* ganda yang sangat teliti. 
   **Kompensasi Waktu:** Kami menghemat banyak waktu di Langkah 9 (Responsivitas) yang selesai hanya dalam 40 menit karena kami sudah menerapkan fondasi arsitektur *Tailwind CSS* dan utilitas *Split-Pane* sejak awal.

6. **Bagian mana dari kode yang masih belum kami pahami sepenuhnya? (Jawab dengan jujur.)**
   Ada dua area spesifik di mana kami mengandalkan "Implementasi Kotak Hitam" (*Black-Box Implementation*):
   **Pertama**, detail matematis di balik Kriptografi Web (`src/lib/crypto.ts`). Meskipun kami berhasil menerapkan turunan kunci *PBKDF2* (100.000 iterasi) ke enkripsi *AES-GCM*, kami tidak memahami sepenuhnya mekanisme fisika/matematika dari manipulasi bit *Initialization Vector (IV)*. Kami menggunakannya sesuai standar industri keamanan siber murni tanpa memodifikasinya karena itu di luar kapasitas teoritis kami saat ini.
   **Kedua**, perilaku *Edge-Cases* pada fungsi `fetchAvailableModels()` untuk *endpoint* pihak ketiga (Custom Provider). Kami belum sepenuhnya mengerti bagaimana mem-parsing dinamis semua varian struktur API di dunia, sehingga kami mengambil jalan pintas dengan hanya menangkap dua pola konvensi umum (`/models` atau `/chat/completions`), dan melempar nilai *fallback* kosong untuk anomali lainnya.