import "server-only";

import { asc, eq, sql } from "drizzle-orm";

import type { Viewer } from "@/server/auth";
import { db } from "@/server/db";
import {
  profile,
  profilePrivate,
  profileSkill,
  skill,
} from "@/server/db/schema";

import {
  type Relationship,
  type VisiblePrivateDetails,
  visiblePrivateDetails,
} from "./rules";

export type PublicProfile = Awaited<ReturnType<typeof getProfileByUsername>>;

// A profile as other signed-in users see it, or null if there's no such
// username. Only public fields are selected: nothing from docs/privacy.md's
// "Collaborators" rows can end up on the page by accident.
export async function getProfileByUsername(_viewer: Viewer, username: string) {
  // `_viewer` isn't used yet: any signed-in user may view any profile.
  // Requiring it means nobody can call this without signing in first, and
  // later rules (e.g. blocking) have a place to go.
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

  const skills = await db
    .select({ name: skill.name })
    .from(profileSkill)
    .innerJoin(skill, eq(profileSkill.skillId, skill.id))
    .where(eq(profileSkill.userId, row.userId))
    .orderBy(asc(skill.name));

  return { ...row, skills: skills.map((s) => s.name) };
}

// How the viewer is related to `userId`. Collaborators and reviewers come
// from applications, which arrive in M6/M7; until then everyone else is a
// stranger, which is the safe default (they see the least).
async function getRelationship(
  viewer: Viewer,
  userId: string,
): Promise<Relationship> {
  if (viewer.id === userId) return "self";
  return "stranger";
}

// The ONLY way to read profile_private. It returns just the fields this
// viewer is allowed to see (rules in ./rules.ts, docs/privacy.md).
export async function getPrivateProfile(
  viewer: Viewer,
  userId: string,
): Promise<VisiblePrivateDetails> {
  const [details] = await db
    .select()
    .from(profilePrivate)
    .where(eq(profilePrivate.userId, userId));
  if (!details) return { links: {} };

  const relationship = await getRelationship(viewer, userId);
  return visiblePrivateDetails(relationship, details);
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
