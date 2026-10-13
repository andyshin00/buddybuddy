"use server";

import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, requireViewer } from "@/server/auth";
import { db } from "@/server/db";
import { rateLimit, user } from "@/server/db/schema";
import { RATE_LIMITS } from "@/server/rate-limit";

import { confirmationWord, isConfirmed } from "./rules";

export type DeleteAccountState = { error?: string };

// Permanently deletes the signed-in user and everything they own.
export async function deleteAccount(
  _previous: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  // 1. Who's asking? Works without a username too (onboarding not finished).
  const viewer = await requireViewer();

  // 2. Did they type the confirmation word? It stops accidental clicks.
  const typed = String(formData.get("confirm") ?? "");
  if (!isConfirmed(typed, viewer)) {
    return { error: `Type ${confirmationWord(viewer)} to confirm.` };
  }

  // 3. Sign out first: deletes this session and clears the cookie.
  await auth.api.signOut({ headers: await headers() });

  // 4. Delete the user row. ON DELETE CASCADE removes everything that
  //    points at it: sessions, sign-in accounts, profile, private details,
  //    skills, posts (with their roles, questions and applications), your
  //    applications, notifications, blocks and reports. The rate-limit
  //    counters aren't linked by a foreign key, so they're removed here.
  await db.transaction(async (tx) => {
    await tx.delete(user).where(eq(user.id, viewer.id));
    await tx.delete(rateLimit).where(
      inArray(
        rateLimit.key,
        Object.keys(RATE_LIMITS).map((action) => `${action}:${viewer.id}`),
      ),
    );
  });

  redirect("/?deleted=1");
}
