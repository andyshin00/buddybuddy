import Link from "next/link";

import { getViewer } from "@/server/auth";

import { signOut } from "../actions";

// Right side of the header. Reads the session, so it must be rendered
// inside <Suspense> (see the root layout).
export async function UserMenu() {
  const viewer = await getViewer();

  if (!viewer) {
    return (
      <Link href="/sign-in" className="text-sm font-medium hover:underline">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      {viewer.username ? (
        <>
          <Link href="/my-posts" className="hover:underline">
            My posts
          </Link>
          <Link href="/applications" className="hover:underline">
            My applications
          </Link>
          <Link
            href={`/u/${viewer.username}`}
            className="font-medium hover:underline"
          >
            @{viewer.username}
          </Link>
        </>
      ) : (
        <Link href="/onboarding" className="font-medium hover:underline">
          Finish setting up
        </Link>
      )}
      <form action={signOut}>
        <button type="submit" className="text-zinc-500 hover:underline">
          Sign out
        </button>
      </form>
    </div>
  );
}
