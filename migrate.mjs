#!/usr/bin/env node
/**
 * Zero-dependency migration runner (uses only `pg`, which ships with the app).
 *
 *  • Applies every .sql file in ./drizzle that has not been applied yet.
 *  • Tracks applied files in a `schema_migrations` table.
 *  • All SQL files are written to be idempotent, so re-running is safe.
 *
 * Runs automatically when the Docker container starts. For development
 * you can also run it directly: npm run db:migrate
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = process.env.MIGRATIONS_DIR || path.join(__dirname, "drizzle");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[migrate] DATABASE_URL is not set — skipping migrations.");
    process.exit(0); // let `docker compose up` continue; app falls back to sample data
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         name text PRIMARY KEY,
         applied_at timestamptz NOT NULL DEFAULT now()
       )`,
    );

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const { rowCount } = await client.query(
        "SELECT 1 FROM schema_migrations WHERE name = $1",
        [file],
      );
      if (rowCount) {
        console.log(`[migrate] ✓ ${file} (already applied)`);
        continue;
      }
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      console.log(`[migrate] → applying ${file}…`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`[migrate] ✓ ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }
    console.log("[migrate] all migrations applied.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[migrate] failed:", err.message);
  process.exit(1);
});
