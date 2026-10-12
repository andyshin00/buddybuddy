import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { BrowseFilters } from "@/features/posts/components/browse-filters";
import { PostCard } from "@/features/posts/components/post-card";
import { searchPosts } from "@/features/posts/queries";
import { parseBrowseFilters } from "@/features/posts/schemas";
import { getViewer } from "@/server/auth";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<p className="p-6 text-zinc-500">Loading…</p>}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}

// Signed out: a short welcome. Signed in: the list of open posts.
async function HomeContent({
  searchParams,
}: Pick<PageProps<"/">, "searchParams">) {
  const viewer = await getViewer();
  if (!viewer) return <Welcome />;
  if (!viewer.username) redirect("/onboarding");

  const filters = parseBrowseFilters(await searchParams);
  const posts = await searchPosts(viewer, filters);
  const filtered =
    filters.search ||
    filters.type ||
    filters.duration ||
    filters.maxHours ||
    filters.skills.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects looking for people</h1>
        <Link
          href="/posts/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New post
        </Link>
      </div>

      <BrowseFilters filters={filters} />

      {posts.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} viewerId={viewer.id} />
          ))}
        </ul>
      ) : (
        // Empty states: say why the list is empty and what to do next.
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          {filtered ? (
            <>
              <p className="font-medium">No posts match these filters.</p>
              <Link href="/" className="text-sm underline">
                Clear filters
              </Link>
            </>
          ) : (
            <>
              <p className="font-medium">No open projects yet.</p>
              <Link href="/posts/new" className="text-sm underline">
                Be the first to post one
              </Link>
            </>
          )}
        </div>
      )}
    </main>
  );
}

function Welcome() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">BuddyBuddy</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Find collaborators for the projects you want to build.
      </p>
      <Link
        href="/sign-in"
        className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Sign in to browse projects
      </Link>
    </main>
  );
}
