import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const routes=fs.readFileSync(new URL("../src/system-routes.js",import.meta.url),"utf8");
const security=fs.readFileSync(new URL("../src/security.js",import.meta.url),"utf8");

test("crédito de plano valida dias, plano e motivo",()=>{
  assert.match(routes,/subscription\/credit/);
  assert.match(routes,/\.int\(\)\.min\(1\)\.max\(3650\)/);
  assert.match(routes,/z\.enum\(\["starter","management","network"\]\)/);
  assert.match(routes,/reason:z\.string\(\)\.trim\(\)\.min\(3\)/);
});

test("crédito é acumulado e auditado",()=>{
  assert.match(routes,/GREATEST\(/);
  assert.match(routes,/credit_subscription_days/);
  assert.match(routes,/BEGIN/);
  assert.match(routes,/COMMIT/);
});

test("expiração do plano também é verificada durante a sessão",()=>{
  assert.match(security,/subscription_ends_at/);
  assert.match(security,/SUBSCRIPTION_EXPIRED/);
});
