"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireProfile, requireViewer } from "@/server/auth";
import { db } from "@/server/db";
import { isUniqueViolation } from "@/server/db/errors";
import {
  profile,
  profilePrivate,
  profileSkill,
  skill,
} from "@/server/db/schema";

import {
  onboardingSchema,
  profileFormSchema,
  type ProfileFormInput,
} from "./schemas";

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

export type ProfileFormState = {
  // What was typed, so the form keeps it after an error.
  values?: ProfileFormInput;
  fieldErrors?: Partial<Record<keyof ProfileFormInput, string[]>>;
};

// Edit profile: saves the viewer's own public and private details and skills.
export async function updateProfile(
  _previous: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  // 1. Who is asking? They can only ever edit their own profile.
  const viewer = await requireProfile();

  // 2. Is the input valid? (The same schema the form uses.)
  const text = (name: string) => String(formData.get(name) ?? "");
  const values: ProfileFormInput = {
    displayName: text("displayName"),
    headline: text("headline"),
    bio: text("bio"),
    experience: text("experience"),
    hoursPerWeek: text("hoursPerWeek"),
    timezone: text("timezone"),
    skills: text("skills"),
    realName: text("realName"),
    githubUrl: text("githubUrl"),
    linkedinUrl: text("linkedinUrl"),
    portfolioUrl: text("portfolioUrl"),
    // A ticked checkbox sends "on"; an unticked one sends nothing.
    githubPublic: formData.get("githubPublic") === "on",
    linkedinPublic: formData.get("linkedinPublic") === "on",
    portfolioPublic: formData.get("portfolioPublic") === "on",
    email: text("email"),
    discord: text("discord"),
  };
  const parsed = profileFormSchema.safeParse(values);
  if (!parsed.success) {
    return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { skills: skillNames, ...data } = parsed.data;

  // 3. Save. Three tables change, so it's one transaction: if any step
  //    fails, none of the changes are kept.
  await db.transaction(async (tx) => {
    await tx
      .update(profile)
      .set({
        displayName: data.displayName,
        headline: data.headline,
        bio: data.bio,
        experience: data.experience,
        hoursPerWeek: data.hoursPerWeek,
        timezone: data.timezone,
      })
      .where(eq(profile.userId, viewer.id));

    const privateDetails = {
      realName: data.realName,
      githubUrl: data.githubUrl,
      linkedinUrl: data.linkedinUrl,
      portfolioUrl: data.portfolioUrl,
      githubPublic: data.githubPublic,
      linkedinPublic: data.linkedinPublic,
      portfolioPublic: data.portfolioPublic,
      email: data.email,
      discord: data.discord,
    };
    // "Upsert": insert the row, or update it if it already exists.
    await tx
      .insert(profilePrivate)
      .values({ userId: viewer.id, ...privateDetails })
      .onConflictDoUpdate({
        target: profilePrivate.userId,
        set: privateDetails,
      });

    // Skills: replace the whole list.
    await tx.delete(profileSkill).where(eq(profileSkill.userId, viewer.id));
    if (skillNames.length > 0) {
      // Add skills nobody has used yet ("react" matches an existing "React").
      await tx
        .insert(skill)
        .values(skillNames.map((name) => ({ name })))
        .onConflictDoNothing();
      const lowered = skillNames.map((name) => name.toLowerCase());
      const rows = await tx
        .select({ id: skill.id })
        .from(skill)
        .where(inArray(sql`lower(${skill.name})`, lowered));
      await tx
        .insert(profileSkill)
        .values(rows.map((row) => ({ userId: viewer.id, skillId: row.id })));
    }
  });

  redirect(`/u/${viewer.username}`);
}
