import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { updatePost } from "@/features/posts/actions";
import { PostForm } from "@/features/posts/components/post-form";
import { getOwnPost } from "@/features/posts/queries";
import { requireProfile } from "@/server/auth";

export const metadata: Metadata = { title: "Edit post · BuddyBuddy" };

export default function EditPostPage({
  params,
}: PageProps<"/posts/[id]/edit">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Edit post</h1>
      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <EditPost params={params} />
      </Suspense>
    </main>
  );
}

async function EditPost({
  params,
}: Pick<PageProps<"/posts/[id]/edit">, "params">) {
  const viewer = await requireProfile();
  const { id } = await params;

  // A post you don't own looks exactly like a missing one: 404.
  const post = await getOwnPost(viewer, id);
  if (!post) notFound();

  return (
    <PostForm
      action={updatePost.bind(null, post.id)}
      submitLabel="Save changes"
      initial={{
        title: post.title,
        description: post.description,
        type: post.type,
        roles: post.roles.map((role) => role.name).join(", "),
        requiredSkills: post.requiredSkills.join(", "),
        niceSkills: post.niceSkills.join(", "),
        hoursPerWeek: String(post.hoursPerWeek),
        duration: post.duration,
        timezone: post.timezone ?? "",
        requiredLinks: post.requiredLinks,
        questions: JSON.stringify(
          post.questions.map(({ type, label, required, options }) => ({
            type,
            label,
            required,
            options,
          })),
        ),
      }}
    />
  );
}
