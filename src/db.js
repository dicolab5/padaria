import pg from "pg";
import { config } from "./config.js";
export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: config.DATABASE_SSL === "disable" ? false : { rejectUnauthorized: config.DATABASE_SSL === "verify-full" },
});
export async function transaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}
