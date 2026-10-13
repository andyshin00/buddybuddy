import { createHmac, randomBytes } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import type { BrowserContext } from "@playwright/test";
import { Pool } from "pg";

// Same .env files as the app (none on CI: it sets real env vars).
loadEnvConfig(process.cwd());

// The tests talk to the database directly, only to set things up and to
// check results. Everything the user does goes through the browser.
const { DATABASE_URL, BETTER_AUTH_SECRET } = process.env;
if (!DATABASE_URL || !BETTER_AUTH_SECRET) {
  throw new Error("E2E tests need DATABASE_URL and BETTER_AUTH_SECRET.");
}
const secret: string = BETTER_AUTH_SECRET;
export const pool = new Pool({ connectionString: DATABASE_URL });

export async function query<T>(text: string, values: unknown[] = []) {
  return (await pool.query(text, values)).rows as T[];
}

// Same port as playwright.config.ts.
export const BASE_URL = "http://localhost:3100";

// Demo users from src/server/db/seed.ts.
export const MAYA = "u-maya";
export const SAM = "u-sam";
export const JORDAN = "u-jordan";

// Signs a browser context in as `userId`, without GitHub or Google.
// It does what Better Auth does after a real sign-in: saves a session row
// and sets the signed session cookie. This only works with the server's
// secret, which tests have and attackers don't.
export async function signInAs(context: BrowserContext, userId: string) {
  const token = randomBytes(24).toString("hex");
  await query(
    `insert into session (id, token, expires_at, user_id)
     values ($1, $2, now() + interval '1 hour', $3)`,
    [`e2e-${token.slice(0, 12)}`, token, userId],
  );
  const signature = createHmac("sha256", secret).update(token).digest("base64");
  await context.addCookies([
    {
      name: "better-auth.session_token",
      value: encodeURIComponent(`${token}.${signature}`),
      url: BASE_URL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
