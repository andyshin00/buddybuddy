"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { requireProfile } from "@/server/auth";
import { db } from "@/server/db";
import { post, postQuestion, postRole, postSkill } from "@/server/db/schema";
import { findOrCreateSkills } from "@/server/db/skills";
import {
  enforceRateLimit,
  isRateLimited,
  TOO_MANY_REQUESTS,
} from "@/server/rate-limit";

import { getOwnPost } from "./queries";
import {
  type PostFormData,
  postFormSchema,
  type PostFormInput,
} from "./schemas";

export type PostFormState = {
  formError?: string; // e.g. "doing that too often", shown at the top
  values?: PostFormInput; // what was typed, kept after an error
  fieldErrors?: Partial<Record<keyof PostFormInput, string[]>>;
};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Read the form into the shape postFormSchema expects.
function readPostForm(formData: FormData): PostFormInput {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    title: text("title"),
    description: text("description"),
    type: text("type"),
    roles: text("roles"),
    requiredSkills: text("requiredSkills"),
    niceSkills: text("niceSkills"),
    hoursPerWeek: text("hoursPerWeek"),
    duration: text("duration"),
    timezone: text("timezone"),
    // Ticked checkboxes with the same name arrive as a list.
    requiredLinks: formData.getAll("requiredLinks").map(String),
    // The question editor puts the whole list in one hidden field, as JSON.
    questions: text("questions"),
  } as PostFormInput;
}

function validate(formData: FormData) {
  const values = readPostForm(formData);
  const parsed = postFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      data: null,
      state: {
        values,
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      } satisfies PostFormState,
    };
  }
  return { data: parsed.data, state: null };
}

function postColumns(data: PostFormData) {
  return {
    title: data.title,
    description: data.description,
    type: data.type,
    hoursPerWeek: data.hoursPerWeek,
    duration: data.duration,
    timezone: data.timezone,
    requiredLinks: data.requiredLinks,
  };
}

// Replace a post's application questions, keeping the order given.
// (Safe to replace: from M6, each application keeps its own copy of the
// questions it answered.)
async function saveQuestions(tx: Tx, postId: string, data: PostFormData) {
  await tx.delete(postQuestion).where(eq(postQuestion.postId, postId));
  if (data.questions.length === 0) return;
  await tx.insert(postQuestion).values(
    data.questions.map((question, position) => ({
      postId,
      position,
      ...question,
    })),
  );
}

// Replace a post's skill list (required + nice-to-have).
async function saveSkills(tx: Tx, postId: string, data: PostFormData) {
  await tx.delete(postSkill).where(eq(postSkill.postId, postId));
  const all = [...data.requiredSkills, ...data.niceSkills];
  if (all.length === 0) return;

  const ids = await findOrCreateSkills(tx, all);
  const required = new Set(data.requiredSkills.map((s) => s.toLowerCase()));
  await tx.insert(postSkill).values(
    all.map((name) => ({
      postId,
      skillId: ids.get(name.toLowerCase())!,
      kind: required.has(name.toLowerCase())
        ? ("required" as const)
        : ("nice" as const),
    })),
  );
}

// ---------------------------------------------------------------------------

export async function createPost(
  _previous: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  // 1. Who's asking, and are they posting too fast?
  const viewer = await requireProfile();
  if (await isRateLimited("post", viewer.id)) {
    return { values: readPostForm(formData), formError: TOO_MANY_REQUESTS };
  }

  // 2. Valid input?
  const { data, state } = validate(formData);
  if (!data) return state;

  // 3. Save the post, its roles and its skills together (one transaction).
  const postId = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(post)
      .values({ ownerId: viewer.id, ...postColumns(data) })
      .returning({ id: post.id });
    await tx.insert(postRole).values(
      data.roles.map((name, position) => ({
        postId: created.id,
        name,
        position,
      })),
    );
    await saveSkills(tx, created.id, data);
    await saveQuestions(tx, created.id, data);
    return created.id;
  });

  redirect(`/posts/${postId}`);
}

// Bound to a post id by the edit page: updatePost.bind(null, postId).
export async function updatePost(
  postId: string,
  _previous: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  // 1. Who's asking, and is it their post? Someone else's → "not found".
  const viewer = await requireProfile();
  const existing = await getOwnPost(viewer, postId);
  if (!existing) notFound();
  if (await isRateLimited("write", viewer.id)) {
    return { values: readPostForm(formData), formError: TOO_MANY_REQUESTS };
  }

  // 2. Valid input?
  const { data, state } = validate(formData);
  if (!data) return state;

  // 3. Save everything together.
  await db.transaction(async (tx) => {
    await tx.update(post).set(postColumns(data)).where(eq(post.id, postId));

    // Roles: keep the ones whose name is unchanged (applications will point
    // at them in M6), add new ones, remove the ones that were deleted.
    const byName = new Map(
      existing.roles.map((role) => [role.name.toLowerCase(), role]),
    );
    const kept = new Set<string>();
    for (const [position, name] of data.roles.entries()) {
      const match = byName.get(name.toLowerCase());
      if (match) {
        kept.add(match.id);
        await tx
          .update(postRole)
          .set({ name, position })
          .where(eq(postRole.id, match.id));
      } else {
        await tx.insert(postRole).values({ postId, name, position });
      }
    }
    for (const role of existing.roles) {
      if (!kept.has(role.id)) {
        await tx.delete(postRole).where(eq(postRole.id, role.id));
      }
    }

    await saveSkills(tx, postId, data);
    await saveQuestions(tx, postId, data);
  });

  redirect(`/posts/${postId}`);
}

// Close (stop accepting applicants) or reopen a post. Owner only.
export async function setPostStatus(postId: string, status: "open" | "closed") {
  const viewer = await requireProfile();
  const parsedStatus = z.enum(["open", "closed"]).parse(status);
  if (!(await getOwnPost(viewer, postId))) notFound();
  await enforceRateLimit("write", viewer.id);

  await db
    .update(post)
    .set({ status: parsedStatus })
    .where(eq(post.id, postId));

  redirect(`/posts/${postId}`);
}

// Mark one of the post's roles filled (or open again). Owner-only.
// Bound by the applicants page: setRoleFilled.bind(null, postId, roleId, true).
export async function setRoleFilled(
  postId: string,
  roleId: string,
  filled: boolean,
) {
  const viewer = await requireProfile();
  const parsed = z
    .object({ roleId: z.uuid(), filled: z.boolean() })
    .safeParse({ roleId, filled });
  if (!parsed.success || !(await getOwnPost(viewer, postId))) notFound();
  await enforceRateLimit("write", viewer.id);

  // `postId` in the WHERE too: a role id from another post matches nothing.
  await db
    .update(postRole)
    .set({ filled: parsed.data.filled })
    .where(
      and(eq(postRole.id, parsed.data.roleId), eq(postRole.postId, postId)),
    );

  refresh();
}
