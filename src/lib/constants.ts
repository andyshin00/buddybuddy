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

export const QUESTION_TYPES = [
  { value: "short", label: "Short text" },
  { value: "long", label: "Long text" },
  { value: "dropdown", label: "Dropdown (pick one)" },
  { value: "multi", label: "Checkboxes (pick any)" },
  { value: "yesno", label: "Yes / No" },
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number]["value"];

// Question types where the poster writes the choices.
export function hasOptions(type: QuestionType): boolean {
  return type === "dropdown" || type === "multi";
}

// Why someone is reporting a user or post. Matches the report_reason enum.
export const REPORT_REASONS = [
  { value: "spam", label: "Spam or advertising" },
  { value: "harassment", label: "Harassment or hate" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "scam", label: "Scam or fake project" },
  { value: "other", label: "Something else" },
] as const;
