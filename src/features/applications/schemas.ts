import { z } from "zod";

import type { QuestionType } from "@/lib/constants";

// A question as the apply form sees it.
export type ApplyQuestion = {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  options: string[];
};

export const YES_NO = ["Yes", "No"] as const;

// Builds a Zod schema for ONE post's questions. Every post asks different
// things, so the schema is made at the moment someone applies, from that
// post's questions. Answers are keyed by question id.
export function buildAnswersSchema(questions: ApplyQuestion[]) {
  const shape: Record<string, z.ZodType<string | string[] | undefined>> = {};

  for (const q of questions) {
    const required = "This question is required.";
    let field: z.ZodType<string | string[] | undefined>;

    switch (q.type) {
      case "short":
      case "long": {
        const max = q.type === "short" ? 200 : 3000;
        const text = z
          .string()
          .trim()
          .max(max, `Keep this under ${max} characters.`);
        field = q.required ? text.min(1, required) : text.optional();
        break;
      }
      case "dropdown":
      case "yesno": {
        const choices = q.type === "yesno" ? [...YES_NO] : q.options;
        const choice = z.enum(
          choices as [string, ...string[]],
          q.required ? required : "Choose one of the options.",
        );
        // An empty value means "not answered".
        field = z.preprocess(
          (value) => (value === "" ? undefined : value),
          q.required ? choice : choice.optional(),
        );
        break;
      }
      case "multi": {
        const picks = z.array(
          z.enum(
            q.options as [string, ...string[]],
            "Choose from the options.",
          ),
        );
        field = q.required ? picks.min(1, required) : picks;
        break;
      }
    }
    shape[q.id] = field;
  }

  return z.object(shape);
}

// The rest of the apply form.
export const applyFormSchema = z.object({
  roleId: z.uuid("Choose a role."),
  message: z
    .string()
    .trim()
    .max(1000, "Keep your message under 1000 characters.")
    .transform((text) => (text === "" ? null : text)),
});
