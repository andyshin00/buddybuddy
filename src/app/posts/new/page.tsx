import type { Metadata } from "next";
import { Suspense } from "react";

import { createPost } from "@/features/posts/actions";
import { PostForm } from "@/features/posts/components/post-form";
import { emptyPost } from "@/features/posts/schemas";
import { requireProfile } from "@/server/auth";

export const metadata: Metadata = { title: "New post · BuddyBuddy" };

export default function NewPostPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">New post</h1>
      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <NewPost />
      </Suspense>
    </main>
  );
}

async function NewPost() {
  await requireProfile(); // signed in, with a username
  return (
    <PostForm
      action={createPost}
      initial={emptyPost}
      submitLabel="Publish post"
    />
  );
}
