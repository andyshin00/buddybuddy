import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { timeAgo } from "@/features/posts/components/time-ago";
import { getMyPosts } from "@/features/reviewing/queries";
import { requireProfile } from "@/server/auth";

export const metadata: Metadata = { title: "My posts · BuddyBuddy" };

export default function MyPostsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">My posts</h1>
        <Link
          href="/posts/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New post
        </Link>
      </div>
      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <MyPosts />
      </Suspense>
    </main>
  );
}

async function MyPosts() {
  const viewer = await requireProfile();
  const posts = await getMyPosts(viewer);

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="font-medium">You haven&apos;t posted a project yet.</p>
        <Link href="/posts/new" className="text-sm underline">
          Post your first project
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {posts.map((p) => (
        <li
          key={p.id}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Link
              href={`/posts/${p.id}`}
              className="font-medium hover:underline"
            >
              {p.title}
            </Link>
            <p className="text-sm text-zinc-500">
              {p.status === "closed" ? "Closed" : "Open"} · {p.filledRoles} of{" "}
              {p.roles} roles filled · posted {timeAgo(p.createdAt)}
            </p>
          </div>
          <Link
            href={`/posts/${p.id}/applicants`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {p.applicants} {p.applicants === 1 ? "applicant" : "applicants"}
            {p.pending > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                {p.pending} pending
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
