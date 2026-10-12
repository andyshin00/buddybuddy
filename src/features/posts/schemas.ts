import { z } from "zod";

import {
  DURATIONS,
  hasOptions,
  LINKS,
  POST_TYPES,
  QUESTION_TYPES,
  TIMEZONES,
} from "@/lib/constants";
import { commaList, emptyToNull } from "@/lib/form";

const postTypes = POST_TYPES.map((t) => t.value);
const durations = DURATIONS.map((d) => d.value);
const linkKeys = LINKS.map((l) => l.key);

// ---------------------------------------------------------------------------
// Application questions (the form builder). The editor sends them as one
// JSON string in a hidden form field; this turns it back into a checked list.
// ---------------------------------------------------------------------------

export const MAX_QUESTIONS = 10;

const questionSchema = z.object({
  type: z.enum(QUESTION_TYPES.map((t) => t.value)),
  label: z.string().trim().max(200, "Keep each question under 200 characters."),
  required: z.boolean(),
  options: z.array(
    z.string().trim().max(80, "Keep each choice under 80 characters."),
  ),
});

export const questionsSchema = z
  .string()
  .transform((text, ctx) => {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "The questions couldn't be read.",
      });
      return z.NEVER;
    }
  })
  .pipe(
    z
      .array(questionSchema)
      .max(MAX_QUESTIONS, `Ask at most ${MAX_QUESTIONS} questions.`),
  )
  // Clean up: drop blank choices, and choices on types that don't use them.
  .transform((questions) =>
    questions.map((q) => ({
      ...q,
      options: hasOptions(q.type) ? q.options.filter((o) => o !== "") : [],
    })),
  )
  // Messages name the question number, since they're shown under the whole list.
  .superRefine((questions, ctx) => {
    questions.forEach((q, i) => {
      const n = `Question ${i + 1}`;
      if (q.label === "") {
        ctx.addIssue({ code: "custom", message: `${n}: write the question.` });
      }
      if (hasOptions(q.type)) {
        if (q.options.length < 2) {
          ctx.addIssue({
            code: "custom",
            message: `${n}: add at least 2 choices.`,
          });
        }
        if (q.options.length > 10) {
          ctx.addIssue({
            code: "custom",
            message: `${n}: use at most 10 choices.`,
          });
        }
        const lower = q.options.map((o) => o.toLowerCase());
        if (new Set(lower).size !== lower.length) {
          ctx.addIssue({
            code: "custom",
            message: `${n}: each choice must be different.`,
          });
        }
      }
    });
  });

export type QuestionData = z.output<typeof questionsSchema>[number];

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
    questions: questionsSchema,
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
  questions: "[]",
};
