const test = require("node:test");
const assert = require("node:assert");
const kasir = require("../kasir.js");

test("diskon member dan diskon non-member tidak digabung", () => {
  // Subtotal Rp105.000 + Member -> Diskon member 10% (10.500), BUKAN 15% (15.750)
  assert.strictEqual(kasir.hitungDiskon(105000, true), 10500);
});