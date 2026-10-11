import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { env } from "@/env";

import { db } from "./db";
import * as schema from "./db/schema";

// Better Auth handles the whole sign-in flow: redirecting to GitHub/Google,
// creating the user, and the session cookie. How it works: docs/auth.md
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  account: {
    // Signing in with Google using the same (verified) email as an existing
    // GitHub account logs into that same user instead of creating a new one.
    accountLinking: { enabled: true },
  },
  // Lets Server Actions set and clear the session cookie. Must be last.
  plugins: [nextCookies()],
});

// The person viewing the page. `username` is null until they finish onboarding.
export type Viewer = {
  id: string;
  name: string;
  image: string | null;
  username: string | null;
};

// Who is signed in, or null. `cache` means calling it several times while
// rendering one page only checks the session once.
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [row] = await db
    .select({ username: schema.profile.username })
    .from(schema.profile)
    .where(eq(schema.profile.userId, session.user.id));

  return {
    id: session.user.id,
    name: session.user.name,
    image: session.user.image ?? null,
    username: row?.username ?? null,
  };
});

// For pages and actions that need someone signed in.
export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  return viewer;
}

// For pages and actions that need a finished profile (a username).
// Signed-in users without one are sent to onboarding until they pick one.
export async function requireProfile(): Promise<Viewer & { username: string }> {
  const viewer = await requireViewer();
  if (!viewer.username) redirect("/onboarding");
  return { ...viewer, username: viewer.username };
}
