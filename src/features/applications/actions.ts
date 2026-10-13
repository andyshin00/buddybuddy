"use server";

import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { requireProfile } from "@/server/auth";
import { db } from "@/server/db";
import { isUniqueViolation } from "@/server/db/errors";
import { type AnswerSnapshot, application } from "@/server/db/schema";

import { getApplyContext } from "./queries";
import { openRoles } from "./rules";
import { applyFormSchema, buildAnswersSchema } from "./schemas";

export type ApplyFormState = {
  formError?: string; // a problem with the whole form, shown at the top
  fieldErrors?: Record<string, string[]>; // keyed by "roleId", "message" or a question id
  values?: Record<string, string | string[]>; // what was entered, kept after an error
};

// Bound to a post id by the apply page: applyToPost.bind(null, postId).
export async function applyToPost(
  postId: string,
  _previous: ApplyFormState,
  formData: FormData,
): Promise<ApplyFormState> {
  // 1. Who's asking, and may they apply to this post? (The same rules the
  //    page used to show the form; checked again because things change.)
  const viewer = await requireProfile();
  const context = await getApplyContext(viewer, postId);
  if (!context) notFound();
  const { post, blocker } = context;
  if (blocker) return { formError: blocker.reason };

  // 2. Read and check the input. Question answers arrive as fields named
  //    after each question's id; checkboxes may send several values.
  const answersInput: Record<string, string | string[]> = {};
  for (const q of post.questions) {
    answersInput[q.id] =
      q.type === "multi"
        ? formData.getAll(q.id).map(String)
        : String(formData.get(q.id) ?? "");
  }
  const formInput = {
    roleId: String(formData.get("roleId") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const values = { ...answersInput, ...formInput };

  const form = applyFormSchema.safeParse(formInput);
  const answers = buildAnswersSchema(post.questions).safeParse(answersInput);
  const role = openRoles(post.roles).find(
    (r) => form.success && r.id === form.data.roleId,
  );
  if (!form.success || !answers.success || !role) {
    const fieldErrors: Record<string, string[]> = {
      ...(form.success ? {} : z.flattenError(form.error).fieldErrors),
      ...(answers.success ? {} : z.flattenError(answers.error).fieldErrors),
    };
    if (form.success && !role) {
      fieldErrors.roleId = ["Choose one of the open roles."];
    }
    return { values, fieldErrors };
  }

  // 3. Save it, with a copy of each question next to its answer.
  const snapshot: AnswerSnapshot[] = post.questions.flatMap((q) => {
    const value = answers.data[q.id];
    const skipped =
      value === undefined ||
      (Array.isArray(value) ? value.length === 0 : value === "");
    return skipped
      ? []
      : [{ questionId: q.id, label: q.label, type: q.type, value }];
  });

  try {
    await db.insert(application).values({
      postId: post.id,
      applicantId: viewer.id,
      roleId: role.id,
      roleName: role.name,
      message: form.data.message,
      answers: snapshot,
    });
  } catch (error) {
    // Two submits at once: the database's unique index stops the second.
    if (isUniqueViolation(error)) {
      return { formError: "You’ve already applied to this project." };
    }
    throw error;
  }

  redirect("/applications");
}

// Withdraw (delete) one of your own PENDING applications. The WHERE clause
// does the authorization: it only matches if the application is yours and
// still pending. Anything else deletes nothing, and the result is the same.
export async function withdrawApplication(applicationId: string) {
  const viewer = await requireProfile();
  if (!z.uuid().safeParse(applicationId).success) notFound();

  await db
    .delete(application)
    .where(
      and(
        eq(application.id, applicationId),
        eq(application.applicantId, viewer.id),
        eq(application.status, "pending"),
      ),
    );

  redirect("/applications");
}
