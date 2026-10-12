import { z } from "zod";

// Zod building blocks for forms. Form fields always arrive as strings.

// An empty (or spaces-only) box means "not set": null.
export const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

export const optionalText = (max: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable());

// "React, TypeScript,, react" → ["React", "TypeScript"]
// Splits on commas, trims, drops empties and case-insensitive duplicates.
export function commaList(options: {
  maxItems: number;
  maxLength: number;
  noun: string; // used in error messages, e.g. "skill"
}) {
  return z
    .string()
    .transform((text) => {
      const seen = new Set<string>();
      return text
        .split(",")
        .map((item) => item.trim())
        .filter((item) => {
          const key = item.toLowerCase();
          if (!item || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    })
    .pipe(
      z
        .array(
          z
            .string()
            .max(
              options.maxLength,
              `Each ${options.noun} must be ${options.maxLength} characters or fewer.`,
            ),
        )
        .max(
          options.maxItems,
          `List up to ${options.maxItems} ${options.noun}s.`,
        ),
    );
}
