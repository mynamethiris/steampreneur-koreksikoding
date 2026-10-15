# Catatan Bug Hunt: Kasir Kantin STEAM

**Nama tim: KoreksiKoding**

## Bug 1
* **Gejala** (apa yang terlihat salah): Ketika produk yang sama ditambahkan kembali ke keranjang, jumlahnya tidak dijumlahkan secara matematis melainkan digabungkan sebagai string (misal: jumlah 1 ditambah 2 menjadi "12").
* **Langkah untuk memunculkan bug:**
  1. Pilih produk (misal: Es Teh) dengan jumlah `1`, lalu klik "Tambah".
  2. Pilih produk yang sama (Es Teh) lagi dengan jumlah `2`, lalu klik "Tambah".
  3. Perhatikan kolom jumlah di tabel keranjang menampilkan `12` bukannya `3`.
* **Aturan bisnis yang dilanggar** (nomor aturan di README): Aturan 2
* **Penyebab** (file, fungsi, dan penjelasan): Pada `app.js`, nilai dari input `elQty.value` bertipe `string`. Di `kasir.js` pada fungsi `tambahItem()`, operasi `itemLama.qty += qty` melakukan konkatenasi string karena variabel `qty` belum dikonversi menjadi tipe data `number`.
* **Perbaikan** (apa yang diubah): Konversi `qty` ke `Number` atau `parseInt(qty, 10)` sebelum ditambahkan ke `itemLama.qty` dan saat membuat objek item baru.
* **Test yang membuktikan** (nama test): `tambah item yang sama menjumlahkan nilai numerik qty, bukan gabung string`
* **Commit perbaikan** (pesan commit): `perbaikan: konversi qty ke number agar jumlah produk tidak digabung sebagai string`
* **Ditemukan oleh:** Andante Akmal Alvaro

## Bug 2
* **Gejala:** Ketika uang pembayar kurang dari total belanja, transaksi tetap diproses sukses dan menampilkan kembalian bernilai minus.
* **Langkah untuk memunculkan bug:**
  1. Tambahkan item ke keranjang hingga total menunjukkan Rp15.000.
  2. Masukkan uang bayar sejumlah Rp10.000.
  3. Klik tombol "Bayar".
  4. Aplikasi menampilkan "Pembayaran berhasil" dan kembalian `-Rp5.000`.
* **Aturan bisnis yang dilanggar:** Aturan 7
* **Penyebab:** Pada `kasir.js`, fungsi `hitungKembalian()` tidak memeriksa apakah `bayar < total`. Selain itu di `app.js`, handler tombol bayar langsung menampilkan pesan sukses tanpa validasi kecukupan pembayaran.
* **Perbaikan:** Tambahkan validasi pada `hitungKembalian()` (atau pada handler pembayaran) untuk melempar error `Error("Uang pembayaran kurang")` jika `bayar < total`.
* **Test yang membuktikan:** `pembayaran kurang melempar error Uang pembayaran kurang`
* **Commit perbaikan:** `perbaikan: cegah pembayaran kurang dan tampilkan pesan kesalahan`
* **Ditemukan oleh:** Bastian Nathaniel Inhadi

## Bug 3
* **Gejala:** Pengguna dapat memasukkan jumlah barang berupa angka 0, bilangan negatif, pecahan, atau input kosong tanpa adanya pesan penolakan dari sistem.
* **Langkah untuk memunculkan bug:**
  1. Isi input jumlah barang dengan `0`, `-5`, `1.5`, atau biarkan kosong.
  2. Klik tombol "Tambah".
  3. Produk tetap masuk ke keranjang dengan jumlah invalid tersebut.
* **Aturan bisnis yang dilanggar:** Aturan 1
* **Penyebab:** Fungsi `tambahItem()` di `kasir.js` tidak memiliki validasi tipe dan rentang nilai untuk parameter `qty`.
* **Perbaikan:** Tambahkan validasi di `tambahItem()` untuk memastikan `qty` adalah bilangan bulat positif ($\ge 1$). Jika tidak valid, lempar `Error("Jumlah pesanan tidak valid")`.
* **Test yang membuktikan:** `menolak penambahan item dengan qty nol, negatif, pecahan, atau kosong`
* **Commit perbaikan:** `perbaikan: validasi input qty harus bilangan bulat positif`
* **Ditemukan oleh:** Favian Zufar Niardi

## Bug 4
* **Gejala:** Pelanggan member yang berbelanja di atas Rp100.000 mendapatkan diskon ganda/bertumpuk sebesar 15% (5% + 10%).
* **Langkah untuk memunculkan bug:**
  1. Masukkan produk hingga subtotal melebihi Rp100.000 (misal: Nasi Goreng x 7 = Rp105.000).
  2. Centang opsi "Pelanggan member".
  3. Perhatikan diskon yang terhitung adalah Rp15.750 (15%) padahal seharusnya hanya diskon member 10% (Rp10.500).
* **Aturan bisnis yang dilanggar:** Aturan 4
* **Penyebab:** Pada `kasir.js` fungsi `hitungDiskon()`, logika menggunakan dua blok `if` terpisah dengan akumulasi `diskon += ...`, sehingga kedua diskon terakumulasi.
* **Perbaikan:** Ubah logika diskon agar saling eksklusif (jika member, ambil 10%; jika bukan member dan subtotal $\ge 100.000$, ambil 5%; selain itu 0%).
* **Test yang membuktikan:** `diskon member dan diskon non-member tidak digabung`
* **Commit perbaikan:** `perbaikan: pastikan diskon member dan diskon belanja tidak bertumpuk`
* **Ditemukan oleh:** AI

## Bug 5
* **Gejala:** Pelanggan bukan member yang berbelanja pas Rp100.000 tidak mendapatkan diskon 5%.
* **Langkah untuk memunculkan bug:**
  1. Masukkan produk dengan total tepat Rp100.000 (misal: Es Teh x 25 = Rp100.000).
  2. Pastikan checkbox member tidak dicentang.
  3. Nilai diskon tetap Rp0, padahal syarat minimal adalah Rp100.000.
* **Aturan bisnis yang dilanggar:** Aturan 4
* **Penyebab:** Pada `kasir.js` di fungsi `hitungDiskon()`, pembanding yang digunakan adalah `subtotal > 100000` (lebih besar dari), bukan `>= 100000` (lebih besar atau sama dengan).
* **Perbaikan:** Ubah operator kondisi dari `>` menjadi `>=`.
* **Test yang membuktikan:** `non-member subtotal pas Rp100.000 mendapatkan diskon 5%`
* **Commit perbaikan:** `perbaikan: sesuaikan ambang batas minimal diskon non-member menjadi inklusif 100000`
* **Ditemukan oleh:** AI

## Bug 6
* **Gejala:** Nilai PPN 11% selalu membulatkan angka ke bawah alih-alih menggunakan pembulatan terdekat.
* **Langkah untuk memunculkan bug:**
  1. Tambahkan produk dengan subtotal yang menghasilkan pecahan desimal PPN $\ge 0.5$ (misal: Mie Ayam x 1 = Rp13.500, PPN 11% = Rp1.485).
  2. Dalam kasus pecahan desimal seperti $13.500 \times 0.11 = 1.485$, seharusnya dibulatkan naik ke Rp1.485, namun pada perhitungan tertentu yang menghasilkan `.5` ke atas selalu dipotong ke bawah.
* **Aturan bisnis yang dilanggar:** Aturan 5
* **Penyebab:** Pada `kasir.js` fungsi `hitungPPN()`, digunakan `Math.floor((dasar * 11) / 100)` yang selalu membuang desimal.
* **Perbaikan:** Ganti `Math.floor` menjadi `Math.round`.
* **Test yang membuktikan:** `hitungPPN melakukan pembulatan terdekat`
* **Commit perbaikan:** `perbaikan: gunakan Math.round untuk pembulatan PPN 11%`
* **Ditemukan oleh:** AI

## Bug 7
* **Gejala:** Pengguna dapat menambahkan jumlah barang melebihi batas maksimal 99 unit per produk dalam satu keranjang.
* **Langkah untuk memunculkan bug:**
  1. Tambahkan suatu produk dengan jumlah 50.
  2. Tambahkan lagi produk yang sama dengan jumlah 60.
  3. Total akumulasi jumlah produk di keranjang menjadi 110 (melebihi batas 99).
* **Aturan bisnis yang dilanggar:** Aturan 1 & Aturan 2
* **Penyebab:** Tidak ada pengecekan batas maksimum `qty <= 99` baik saat penambahan awal maupun saat akumulasi produk lama di fungsi `tambahItem()`.
* **Perbaikan:** Tambahkan validasi pada `tambahItem()` agar total jumlah item per produk tidak melebihi 99. Jika melebihi, lemparkan error
* **Test yang membuktikan:** `menolak total qty per produk yang melebihi 99`
* **Commit perbaikan:** `perbaikan: batasi jumlah total pesanan per produk maksimal 99`
* **Ditemukan oleh:** AI