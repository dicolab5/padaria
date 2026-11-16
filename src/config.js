import { loadEnvFile } from "node:process";
import { z } from "zod";
try { loadEnvFile(); } catch (error) { if (error.code !== "ENOENT") throw error; }
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  DATABASE_SSL: z.enum(["disable","require","verify-full"]).default("disable"),
});
export const config = schema.parse(process.env);
