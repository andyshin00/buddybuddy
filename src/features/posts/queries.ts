import "server-only";

import {
  and,
  asc,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  lte,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import { z } from "zod";

import type { Viewer } from "@/server/auth";
import { db } from "@/server/db";
import {
  post,
  postQuestion,
  postRole,
  postSkill,
  profile,
  skill,
} from "@/server/db/schema";

import { canManagePost } from "./rules";
import type { BrowseFilters } from "./schemas";

// The columns every post read needs, plus the owner's public name.
const postColumns = {
  id: post.id,
  ownerId: post.ownerId,
  ownerUsername: profile.username,
  ownerDisplayName: profile.displayName,
  title: post.title,
  description: post.description,
  type: post.type,
  status: post.status,
  hoursPerWeek: post.hoursPerWeek,
  duration: post.duration,
  timezone: post.timezone,
  requiredLinks: post.requiredLinks,
  createdAt: post.createdAt,
};

// Roles and skills for a list of posts, in two queries (not two per post).
async function loadRolesAndSkills(postIds: string[]) {
  if (postIds.length === 0) return { roles: [], skills: [] };
  const [roles, skills] = await Promise.all([
    db
      .select({
        id: postRole.id,
        postId: postRole.postId,
        name: postRole.name,
        filled: postRole.filled,
      })
      .from(postRole)
      .where(inArray(postRole.postId, postIds))
      .orderBy(asc(postRole.position)),
    db
      .select({
        postId: postSkill.postId,
        name: skill.name,
        kind: postSkill.kind,
      })
      .from(postSkill)
      .innerJoin(skill, eq(skill.id, postSkill.skillId))
      .where(inArray(postSkill.postId, postIds))
      .orderBy(asc(skill.name)),
  ]);
  return { roles, skills };
}

type PostRow = Awaited<ReturnType<typeof selectPosts>>[number];

function selectPosts(where: SQL | undefined, limit: number) {
  return db
    .select(postColumns)
    .from(post)
    .innerJoin(profile, eq(profile.userId, post.ownerId))
    .where(where)
    .orderBy(desc(post.createdAt))
    .limit(limit);
}

// Attach each post's roles and skills.
async function withRolesAndSkills(rows: PostRow[]) {
  const { roles, skills } = await loadRolesAndSkills(rows.map((r) => r.id));
  return rows.map((row) => ({
    ...row,
    roles: roles.filter((r) => r.postId === row.id),
    requiredSkills: skills
      .filter((s) => s.postId === row.id && s.kind === "required")
      .map((s) => s.name),
    niceSkills: skills
      .filter((s) => s.postId === row.id && s.kind === "nice")
      .map((s) => s.name),
  }));
}

export type PostDetail = Awaited<ReturnType<typeof withRolesAndSkills>>[number];

// A single post also carries its application questions, in order.
export type PostWithQuestions = PostDetail & {
  questions: {
    id: string;
    type: (typeof postQuestion.$inferSelect)["type"];
    label: string;
    required: boolean;
    options: string[];
  }[];
};

// `%` and `_` are wildcards in LIKE; escape them so they match literally.
function escapeLike(text: string) {
  return text.replace(/[\\%_]/g, "\\$&");
}

// Browse page: open posts matching the filters, newest first.
// Each filter in the URL becomes one SQL condition; all must match.
export async function searchPosts(
  _viewer: Viewer, // signed-in users only (docs/privacy.md)
  filters: BrowseFilters,
): Promise<PostDetail[]> {
  const conditions: SQL[] = [eq(post.status, "open")];

  if (filters.search) {
    const pattern = `%${escapeLike(filters.search)}%`;
    conditions.push(
      or(ilike(post.title, pattern), ilike(post.description, pattern))!,
    );
  }
  if (filters.type) conditions.push(eq(post.type, filters.type));
  if (filters.duration) conditions.push(eq(post.duration, filters.duration));
  if (filters.maxHours) {
    conditions.push(lte(post.hoursPerWeek, filters.maxHours));
  }
  if (filters.skills.length > 0) {
    // "Has ANY of these skills": a post_skill row exists for this post
    // whose skill name matches one of them (ignoring capitals).
    const wanted = filters.skills.map((s) => s.toLowerCase());
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(postSkill)
          .innerJoin(skill, eq(skill.id, postSkill.skillId))
          .where(
            and(
              eq(postSkill.postId, post.id),
              inArray(sql`lower(${skill.name})`, wanted),
            ),
          ),
      ),
    );
  }

  const rows = await selectPosts(and(...conditions), 50);
  return withRolesAndSkills(rows);
}

// One post, open or closed, for any signed-in viewer. Null if it doesn't exist.
export async function getPost(
  _viewer: Viewer,
  postId: string,
): Promise<PostWithQuestions | null> {
  // A malformed id can't match anything; checking first avoids a database error.
  if (!z.uuid().safeParse(postId).success) return null;

  const [row] = await selectPosts(eq(post.id, postId), 1);
  if (!row) return null;
  const [detail] = await withRolesAndSkills([row]);
  const questions = await db
    .select({
      id: postQuestion.id,
      type: postQuestion.type,
      label: postQuestion.label,
      required: postQuestion.required,
      options: postQuestion.options,
    })
    .from(postQuestion)
    .where(eq(postQuestion.postId, postId))
    .orderBy(asc(postQuestion.position));
  return { ...detail, questions };
}

// A post the viewer may edit/close/reopen, or null. Someone else's post
// gives the same null as a missing one, so the page shows "not found" and
// doesn't reveal anything (architecture rule 4).
export async function getOwnPost(
  viewer: Viewer,
  postId: string,
): Promise<PostWithQuestions | null> {
  const found = await getPost(viewer, postId);
  if (!found || !canManagePost(viewer, found)) return null;
  return found;
}
