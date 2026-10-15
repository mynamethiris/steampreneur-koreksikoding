const test = require("node:test");
const assert = require("node:assert");
const kasir = require("../kasir.js");

test("non-member subtotal pas Rp100.000 mendapatkan diskon 5%", () => {
  // Non-member belanja pas Rp100.000 harus dapat diskon 5% = 5.000
  assert.strictEqual(kasir.hitungDiskon(100000, false), 5000);
});
