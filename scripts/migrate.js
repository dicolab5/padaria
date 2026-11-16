import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "../src/db.js";
const dir = path.resolve("migrations");
const lockClient=await pool.connect();
try {
  await lockClient.query("SELECT pg_advisory_lock(72493821)");
  await lockClient.query("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, run_at timestamptz NOT NULL DEFAULT now())");
  for (const name of (await fs.readdir(dir)).filter((x) => x.endsWith(".sql")).sort()) {
    const exists = await lockClient.query("SELECT 1 FROM schema_migrations WHERE name=$1", [name]);
    if (exists.rowCount) continue;
    try { await lockClient.query("BEGIN"); await lockClient.query(await fs.readFile(path.join(dir,name), "utf8")); await lockClient.query("INSERT INTO schema_migrations(name) VALUES($1)",[name]); await lockClient.query("COMMIT"); console.log(`Aplicada: ${name}`); }
    catch (e) { await lockClient.query("ROLLBACK"); throw e; }
  }
} finally { await lockClient.query("SELECT pg_advisory_unlock(72493821)").catch(()=>{}); lockClient.release(); }
await pool.end();
