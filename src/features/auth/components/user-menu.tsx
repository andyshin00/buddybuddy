import Link from "next/link";

import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { getNotifications } from "@/features/notifications/queries";
import { timeAgo } from "@/features/posts/components/time-ago";
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

  const notifications = viewer.username ? await getNotifications(viewer) : null;

  return (
    <nav aria-label="Account" className="flex items-center gap-4 text-sm">
      {viewer.username ? (
        <>
          <Link href="/my-posts" className="hover:underline">
            My posts
          </Link>
          <Link href="/applications" className="hover:underline">
            My applications
          </Link>
          {notifications && (
            <NotificationBell
              // A new notification or count gives a fresh bell (resets "seen").
              key={`${notifications.unread}-${notifications.items[0]?.id}`}
              unread={notifications.unread}
              items={notifications.items.map((n) => ({
                id: n.id,
                text: n.text,
                link: n.link,
                unread: n.readAt === null,
                ago: timeAgo(n.createdAt),
              }))}
            />
          )}
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
    </nav>
  );
}
