import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { getPost } from "@/features/posts/queries";
import type { Viewer } from "@/server/auth";
import { db } from "@/server/db";
import { application, post, profile, profilePrivate } from "@/server/db/schema";

import { getApplyBlocker } from "./rules";

// Everything the post page and the apply page need to decide what to show:
// the post, the viewer's existing application (if any), and why they can't
// apply (if they can't). Null if the post doesn't exist.
export async function getApplyContext(viewer: Viewer, postId: string) {
  const found = await getPost(viewer, postId);
  if (!found) return null;

  const [[existing], [links]] = await Promise.all([
    db
      .select({ id: application.id, status: application.status })
      .from(application)
      .where(
        and(
          eq(application.postId, found.id),
          eq(application.applicantId, viewer.id),
        ),
      ),
    // The viewer's OWN links, only to check whether required ones exist.
    db
      .select({
        github: profilePrivate.githubUrl,
        linkedin: profilePrivate.linkedinUrl,
        portfolio: profilePrivate.portfolioUrl,
      })
      .from(profilePrivate)
      .where(eq(profilePrivate.userId, viewer.id)),
  ]);

  const blocker = getApplyBlocker(found, {
    id: viewer.id,
    links: links ?? {},
    alreadyApplied: Boolean(existing),
  });

  return { post: found, myApplication: existing ?? null, blocker };
}

// "My applications": everything the viewer has applied to, newest first.
export async function getMyApplications(viewer: Viewer) {
  return db
    .select({
      id: application.id,
      status: application.status,
      roleName: application.roleName,
      createdAt: application.createdAt,
      postId: post.id,
      postTitle: post.title,
      postStatus: post.status,
      ownerUsername: profile.username,
    })
    .from(application)
    .innerJoin(post, eq(post.id, application.postId))
    .innerJoin(profile, eq(profile.userId, post.ownerId))
    .where(eq(application.applicantId, viewer.id))
    .orderBy(desc(application.createdAt));
}
