const test = require("node:test");
const assert = require("node:assert");
const kasir = require("../kasir.js");

test("menolak penambahan item dengan qty nol, negatif, pecahan, atau kosong", () => {
  assert.throws(() => kasir.tambahItem([], "K01", 0), Error);
  assert.throws(() => kasir.tambahItem([], "K01", -5), Error);
  assert.throws(() => kasir.tambahItem([], "K01", 1.5), Error);
  assert.throws(() => kasir.tambahItem([], "K01", ""), Error);
});