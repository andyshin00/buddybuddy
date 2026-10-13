import { z } from "zod";

import { applicationStatus } from "@/server/db/schema";

export const applicationStatusSchema = z.enum(applicationStatus.enumValues);

// The tab on the applicants page comes from the URL (?status=pending).
// Anything unexpected falls back to "all" instead of an error.
export const reviewTabSchema = z
  .enum(["all", ...applicationStatus.enumValues])
  .catch("all");

export type ReviewTab = z.infer<typeof reviewTabSchema>;
