"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";

import { requireProfile } from "@/server/auth";
import { db } from "@/server/db";
import { application, post, postRole } from "@/server/db/schema";

import { applicationStatusSchema } from "./schemas";

// Accept, reject, or move an application back to pending. Bound by the
// applicants page: setApplicationStatus.bind(null, applicationId, status).
// Both bound values travel through the browser, so both are checked here.
export async function setApplicationStatus(
  applicationId: string,
  status: string,
  formData: FormData,
) {
  const viewer = await requireProfile();
  const id = z.uuid().safeParse(applicationId);
  const newStatus = applicationStatusSchema.safeParse(status);
  if (!id.success || !newStatus.success) notFound();

  // The Accept form has an optional "also mark the role filled" checkbox.
  const fillRole =
    newStatus.data === "accepted" && formData.get("fillRole") === "on";

  // Two tables may change (application, post_role), so it's one
  // transaction: either both changes are saved, or neither is.
  const found = await db.transaction(async (tx) => {
    // Find the application AND check ownership in one query: the join only
    // matches if the post belongs to the viewer.
    const [app] = await tx
      .select({ id: application.id, roleId: application.roleId })
      .from(application)
      .innerJoin(post, eq(post.id, application.postId))
      .where(and(eq(application.id, id.data), eq(post.ownerId, viewer.id)));
    if (!app) return false;

    await tx
      .update(application)
      .set({ status: newStatus.data })
      .where(eq(application.id, app.id));

    if (fillRole && app.roleId) {
      await tx
        .update(postRole)
        .set({ filled: true })
        .where(eq(postRole.id, app.roleId));
    }
    return true;
  });
  // Not the viewer's post (or no such application): same as missing.
  if (!found) notFound();

  // Re-render the page the button was on, keeping its tab.
  refresh();
}
