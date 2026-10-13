import { z } from "zod";

import { optionalText } from "@/lib/form";
import { reportReason } from "@/server/db/schema";

export const reportFormSchema = z.object({
  reason: z.enum(reportReason.enumValues, "Choose a reason."),
  details: optionalText(1000),
});

// What can be reported. Bound into the action by the page, so it travels
// through the browser and is checked again on the server.
export const reportTargetSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("user"), userId: z.string().min(1) }),
  z.object({ kind: z.literal("post"), postId: z.uuid() }),
]);

export type ReportTarget = z.infer<typeof reportTargetSchema>;
