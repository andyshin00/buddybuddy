import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { applyToPost } from "@/features/applications/actions";
import { ApplyForm } from "@/features/applications/components/apply-form";
import { getApplyContext } from "@/features/applications/queries";
import { openRoles } from "@/features/applications/rules";
import { requireProfile } from "@/server/auth";

export const metadata: Metadata = { title: "Apply · BuddyBuddy" };

export default function ApplyPage({ params }: PageProps<"/posts/[id]/apply">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <Apply params={params} />
      </Suspense>
    </main>
  );
}

async function Apply({
  params,
}: Pick<PageProps<"/posts/[id]/apply">, "params">) {
  const viewer = await requireProfile();
  const { id } = await params;

  const context = await getApplyContext(viewer, id);
  if (!context) notFound();
  const { post, blocker } = context;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-zinc-500">Applying to</p>
        <h1 className="text-2xl font-semibold">
          <Link href={`/posts/${post.id}`} className="hover:underline">
            {post.title}
          </Link>
        </h1>
      </div>

      {blocker ? (
        // Can't apply: say why, and what to do about it.
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p>{blocker.reason}</p>
          {blocker.missingLinks && (
            <Link href="/settings/profile" className="text-sm underline">
              Add them on your profile
            </Link>
          )}
        </div>
      ) : (
        <ApplyForm
          action={applyToPost.bind(null, post.id)}
          roles={openRoles(post.roles).map(({ id, name }) => ({ id, name }))}
          questions={post.questions}
        />
      )}
    </div>
  );
}
