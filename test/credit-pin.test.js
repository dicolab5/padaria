import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const routes=fs.readFileSync(new URL("../src/routes.js",import.meta.url),"utf8");

test("venda no crediário exige PIN de seis dígitos no servidor",()=>{
  assert.match(routes,/\^\\d\{6\}\$/);
  assert.match(routes,/authorizeCreditPurchase/);
  assert.match(routes,/verifyPassword\(customer\.credit_pin_hash,pin\)/);
});

test("PIN possui bloqueio de tentativas e nunca é retornado na listagem",()=>{
  assert.match(routes,/credit_pin_failed_attempts\+1>=5/);
  assert.match(routes,/interval '15 minutes'/);
  assert.match(routes,/credit_pin_hash IS NOT NULL/);
  assert.doesNotMatch(routes,/SELECT \* FROM customers/);
});
