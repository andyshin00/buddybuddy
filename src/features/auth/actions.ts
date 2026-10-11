"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/server/auth";

const providerSchema = z.enum(["github", "google"]);

// Starts "Sign in with GitHub/Google": Better Auth builds the provider's
// login URL and we send the browser there. The provider then sends the user
// back to /api/auth/callback/<provider>, which creates the session.
export async function signInWith(provider: "github" | "google") {
  // Server Actions can be called with any input, so check it.
  const parsed = providerSchema.parse(provider);

  const result = await auth.api.signInSocial({
    body: {
      provider: parsed,
      callbackURL: "/", // returning users
      newUserCallbackURL: "/onboarding", // first sign-in: pick a username
    },
  });
  if (!result.url) throw new Error("Sign-in did not return a URL");

  redirect(result.url);
}

// Deletes the session (in the database and the cookie).
export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
