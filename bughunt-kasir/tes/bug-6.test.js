const test = require("node:test");
const assert = require("node:assert");
const kasir = require("../kasir.js");

test("hitungPPN melakukan pembulatan terdekat", () => {
  // 10.050 * 11% = 1105.5 -> dibulatkan naik ke 1106 (Math.round)
  // Pada kode asli (Math.floor) hasilnya 1105 sehingga tes ini akan gagal
  assert.strictEqual(kasir.hitungPPN(10050), 1106);
});