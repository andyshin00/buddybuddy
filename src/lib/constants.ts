// Fixed option lists, safe to use on both the server and in the browser.
// Ported from docs/reference/prototype/constants.ts.

export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]["value"];

export const TIMEZONES = [
  "UTC-8 (Pacific)",
  "UTC-7 (Mountain)",
  "UTC-6 (Central)",
  "UTC-5 (Eastern)",
  "UTC-3 (São Paulo)",
  "UTC+0 (London)",
  "UTC+1 (Central Europe)",
  "UTC+3 (Nairobi)",
  "UTC+5:30 (India)",
  "UTC+8 (Singapore)",
  "UTC+9 (Tokyo)",
  "UTC+10 (Sydney)",
] as const;

export const LINKS = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "portfolio", label: "Portfolio" },
] as const;

export type LinkKey = (typeof LINKS)[number]["key"];
