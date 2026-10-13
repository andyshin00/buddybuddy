import "server-only";

import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";

import { getBlockState } from "@/features/safety/queries";
import type { Viewer } from "@/server/auth";
import { db } from "@/server/db";
import {
  application,
  post,
  profile,
  profilePrivate,
  profileSkill,
  skill,
} from "@/server/db/schema";

import {
  type ApplicationLink,
  relationshipFrom,
  type VisiblePrivateDetails,
  visiblePrivateDetails,
} from "./rules";

export type PublicProfile = Awaited<ReturnType<typeof getProfileByUsername>>;

// A profile as other signed-in users see it, or null if there's no such
// username (or they blocked the viewer). Only public fields are selected: nothing from docs/privacy.md's
// "Collaborators" rows can end up on the page by accident.
export async function getProfileByUsername(viewer: Viewer, username: string) {
  // Any signed-in user may view any profile, except someone who blocked
  // them: to them, the profile looks like it doesn't exist.
  const [row] = await db
    .select({
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      headline: profile.headline,
      bio: profile.bio,
      experience: profile.experience,
      hoursPerWeek: profile.hoursPerWeek,
      timezone: profile.timezone,
    })
    .from(profile)
    // Case-insensitive, matching the unique index: /u/Maya finds "maya".
    .where(eq(sql`lower(${profile.username})`, username.toLowerCase()));

  if (!row) return null;
  if ((await getBlockState(viewer, row.userId)).blockedMe) return null;

  const skills = await db
    .select({ name: skill.name })
    .from(profileSkill)
    .innerJoin(skill, eq(profileSkill.skillId, skill.id))
    .where(eq(profileSkill.userId, row.userId))
    .orderBy(asc(skill.name));

  return { ...row, skills: skills.map((s) => s.name) };
}

// The applications that connect the viewer with any of `userIds`, in
// either direction. This is what decides "collaborator" and "reviewer".
async function getApplicationLinks(
  viewer: Viewer,
  userIds: string[],
): Promise<ApplicationLink[]> {
  return db
    .select({
      applicantId: application.applicantId,
      ownerId: post.ownerId,
      status: application.status,
    })
    .from(application)
    .innerJoin(post, eq(post.id, application.postId))
    .where(
      or(
        // They applied to the viewer's post...
        and(
          eq(post.ownerId, viewer.id),
          inArray(application.applicantId, userIds),
        ),
        // ...or the viewer applied to theirs.
        and(
          eq(application.applicantId, viewer.id),
          inArray(post.ownerId, userIds),
        ),
      ),
    );
}

// The ONLY way to read profile_private. For each user id, it returns just
// the fields this viewer is allowed to see (rules in ./rules.ts,
// docs/privacy.md). Users with no private details get `{ links: {} }`.
// Works for a whole list at once, so a page of applicants is 2 queries.
export async function getPrivateProfiles(
  viewer: Viewer,
  userIds: string[],
): Promise<Map<string, VisiblePrivateDetails>> {
  const result = new Map<string, VisiblePrivateDetails>();
  if (userIds.length === 0) return result;

  const [rows, links] = await Promise.all([
    db
      .select()
      .from(profilePrivate)
      .where(inArray(profilePrivate.userId, userIds)),
    getApplicationLinks(viewer, userIds),
  ]);

  for (const userId of userIds) {
    const details = rows.find((row) => row.userId === userId);
    const relationship = relationshipFrom(viewer.id, userId, links);
    result.set(
      userId,
      details ? visiblePrivateDetails(relationship, details) : { links: {} },
    );
  }
  return result;
}

// The same, for one user.
export async function getPrivateProfile(
  viewer: Viewer,
  userId: string,
): Promise<VisiblePrivateDetails> {
  const all = await getPrivateProfiles(viewer, [userId]);
  return all.get(userId) ?? { links: {} };
}

// The projects on someone's profile: the ones they posted, and the ones
// they joined (an accepted application). Visible to any signed-in user.
export async function getProfileProjects(_viewer: Viewer, userId: string) {
  const [posted, joined] = await Promise.all([
    db
      .select({ id: post.id, title: post.title, status: post.status })
      .from(post)
      .where(eq(post.ownerId, userId))
      .orderBy(desc(post.createdAt)),
    db
      .select({
        id: post.id,
        title: post.title,
        roleName: application.roleName,
      })
      .from(application)
      .innerJoin(post, eq(post.id, application.postId))
      .where(
        and(
          eq(application.applicantId, userId),
          eq(application.status, "accepted"),
        ),
      )
      .orderBy(desc(application.updatedAt)),
  ]);
  return { posted, joined };
}

// Everything the edit form needs, for the viewer's OWN profile only. There's
// no userId parameter on purpose: you can't load someone else's this way.
export async function getOwnProfileForEdit(viewer: Viewer) {
  const [row] = await db
    .select({ profile, private: profilePrivate })
    .from(profile)
    .leftJoin(profilePrivate, eq(profilePrivate.userId, profile.userId))
    .where(eq(profile.userId, viewer.id));
  if (!row) return null;

  const skills = await db
    .select({ name: skill.name })
    .from(profileSkill)
    .innerJoin(skill, eq(profileSkill.skillId, skill.id))
    .where(eq(profileSkill.userId, viewer.id))
    .orderBy(asc(skill.name));

  return { ...row, skills: skills.map((s) => s.name) };
}
