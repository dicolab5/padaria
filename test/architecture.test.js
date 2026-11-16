import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("rotas sensíveis preservam controles estruturais",()=>{const routes=fs.readFileSync(new URL("../src/routes.js",import.meta.url),"utf8");assert.match(routes,/tenantId\(req\)/);assert.match(routes,/FOR UPDATE/);assert.match(routes,/verifyCsrf/);assert.match(routes,/VALUES\(\$1,/);});
test("CSP não permite scripts inline",()=>{const server=fs.readFileSync(new URL("../server.js",import.meta.url),"utf8");assert.match(server,/scriptSrc:\["'self'"\]/);assert.doesNotMatch(server,/unsafe-inline/);});
