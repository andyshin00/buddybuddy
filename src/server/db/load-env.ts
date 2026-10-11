import { loadEnvConfig } from "@next/env";

// Next.js loads .env.local by itself, but tools that run outside Next.js
// (drizzle-kit, and later the seed script) don't. Importing this file first
// loads the same .env files, the same way Next.js does.
loadEnvConfig(process.cwd());
