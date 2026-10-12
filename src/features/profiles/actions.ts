"use server";

import { redirect } from "next/navigation";

import { requireViewer } from "@/server/auth";
import { db } from "@/server/db";
import { isUniqueViolation } from "@/server/db/errors";
import { profile } from "@/server/db/schema";

import { onboardingSchema } from "./schemas";

export type OnboardingState = { error?: string; username?: string };

// Onboarding: the signed-in user picks a username, which creates their profile.
export async function createProfile(
  _previous: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  // 1. Who is asking? (Never trust the form for this.)
  const viewer = await requireViewer();
  if (viewer.username) redirect("/");

  // 2. Is the input valid?
  const typed = String(formData.get("username") ?? "");
  const parsed = onboardingSchema.safeParse({ username: typed });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, username: typed };
  }

  // 3. Save it. The database's unique index is the final word on "taken".
  try {
    await db
      .insert(profile)
      .values({ userId: viewer.id, username: parsed.data.username });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "That username is taken.", username: typed };
    }
    throw error;
  }

  redirect("/");
}
