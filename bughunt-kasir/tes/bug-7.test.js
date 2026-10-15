const test = require("node:test");
const assert = require("node:assert");
const kasir = require("../kasir.js");

test("menolak total qty per produk yang melebihi 99", () => {
  assert.throws(() => kasir.tambahItem([], "K01", 100), Error);

  const keranjang = [];
  kasir.tambahItem(keranjang, "K01", 50);
  assert.throws(() => kasir.tambahItem(keranjang, "K01", 60), Error); // 50 + 60 = 110 (> 99)
});