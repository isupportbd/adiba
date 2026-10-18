/**
 * Lazy PostgreSQL + Drizzle client.
 *
 * The client is created on first use so that:
 *  - `USE_SAMPLE_DATA=1` dev mode runs with NO database at all, and
 *  - `next build` never fails just because the database is not reachable
 *    at build time (queries fall back to sample data, see queries.ts).
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local, or run with USE_SAMPLE_DATA=1 to preview without a database.",
    );
  }
  const pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30_000,
    // Set DATABASE_SSL=require when PostgreSQL runs behind TLS.
    ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : undefined,
  });
  return drizzle(pool, { schema });
}

let cached: Db | null = null;

/** Returns the shared Drizzle client (throws in sample-only mode). */
export function getDb(): Db {
  if (process.env.USE_SAMPLE_DATA === "1") {
    throw new Error("USE_SAMPLE_DATA=1 — database access disabled on purpose.");
  }
  if (!cached) cached = createDb();
  return cached;
}

export { schema };
