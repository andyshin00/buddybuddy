import "server-only";

import { asc, count, desc, eq, inArray, sql } from "drizzle-orm";

import { getOwnPost } from "@/features/posts/queries";
import { getPrivateProfiles } from "@/features/profiles/queries";
import type { Viewer } from "@/server/auth";
import { db } from "@/server/db";
import {
  application,
  post,
  postRole,
  profile,
  profileSkill,
  skill,
} from "@/server/db/schema";

import { skillMatch } from "./rules";

// "My posts": the viewer's own posts, newest first, with how many people
// applied, how many of those still wait for an answer, and how many roles
// are filled. LEFT JOIN keeps posts with no applications (their count is 0).
export async function getMyPosts(viewer: Viewer) {
  const [posts, roles] = await Promise.all([
    db
      .select({
        id: post.id,
        title: post.title,
        status: post.status,
        createdAt: post.createdAt,
        applicants: count(application.id),
        pending:
          sql<number>`count(*) filter (where ${application.status} = 'pending')`.mapWith(
            Number,
          ),
      })
      .from(post)
      .leftJoin(application, eq(application.postId, post.id))
      .where(eq(post.ownerId, viewer.id))
      .groupBy(post.id)
      .orderBy(desc(post.createdAt)),
    db
      .select({ postId: postRole.postId, filled: postRole.filled })
      .from(postRole)
      .innerJoin(post, eq(post.id, postRole.postId))
      .where(eq(post.ownerId, viewer.id)),
  ]);

  return posts.map((p) => {
    const mine = roles.filter((r) => r.postId === p.id);
    return {
      ...p,
      roles: mine.length,
      filledRoles: mine.filter((r) => r.filled).length,
    };
  });
}

// The applicants page. Owner-only: someone else's post (or a missing one)
// gives null, so the page shows "not found" (architecture rule 4).
export async function getApplicantsForReview(viewer: Viewer, postId: string) {
  const found = await getOwnPost(viewer, postId);
  if (!found) return null;

  const rows = await db
    .select({
      id: application.id,
      status: application.status,
      roleId: application.roleId,
      roleName: application.roleName,
      message: application.message,
      answers: application.answers,
      createdAt: application.createdAt,
      // The applicant's PUBLIC profile fields.
      applicantId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      experience: profile.experience,
      hoursPerWeek: profile.hoursPerWeek,
      timezone: profile.timezone,
    })
    .from(application)
    .innerJoin(profile, eq(profile.userId, application.applicantId))
    .where(eq(application.postId, found.id))
    .orderBy(asc(application.createdAt));

  const ids = rows.map((r) => r.applicantId);
  const [skills, privateDetails] = await Promise.all([
    ids.length === 0
      ? []
      : db
          .select({ userId: profileSkill.userId, name: skill.name })
          .from(profileSkill)
          .innerJoin(skill, eq(skill.id, profileSkill.skillId))
          .where(inArray(profileSkill.userId, ids))
          .orderBy(asc(skill.name)),
    // Through the privacy gate: links for everyone who applied (they're
    // being reviewed), contact details only for accepted ones.
    getPrivateProfiles(viewer, ids),
  ]);

  const applicants = rows.map((row) => {
    const theirSkills = skills
      .filter((s) => s.userId === row.applicantId)
      .map((s) => s.name);
    return {
      ...row,
      skills: theirSkills,
      match: skillMatch(theirSkills, found),
      details: privateDetails.get(row.applicantId) ?? { links: {} },
    };
  });

  return { post: found, applicants };
}

export type Applicant = NonNullable<
  Awaited<ReturnType<typeof getApplicantsForReview>>
>["applicants"][number];
