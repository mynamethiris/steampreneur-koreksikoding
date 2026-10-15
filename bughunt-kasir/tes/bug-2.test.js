const test = require("node:test");
const assert = require("node:assert");
const kasir = require("../kasir.js");

test("pembayaran kurang melempar error Uang pembayaran kurang", () => {
  assert.throws(
    () => kasir.hitungKembalian(15000, 10000),
    /Uang pembayaran kurang/
  );
});