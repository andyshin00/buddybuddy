import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { setRoleFilled } from "@/features/posts/actions";
import { ApplicantCard } from "@/features/reviewing/components/applicant-card";
import { getApplicantsForReview } from "@/features/reviewing/queries";
import { countByStatus } from "@/features/reviewing/rules";
import { reviewTabSchema } from "@/features/reviewing/schemas";
import { requireProfile } from "@/server/auth";

export const metadata: Metadata = { title: "Applicants · BuddyBuddy" };

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
] as const;

export default function ApplicantsPage(
  props: PageProps<"/posts/[id]/applicants">,
) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Suspense fallback={<p className="text-zinc-500">Loading applicants…</p>}>
        <Applicants {...props} />
      </Suspense>
    </main>
  );
}

async function Applicants({
  params,
  searchParams,
}: PageProps<"/posts/[id]/applicants">) {
  const viewer = await requireProfile();
  const { id } = await params;
  const tab = reviewTabSchema.parse((await searchParams).status);

  // null for someone else's post: they get the same 404 as a missing one.
  const review = await getApplicantsForReview(viewer, id);
  if (!review) notFound();
  const { post, applicants } = review;

  const counts = countByStatus(applicants);
  const shown =
    tab === "all" ? applicants : applicants.filter((a) => a.status === tab);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-zinc-500">Applicants for</p>
        <h1 className="text-2xl font-semibold">
          <Link href={`/posts/${post.id}`} className="hover:underline">
            {post.title}
          </Link>
        </h1>
      </div>

      <section>
        <h2 className="mb-2 font-medium">Roles</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {post.roles.map((role) => (
            <li key={role.id} className="flex items-center gap-3">
              <span>
                {role.name}
                {role.filled && (
                  <span className="text-zinc-500"> (filled)</span>
                )}
              </span>
              <form
                action={setRoleFilled.bind(
                  null,
                  post.id,
                  role.id,
                  !role.filled,
                )}
              >
                <button type="submit" className="text-zinc-500 underline">
                  {role.filled ? "Reopen role" : "Mark filled"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      {/* Tabs are links: the chosen tab lives in the URL (?status=…). */}
      <nav className="flex gap-1 border-b border-zinc-200 text-sm dark:border-zinc-800">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={
              t.value === "all"
                ? `/posts/${post.id}/applicants`
                : `/posts/${post.id}/applicants?status=${t.value}`
            }
            aria-current={tab === t.value ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-2 ${
              tab === t.value
                ? "border-zinc-900 font-medium dark:border-zinc-100"
                : "border-transparent text-zinc-500 hover:text-current"
            }`}
          >
            {t.label} ({counts[t.value]})
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          {applicants.length === 0
            ? "No one has applied yet."
            : "No applicants in this tab."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {shown.map((applicant) => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              role={post.roles.find((r) => r.id === applicant.roleId)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
