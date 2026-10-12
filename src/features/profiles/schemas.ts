import { z } from "zod";

import { EXPERIENCE_LEVELS, TIMEZONES } from "@/lib/constants";

// Names that would be confusing or look official.
const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "buddybuddy",
  "me",
  "new",
  "settings",
  "support",
]);

// Shared by the onboarding form and the createProfile Server Action.
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9_]{3,20}$/,
    "Use 3–20 characters: lowercase letters, numbers or underscores.",
  )
  .refine(
    (name) => !RESERVED_USERNAMES.has(name),
    "That username is reserved.",
  );

export const onboardingSchema = z.object({ username: usernameSchema });

// ---------------------------------------------------------------------------
// Edit profile form. Shared by the form and the updateProfile Server Action.
// ---------------------------------------------------------------------------

// Form fields arrive as strings; an empty box means "not set" (null).
const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const optionalText = (max: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable());

// docs/privacy.md: only https:// links are accepted.
const optionalHttpsUrl = z.preprocess(
  emptyToNull,
  z
    .url({
      protocol: /^https$/,
      error: "Enter a full link starting with https://",
    })
    .max(200)
    .nullable(),
);

// "React, TypeScript, react" → ["React", "TypeScript"]
const skillList = z
  .string()
  .transform((text) => {
    const seen = new Set<string>();
    return text
      .split(",")
      .map((name) => name.trim())
      .filter((name) => {
        const key = name.toLowerCase();
        if (!name || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  })
  .pipe(
    z
      .array(z.string().max(30, "Each skill must be 30 characters or fewer."))
      .max(20, "List up to 20 skills."),
  );

export const profileFormSchema = z.object({
  // Public
  displayName: optionalText(50),
  headline: optionalText(80),
  bio: optionalText(1000),
  experience: z.preprocess(
    emptyToNull,
    z.enum(EXPERIENCE_LEVELS.map((level) => level.value)).nullable(),
  ),
  hoursPerWeek: z.preprocess(
    emptyToNull,
    z.coerce
      .number()
      .int("Use a whole number.")
      .min(1, "At least 1 hour.")
      .max(168, "There are only 168 hours in a week.")
      .nullable(),
  ),
  timezone: z.preprocess(emptyToNull, z.enum(TIMEZONES).nullable()),
  skills: skillList,

  // Private (see docs/privacy.md)
  realName: optionalText(80),
  githubUrl: optionalHttpsUrl,
  linkedinUrl: optionalHttpsUrl,
  portfolioUrl: optionalHttpsUrl,
  githubPublic: z.boolean(),
  linkedinPublic: z.boolean(),
  portfolioPublic: z.boolean(),
  email: z.preprocess(
    emptyToNull,
    z.email("Enter a valid email address.").max(200).nullable(),
  ),
  discord: optionalText(40),
});

export type ProfileFormInput = z.input<typeof profileFormSchema>;
export type ProfileFormData = z.output<typeof profileFormSchema>;
