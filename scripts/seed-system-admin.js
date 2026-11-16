import { pool } from "../src/db.js";
import { hashPassword } from "../src/passwords.js";
const email=(process.env.SYSTEM_ADMIN_EMAIL||"").trim().toLowerCase();
const password=process.env.SYSTEM_ADMIN_PASSWORD||"";
const name=(process.env.SYSTEM_ADMIN_NAME||"Administrador do Sistema").trim();
if(!email||password.length<12)throw new Error("Defina SYSTEM_ADMIN_EMAIL e SYSTEM_ADMIN_PASSWORD com ao menos 12 caracteres.");
const exists=await pool.query("SELECT 1 FROM system_admins WHERE lower(email)=$1",[email]);
if(exists.rowCount){console.log("Administrador do sistema já existe; nenhuma alteração realizada.");await pool.end();process.exit(0);}
const hash=await hashPassword(password);
await pool.query("INSERT INTO system_admins(name,email,password_hash) VALUES($1,$2,$3)",[name,email,hash]);
console.log(`Administrador do sistema criado: ${email}.`);await pool.end();
