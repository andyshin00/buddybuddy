"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";

import { getPost } from "@/features/posts/queries";
import { requireProfile } from "@/server/auth";
import { db } from "@/server/db";
import { block, profile, report } from "@/server/db/schema";
import {
  enforceRateLimit,
  isRateLimited,
  TOO_MANY_REQUESTS,
} from "@/server/rate-limit";

import {
  type ReportTarget,
  reportFormSchema,
  reportTargetSchema,
} from "./schemas";

// Block someone. Bound by the profile page: blockUser.bind(null, userId).
export async function blockUser(userId: string) {
  const viewer = await requireProfile();
  const id = z.string().min(1).safeParse(userId);
  if (!id.success || id.data === viewer.id) notFound();
  await enforceRateLimit("write", viewer.id);

  const [target] = await db
    .select({ userId: profile.userId })
    .from(profile)
    .where(eq(profile.userId, id.data));
  if (!target) notFound();

  // Blocking twice is fine: the second insert does nothing.
  await db
    .insert(block)
    .values({ blockerId: viewer.id, blockedId: target.userId })
    .onConflictDoNothing();
  refresh();
}

// Undo your own block. The WHERE clause only matches blocks you made.
export async function unblockUser(userId: string) {
  const viewer = await requireProfile();
  if (!z.string().min(1).safeParse(userId).success) notFound();
  await enforceRateLimit("write", viewer.id);

  await db
    .delete(block)
    .where(and(eq(block.blockerId, viewer.id), eq(block.blockedId, userId)));
  refresh();
}

export type ReportFormState = {
  formError?: string;
  fieldErrors?: { reason?: string[]; details?: string[] };
  sent?: boolean;
};

// Report a user or a post. Bound by the page:
// submitReport.bind(null, { kind: "post", postId }).
export async function submitReport(
  target: ReportTarget,
  _previous: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const viewer = await requireProfile();
  const parsedTarget = reportTargetSchema.safeParse(target);
  if (!parsedTarget.success) notFound();

  if (await isRateLimited("report", viewer.id)) {
    return { formError: TOO_MANY_REQUESTS };
  }

  const form = reportFormSchema.safeParse({
    reason: formData.get("reason") ?? "",
    details: String(formData.get("details") ?? ""),
  });
  if (!form.success) {
    return { fieldErrors: z.flattenError(form.error).fieldErrors };
  }

  // Work out who is being reported, and check they exist and aren't you.
  let targetUserId: string;
  let postId: string | null = null;
  if (parsedTarget.data.kind === "post") {
    const found = await getPost(viewer, parsedTarget.data.postId);
    if (!found) notFound();
    targetUserId = found.ownerId;
    postId = found.id;
  } else {
    const [found] = await db
      .select({ userId: profile.userId })
      .from(profile)
      .where(eq(profile.userId, parsedTarget.data.userId));
    if (!found) notFound();
    targetUserId = found.userId;
  }
  if (targetUserId === viewer.id) {
    return { formError: "You can’t report yourself." };
  }

  await db.insert(report).values({
    reporterId: viewer.id,
    targetUserId,
    postId,
    reason: form.data.reason,
    details: form.data.details,
  });
  return { sent: true };
}
