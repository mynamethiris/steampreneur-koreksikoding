/*
 * Kasir Kantin STEAM: tampilan
 * Menghubungkan halaman (index.html) dengan logika di kasir.js.
 */

let keranjang = [];
let riwayatTransaksi = [];     // Menyimpan history/struk
let transaksiSelesai = false;  // Kunci agar transaksi tidak diubah setelah dibayar

const elProduk = document.getElementById("produk");
const elQty = document.getElementById("qty");
const elMember = document.getElementById("member");
const elIsiKeranjang = document.getElementById("isi-keranjang");
const elBayar = document.getElementById("bayar");
const elPesan = document.getElementById("pesan");
const elHasilBayar = document.getElementById("hasil-bayar");

// Elemen tambahan untuk Riwayat Transaksi
const elCariRiwayat = document.getElementById("cari-riwayat");
const elFilterRiwayat = document.getElementById("filter-riwayat");
const elIsiRiwayat = document.getElementById("isi-riwayat");
const elTombolExportCsv = document.getElementById("tombol-export-csv");

function rupiah(angka) {
  return "Rp" + Number(angka).toLocaleString("id-ID");
}

function tampilkanPesan(teks, jenis) {
  elPesan.textContent = teks;
  elPesan.className = "pesan " + (jenis || "");
}

function isiPilihanMenu() {
  for (const p of MENU) {
    const opsi = document.createElement("option");
    opsi.value = p.kode;
    opsi.textContent = p.nama + " (" + rupiah(p.harga) + ")";
    elProduk.appendChild(opsi);
  }
}

function render() {
  elIsiKeranjang.innerHTML = "";

  if (keranjang.length === 0) {
    const baris = document.createElement("tr");
    baris.innerHTML = '<td colspan="5" class="kosong">Keranjang masih kosong</td>';
    elIsiKeranjang.appendChild(baris);
  }

  for (const item of keranjang) {
    const baris = document.createElement("tr");
    baris.innerHTML =
      "<td>" + item.nama + "</td>" +
      '<td class="angka">' + rupiah(item.harga) + "</td>" +
      '<td class="angka">' + item.qty + "</td>" +
      '<td class="angka">' + rupiah(item.harga * item.qty) + "</td>" +
      '<td><button class="hapus" data-kode="' + item.kode + '">Hapus</button></td>';
    elIsiKeranjang.appendChild(baris);
  }

  const r = hitungRingkasan(keranjang, elMember.checked);
  document.getElementById("subtotal").textContent = rupiah(r.subtotal);
  document.getElementById("diskon").textContent = "-" + rupiah(r.diskon);
  document.getElementById("ppn").textContent = rupiah(r.ppn);
  document.getElementById("total").textContent = rupiah(r.total);
  
  if (!transaksiSelesai) {
    elHasilBayar.textContent = "";
  }
}

// FUNGSI BARU: Render tabel riwayat dengan filter & pencarian
function renderRiwayat() {
  elIsiRiwayat.innerHTML = "";
  
  const keyword = elCariRiwayat.value.toLowerCase();
  const filter = elFilterRiwayat.value;

  // Filter berdasarkan ID dan tipe member
  const dataTampil = riwayatTransaksi.filter(trx => {
    const cocokKeyword = trx.id.toLowerCase().includes(keyword);
    let cocokFilter = true;
    if (filter === "member") cocokFilter = trx.member;
    if (filter === "non-member") cocokFilter = !trx.member;
    
    return cocokKeyword && cocokFilter;
  });

  if (dataTampil.length === 0) {
    elIsiRiwayat.innerHTML = '<tr><td colspan="6" class="kosong">Tidak ada data riwayat</td></tr>';
    return;
  }

  // Menampilkan urutan dari transaksi terbaru
  const dataReverse = [...dataTampil].reverse();

  for (const trx of dataReverse) {
    const baris = document.createElement("tr");
    
    // Format tanggal sederhana
    const dateObj = new Date(trx.tanggal);
    const tgl = dateObj.toLocaleDateString("id-ID") + " " + dateObj.toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'});

    baris.innerHTML =
      "<td>" + trx.id + "</td>" +
      "<td>" + tgl + "</td>" +
      "<td>" + (trx.member ? "Ya" : "Bukan") + "</td>" +
      '<td class="angka">' + rupiah(trx.total) + "</td>" +
      '<td class="angka">' + rupiah(trx.bayar) + "</td>" +
      '<td class="angka">' + rupiah(trx.kembalian) + "</td>";
    elIsiRiwayat.appendChild(baris);
  }
}

document.getElementById("form-tambah").addEventListener("submit", function (e) {
  e.preventDefault();
  if (transaksiSelesai) {
    tampilkanPesan("Transaksi sudah dibayar. Klik Transaksi Baru terlebih dahulu.", "error");
    return;
  }
  try {
    tambahItem(keranjang, elProduk.value, elQty.value);
    tampilkanPesan("", "");
    elQty.value = 1;
    render();
  } catch (err) {
    tampilkanPesan(err.message, "error");
  }
});

elIsiKeranjang.addEventListener("click", function (e) {
  if (transaksiSelesai) return; // Mencegah hapus jika sudah dibayar
  if (e.target.classList.contains("hapus")) {
    keranjang = hapusItem(keranjang, e.target.dataset.kode);
    render();
  }
});

elMember.addEventListener("change", function() {
  if (transaksiSelesai) return;
  render();
});

document.getElementById("tombol-bayar").addEventListener("click", function () {
  if (keranjang.length === 0) {
    tampilkanPesan("Keranjang masih kosong", "error");
    return;
  }
  if (transaksiSelesai) {
    tampilkanPesan("Transaksi ini sudah dibayar.", "error");
    return;
  }
  
  try {
    const r = hitungRingkasan(keranjang, elMember.checked);
    const nominalBayar = Number(elBayar.value);
    const kembalian = hitungKembalian(r.total, nominalBayar);
    
    elHasilBayar.textContent = "Kembalian: " + rupiah(kembalian);
    tampilkanPesan("Pembayaran berhasil!", "sukses");

    // Kunci transaksi
    transaksiSelesai = true;

    // Simpan ke Riwayat (sebagai struk history)
    const transaksiBaru = {
      id: "TRX" + Date.now(), 
      tanggal: new Date().toISOString(),
      items: JSON.parse(JSON.stringify(keranjang)), // Duplikasi data keranjang
      subtotal: r.subtotal,
      diskon: r.diskon,
      ppn: r.ppn,
      total: r.total,
      bayar: nominalBayar,
      kembalian: kembalian,
      member: elMember.checked
    };
    
    riwayatTransaksi.push(transaksiBaru);
    renderRiwayat();

  } catch (err) {
    elHasilBayar.textContent = "";
    tampilkanPesan(err.message, "error");
  }
});

document.getElementById("tombol-baru").addEventListener("click", function () {
  keranjang = [];
  elBayar.value = "";
  elMember.checked = false;
  transaksiSelesai = false;
  tampilkanPesan("", "");
  render();
});

// EVENT LISTENER BARU: Pencarian dan Filter History
elCariRiwayat.addEventListener("input", renderRiwayat);
elFilterRiwayat.addEventListener("change", renderRiwayat);

// EVENT LISTENER BARU: Ekspor Data ke File CSV
elTombolExportCsv.addEventListener("click", function() {
  if (riwayatTransaksi.length === 0) {
    alert("Belum ada riwayat transaksi yang bisa diekspor.");
    return;
  }

  // Header teks CSV
  let csvContent = "ID Transaksi,Tanggal,Status Member,Item Pesanan,Subtotal,Diskon,PPN,Total,Bayar,Kembalian\n";

  // Kita gunakan data yang *sedang* difilter agar hasil export sama dengan tabel
  const keyword = elCariRiwayat.value.toLowerCase();
  const filter = elFilterRiwayat.value;
  const dataEkspor = riwayatTransaksi.filter(trx => {
    const cocokKeyword = trx.id.toLowerCase().includes(keyword);
    let cocokFilter = true;
    if (filter === "member") cocokFilter = trx.member;
    if (filter === "non-member") cocokFilter = !trx.member;
    return cocokKeyword && cocokFilter;
  });

  dataEkspor.forEach(trx => {
    // Susun ringkasan pesanan ke dalam format teks (misal: "Nasi Goreng (2) | Es Teh (1)")
    const stringItem = trx.items.map(i => `${i.nama} (${i.qty})`).join(" | ");
    
    const barisTeks = [
      trx.id,
      new Date(trx.tanggal).toLocaleString("id-ID"),
      trx.member ? "Member" : "Bukan Member",
      `"${stringItem}"`, // Tanda kutip agar aman dari koma
      trx.subtotal,
      trx.diskon,
      trx.ppn,
      trx.total,
      trx.bayar,
      trx.kembalian
    ].join(",");
    
    csvContent += barisTeks + "\n";
  });

  // Logika pembuatan dan otomatis unduh file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", "Laporan_Kantin_STEAM.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Inisialisasi awal
isiPilihanMenu();
render();
renderRiwayat();