# Catatan Code Review

Minta AI me-review kode kalian, lalu putuskan saran mana yang diterima.
Menolak saran AI dengan alasan yang jelas adalah hal yang baik.

**Prompt review yang dipakai:**
"Review kode KoreksiKoding di src/lib/api.ts, src/store/AppContext.tsx, src/pages/RiwayatPage.tsx, src/lib/crypto.ts. Fokus: keamanan API key, ketahanan parsing JSON AI, kebocoran memori/efek samping, dan UX mobile. Beri saran konkret per file dan fungsi."

| No | Saran dari AI | Diterima / ditolak | Alasan | Bagian kode yang berubah |
|---|---|---|---|---|
| 1 | Jangan simpan API key plain; gunakan enkripsi + jangan log key ke console | Diterima | Wajib privasi; sempat ada `console.log(provider)` saat debug | `src/lib/crypto.ts`: `encryptApiKey/decryptApiKey` AES-GCM; `src/lib/api.ts` `getProviders/saveProviders`; hapus semua log key. |
| 2 | `JSON.parse` langsung akan crash untuk output reasoning; buat pemindai JSON toleran | Diterima | Terbukti crash di U01 untuk model Groq | `src/lib/api.ts`: `extractJSON()` + `stripThinkingBlocks()` + `parseAnalysisResponse()` + `sanitizeFixedCode()`. |
| 3 | Tambah `ErrorBoundary` + `beforeunload` flush agar state editor tidak hilang saat reload | Diterima | Kehilangan kode saat reload adalah keluhan penguji | `src/components/ErrorBoundary.tsx` dipakai di `App.tsx`; `AppContext.tsx` tambah listener `beforeunload` untuk flush `kk_koreksi_editor_state`. |
| 4 | Validasi model kosong sebelum analisis agar tidak buang kuota rate limit | Diterima | Menghemat 1 kuota/jam yang berharga | `runAnalysis()` di `AppContext.tsx`: cek `availableModels` kosong → tolak dengan toast `settings.validationRequired`. |
| 5 | Pindahkan semua panggilan AI ke backend proxy agar key aman + rate limit server-side | Ditolak | Melanggar spesifikasi "tanpa backend, kode tidak pernah disimpan di server" dan menambah biaya hosting; rate limit lokal + enkripsi klien sudah cukup untuk challenge ini | Tidak ada perubahan. Didokumentasikan di `01-spesifikasi.md` bagian Di luar cakupan. |
| 6 | Ganti IndexedDB (`idb`) dengan hanya localStorage agar kode lebih sederhana | Ditolak | Riwayat bisa besar (kode + hasil JSON); localStorage limit ~5MB dan synchronous → bikin UI jank. IndexedDB async + indeks `timestamp`/`challengeId` memang dibutuhkan untuk search/filter cepat | Tetap `src/lib/db.ts` dengan `idb` v2, store `history` dan `challenges`. |

Penjelasan kode ditulis terpisah di `08-penjelasan-kode.md`.
