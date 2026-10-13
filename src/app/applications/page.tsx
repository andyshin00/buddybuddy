import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { withdrawApplication } from "@/features/applications/actions";
import { StatusBadge } from "@/features/applications/components/status-badge";
import { getMyApplications } from "@/features/applications/queries";
import { timeAgo } from "@/features/posts/components/time-ago";
import { requireProfile } from "@/server/auth";

export const metadata: Metadata = { title: "My applications · BuddyBuddy" };

export default function MyApplicationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-semibold">My applications</h1>
      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <MyApplications />
      </Suspense>
    </main>
  );
}

async function MyApplications() {
  const viewer = await requireProfile();
  const applications = await getMyApplications(viewer);

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="font-medium">You haven&apos;t applied to anything yet.</p>
        <Link href="/" className="text-sm underline">
          Browse projects
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {applications.map((app) => (
        <li
          key={app.id}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Link
              href={`/posts/${app.postId}`}
              className="font-medium hover:underline"
            >
              {app.postTitle}
            </Link>
            <p className="text-sm text-zinc-500">
              {app.roleName} · posted by @{app.ownerUsername} · applied{" "}
              {timeAgo(app.createdAt)}
              {app.postStatus === "closed" && " · post closed"}
            </p>
            {app.ownerContact && (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Contact @{app.ownerUsername}:{" "}
                {[
                  app.ownerContact.realName,
                  app.ownerContact.email,
                  app.ownerContact.discord &&
                    `Discord ${app.ownerContact.discord}`,
                ]
                  .filter(Boolean)
                  .join(" · ") || "no contact details added yet"}
              </p>
            )}
          </div>
          <StatusBadge status={app.status} />
          {app.status === "pending" && (
            <form action={withdrawApplication.bind(null, app.id)}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Withdraw
              </button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
