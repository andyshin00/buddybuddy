import Link from "next/link";

import type { PostDetail } from "../queries";
import { PostTypeBadge } from "./post-type-badge";
import { timeAgo } from "./time-ago";

// One post in the browse list. The whole card links to the post page.
export function PostCard({
  post,
  viewerId,
}: {
  post: PostDetail;
  viewerId: string;
}) {
  const openRoles = post.roles.filter((role) => !role.filled);
  const skills = [...post.requiredSkills, ...post.niceSkills];

  return (
    <li className="relative rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <PostTypeBadge type={post.type} />
        {post.ownerId === viewerId && (
          <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
            Your post
          </span>
        )}
      </div>
      <h2 className="text-lg font-semibold">
        {/* The ::after makes the whole card clickable */}
        <Link
          href={`/posts/${post.id}`}
          className="after:absolute after:inset-0"
        >
          {post.title}
        </Link>
      </h2>
      {openRoles.length > 0 && (
        <p className="mt-1 text-sm">
          <span className="text-zinc-500">Looking for: </span>
          {openRoles.map((role) => role.name).join(", ")}
        </p>
      )}
      {skills.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {skills.map((name) => (
            <li
              key={name}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-zinc-500">
        {post.hoursPerWeek} hrs/week · @{post.ownerUsername} ·{" "}
        {timeAgo(post.createdAt)}
      </p>
    </li>
  );
}
