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

export const POST_TYPES = [
  {
    value: "need-builders",
    label: "Have an idea, need builders",
    short: "Need builders",
    badgeClass: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  {
    value: "ideate",
    label: "Open to ideating together",
    short: "Ideating",
    badgeClass: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  {
    value: "fill-role",
    label: "Existing project, need a role filled",
    short: "Role to fill",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
] as const;

export type PostType = (typeof POST_TYPES)[number]["value"];

export const DURATIONS = [
  { value: "weekend", label: "A weekend" },
  { value: "2-weeks", label: "~2 weeks" },
  { value: "1-month", label: "~1 month" },
  { value: "3-months", label: "~3 months" },
  { value: "3-plus-months", label: "3+ months" },
] as const;

export type Duration = (typeof DURATIONS)[number]["value"];
