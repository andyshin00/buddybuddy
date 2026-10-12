import { z } from "zod";

import { DURATIONS, LINKS, POST_TYPES, TIMEZONES } from "@/lib/constants";
import { commaList, emptyToNull } from "@/lib/form";

const postTypes = POST_TYPES.map((t) => t.value);
const durations = DURATIONS.map((d) => d.value);
const linkKeys = LINKS.map((l) => l.key);

// ---------------------------------------------------------------------------
// Create / edit post form. Shared by the form and the Server Actions.
// ---------------------------------------------------------------------------

export const postFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Give it a title of at least 5 characters.")
      .max(100),
    description: z
      .string()
      .trim()
      .min(20, "Describe the project in at least 20 characters.")
      .max(3000),
    type: z.enum(postTypes, "Choose a post type."),
    roles: commaList({ maxItems: 6, maxLength: 40, noun: "role" }).pipe(
      z.array(z.string()).min(1, "Add at least one role."),
    ),
    requiredSkills: commaList({ maxItems: 10, maxLength: 30, noun: "skill" }),
    niceSkills: commaList({ maxItems: 10, maxLength: 30, noun: "skill" }),
    hoursPerWeek: z.coerce
      .number("Enter a number of hours.")
      .int("Use a whole number.")
      .min(1, "At least 1 hour.")
      .max(168, "There are only 168 hours in a week."),
    duration: z.enum(durations, "Choose a duration."),
    timezone: z.preprocess(emptyToNull, z.enum(TIMEZONES).nullable()),
    requiredLinks: z.array(z.enum(linkKeys)),
  })
  // A skill is either required or nice-to-have, not both.
  .refine(
    (post) => {
      const required = new Set(post.requiredSkills.map((s) => s.toLowerCase()));
      return !post.niceSkills.some((s) => required.has(s.toLowerCase()));
    },
    {
      path: ["niceSkills"],
      message: "A skill can't be both required and nice-to-have.",
    },
  );

export type PostFormInput = z.input<typeof postFormSchema>;
export type PostFormData = z.output<typeof postFormSchema>;

// ---------------------------------------------------------------------------
// Browse filters, read from the URL (?search=…&type=…&skills=…).
// Anything invalid is ignored rather than shown as an error: the URL can be
// edited by hand.
// ---------------------------------------------------------------------------

export const browseFiltersSchema = z.object({
  search: z.string().trim().max(100).catch(""),
  type: z.enum(postTypes).optional().catch(undefined),
  skills: commaList({ maxItems: 10, maxLength: 30, noun: "skill" }).catch([]),
  maxHours: z.coerce.number().int().min(1).max(168).optional().catch(undefined),
  duration: z.enum(durations).optional().catch(undefined),
});

export type BrowseFilters = z.output<typeof browseFiltersSchema>;

// Next.js gives search params as string | string[] | undefined.
export function parseBrowseFilters(
  params: Record<string, string | string[] | undefined>,
): BrowseFilters {
  const first = (key: string) => {
    const value = params[key];
    const text = Array.isArray(value) ? value[0] : value;
    return text === "" ? undefined : text;
  };
  return browseFiltersSchema.parse({
    search: first("search") ?? "",
    type: first("type"),
    skills: first("skills") ?? "",
    maxHours: first("maxHours"),
    duration: first("duration"),
  });
}

// Starting values for the "New post" form.
export const emptyPost: PostFormInput = {
  title: "",
  description: "",
  type: "need-builders",
  roles: "",
  requiredSkills: "",
  niceSkills: "",
  hoursPerWeek: "",
  duration: "1-month",
  timezone: "",
  requiredLinks: [],
};
