import type { Config } from "drizzle-kit";

/**
 * drizzle-kit config (dev tooling: db:generate / db:push / db:studio).
 * Runtime migrations are applied by `migrate.mjs` — see README.
 */
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/adiba_memory",
  },
  verbose: true,
  strict: false,
} satisfies Config;
