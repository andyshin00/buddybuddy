// Must come first: loads .env.local before env.ts validates it.
import "./src/server/db/load-env";

import { defineConfig } from "drizzle-kit";

import { env } from "./src/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  // Must match the `casing` option in src/server/db/index.ts.
  casing: "snake_case",
  dbCredentials: { url: env.DATABASE_URL },
  strict: true,
  verbose: true,
});
