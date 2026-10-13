import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  getPrivateProfile,
  getProfileByUsername,
  getProfileProjects,
} from "@/features/profiles/queries";
import { EXPERIENCE_LEVELS, LINKS } from "@/lib/constants";
import { requireProfile } from "@/server/auth";

const EXPERIENCE_LABELS = Object.fromEntries(
  EXPERIENCE_LEVELS.map((level) => [level.value, level.label]),
);

export default function ProfilePage({ params }: PageProps<"/u/[username]">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Suspense fallback={<p className="text-zinc-500">Loading profile…</p>}>
        <Profile params={params} />
      </Suspense>
    </main>
  );
}

// Reads the session and the URL, so it sits inside <Suspense>.
async function Profile({ params }: Pick<PageProps<"/u/[username]">, "params">) {
  const viewer = await requireProfile(); // must be signed in, with a username
  const { username } = await params;

  const person = await getProfileByUsername(viewer, username);
  if (!person) notFound(); // shows the 404 page

  const name = person.displayName ?? person.username;
  const isYou = person.userId === viewer.id;
  // Only what this viewer is allowed to see (docs/privacy.md).
  const [details, projects] = await Promise.all([
    getPrivateProfile(viewer, person.userId),
    getProfileProjects(viewer, person.userId),
  ]);
  const visibleLinks = LINKS.filter((link) => details.links[link.key]);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        {/* Initials avatar, as in the prototype */}
        <div
          aria-hidden
          className="flex size-16 items-center justify-center rounded-full bg-zinc-800 text-2xl font-semibold text-white dark:bg-zinc-200 dark:text-zinc-900"
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">
            {name}{" "}
            {isYou && (
              <span className="text-base font-normal text-zinc-500">(you)</span>
            )}
          </h1>
          <p className="text-zinc-500">@{person.username}</p>
          {person.headline && <p>{person.headline}</p>}
        </div>
        {isYou && (
          <Link
            href="/settings/profile"
            className="ml-auto rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Edit profile
          </Link>
        )}
      </header>

      {person.bio && <p className="whitespace-pre-line">{person.bio}</p>}

      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-zinc-500">Experience</dt>
        <dd>
          {person.experience ? EXPERIENCE_LABELS[person.experience] : "Not set"}
        </dd>
        <dt className="text-zinc-500">Availability</dt>
        <dd>
          {person.hoursPerWeek ? `${person.hoursPerWeek} hrs/week` : "Not set"}
          {person.timezone && ` · ${person.timezone}`}
        </dd>
      </dl>

      <section>
        <h2 className="mb-2 font-medium">Skills</h2>
        {person.skills.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {person.skills.map((name) => (
              <li
                key={name}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
              >
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No skills listed yet.</p>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-medium">Projects posted</h2>
        {projects.posted.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm">
            {projects.posted.map((p) => (
              <li key={p.id}>
                <Link href={`/posts/${p.id}`} className="underline">
                  {p.title}
                </Link>
                {p.status === "closed" && (
                  <span className="text-zinc-500"> (closed)</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">None yet.</p>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-medium">Projects joined</h2>
        {projects.joined.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm">
            {projects.joined.map((p) => (
              <li key={p.id}>
                <Link href={`/posts/${p.id}`} className="underline">
                  {p.title}
                </Link>{" "}
                <span className="text-zinc-500">as {p.roleName}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">None yet.</p>
        )}
      </section>

      {visibleLinks.length > 0 && (
        <section>
          <h2 className="mb-2 font-medium">Links</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {visibleLinks.map((link) => (
              <li key={link.key}>
                <a
                  href={details.links[link.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Real name and contact: only present if this viewer may see them. */}
      {(details.realName || details.email || details.discord) && (
        <section>
          <h2 className="mb-2 font-medium">Contact</h2>
          {isYou && (
            <p className="mb-2 text-sm text-zinc-500">
              Only you and your collaborators can see this.
            </p>
          )}
          <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
            {details.realName && (
              <>
                <dt className="text-zinc-500">Real name</dt>
                <dd>{details.realName}</dd>
              </>
            )}
            {details.email && (
              <>
                <dt className="text-zinc-500">Email</dt>
                <dd>{details.email}</dd>
              </>
            )}
            {details.discord && (
              <>
                <dt className="text-zinc-500">Discord</dt>
                <dd>{details.discord}</dd>
              </>
            )}
          </dl>
        </section>
      )}
    </article>
  );
}
