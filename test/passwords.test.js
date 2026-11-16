import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/passwords.js";
test("hash de senha usa salt e valida em tempo constante",async()=>{const a=await hashPassword("SenhaMuitoForte!123"),b=await hashPassword("SenhaMuitoForte!123");assert.notEqual(a,b);assert.equal(await verifyPassword(a,"SenhaMuitoForte!123"),true);assert.equal(await verifyPassword(a,"senha-incorreta"),false);});
