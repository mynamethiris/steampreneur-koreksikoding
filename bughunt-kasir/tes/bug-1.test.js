const test = require("node:test");
const assert = require("node:assert");
const kasir = require("../kasir.js");

test("tambah item yang sama menjumlahkan nilai numerik qty, bukan gabung string", () => {
  const keranjang = [];
  kasir.tambahItem(keranjang, "K04", 1);
  kasir.tambahItem(keranjang, "K04", "2"); // string "2" dari input HTML
  assert.strictEqual(keranjang[0].qty, 3);
});