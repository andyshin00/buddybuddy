import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { StatusBadge } from "@/features/applications/components/status-badge";
import { getApplyContext } from "@/features/applications/queries";
import { setPostStatus } from "@/features/posts/actions";
import { PostTypeBadge } from "@/features/posts/components/post-type-badge";
import { timeAgo } from "@/features/posts/components/time-ago";

import { canManagePost } from "@/features/posts/rules";
import { submitReport } from "@/features/safety/actions";
import { ReportForm } from "@/features/safety/components/report-form";
import { DURATIONS, LINKS, QUESTION_TYPES } from "@/lib/constants";
import { requireProfile } from "@/server/auth";

const buttonClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900";

export default function PostPage({ params }: PageProps<"/posts/[id]">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Suspense fallback={<p className="text-zinc-500">Loading post…</p>}>
        <Post params={params} />
      </Suspense>
    </main>
  );
}

async function Post({ params }: Pick<PageProps<"/posts/[id]">, "params">) {
  const viewer = await requireProfile();
  const { id } = await params;

  const context = await getApplyContext(viewer, id);
  if (!context) notFound();
  const { post, myApplication, blocker } = context;

  const isOwner = canManagePost(viewer, post);
  const duration = DURATIONS.find((d) => d.value === post.duration)?.label;
  const requiredLinks = LINKS.filter((l) => post.requiredLinks.includes(l.key));
  const skillGroups = [
    { title: "Required skills", skills: post.requiredSkills },
    { title: "Nice to have", skills: post.niceSkills },
  ].filter((group) => group.skills.length > 0);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <PostTypeBadge type={post.type} />
          {post.status === "closed" && (
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">
              Closed
            </span>
          )}
        </div>
        <h1 className="text-2xl font-semibold">{post.title}</h1>
        <p className="text-sm text-zinc-500">
          Posted by{" "}
          <Link href={`/u/${post.ownerUsername}`} className="underline">
            @{post.ownerUsername}
          </Link>{" "}
          · {timeAgo(post.createdAt)}
        </p>
      </header>

      {isOwner && (
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/posts/${post.id}/applicants`}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Review applicants
          </Link>
          <Link href={`/posts/${post.id}/edit`} className={buttonClass}>
            Edit
          </Link>
          {/* The button calls the setPostStatus Server Action. */}
          <form
            action={setPostStatus.bind(
              null,
              post.id,
              post.status === "open" ? "closed" : "open",
            )}
          >
            <button type="submit" className={buttonClass}>
              {post.status === "open" ? "Close post" : "Reopen post"}
            </button>
          </form>
        </div>
      )}

      {/* Everyone except the owner: apply, or see why they can't. */}
      {!isOwner &&
        (myApplication ? (
          <p className="flex flex-wrap items-center gap-2 text-sm">
            You applied <StatusBadge status={myApplication.status} />
            <Link href="/applications" className="underline">
              My applications
            </Link>
          </p>
        ) : blocker ? (
          <div className="flex flex-col gap-1 text-sm">
            <button
              type="button"
              disabled
              className="self-start rounded-md bg-zinc-900 px-4 py-2 font-medium text-white opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Apply
            </button>
            <p className="text-zinc-500">
              {blocker.reason}{" "}
              {blocker.missingLinks && (
                <Link href="/settings/profile" className="underline">
                  Edit your profile
                </Link>
              )}
            </p>
          </div>
        ) : (
          <Link
            href={`/posts/${post.id}/apply`}
            className="self-start rounded-md bg-zinc-900 px-4 py-2 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Apply
          </Link>
        ))}

      <p className="whitespace-pre-line">{post.description}</p>

      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-zinc-500">Time</dt>
        <dd>
          {post.hoursPerWeek} hrs/week · {duration}
        </dd>
        <dt className="text-zinc-500">Timezone</dt>
        <dd>{post.timezone ?? "No preference"}</dd>
        {requiredLinks.length > 0 && (
          <>
            <dt className="text-zinc-500">Required links</dt>
            <dd>{requiredLinks.map((l) => l.label).join(", ")}</dd>
          </>
        )}
      </dl>

      <section>
        <h2 className="mb-2 font-medium">Roles</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {post.roles.map((role) => (
            <li key={role.id}>
              {role.name}
              {role.filled && <span className="text-zinc-500"> (filled)</span>}
            </li>
          ))}
        </ul>
      </section>

      {skillGroups.map((group) => (
        <section key={group.title}>
          <h2 className="mb-2 font-medium">{group.title}</h2>
          <ul className="flex flex-wrap gap-2">
            {group.skills.map((name) => (
              <li
                key={name}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
              >
                {name}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {post.questions.length > 0 && (
        <section>
          <h2 className="mb-2 font-medium">Application questions</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm">
            {post.questions.map((q) => (
              <li key={q.id}>
                {q.label}{" "}
                <span className="text-zinc-500">
                  ({QUESTION_TYPES.find((t) => t.value === q.type)?.label}
                  {q.required ? ", required" : ""})
                </span>
                {q.options.length > 0 && (
                  <span className="block text-zinc-500">
                    Choices: {q.options.join(" · ")}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {!isOwner && (
        <footer className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <ReportForm
            label="Report this post"
            action={submitReport.bind(null, { kind: "post", postId: post.id })}
          />
        </footer>
      )}
    </article>
  );
}
