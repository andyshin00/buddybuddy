import { z } from "zod";

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
