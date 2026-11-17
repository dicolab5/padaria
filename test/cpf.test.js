import test from "node:test";
import assert from "node:assert/strict";
import { isValidCpf, normalizeCpf } from "../src/cpf.js";

test("normaliza e valida CPF",()=>{
  assert.equal(normalizeCpf("529.982.247-25"),"52998224725");
  assert.equal(isValidCpf("529.982.247-25"),true);
  assert.equal(isValidCpf("111.111.111-11"),false);
  assert.equal(isValidCpf("529.982.247-24"),false);
});
