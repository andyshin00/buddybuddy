"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { markAllRead } from "../actions";
import { badgeLabel } from "../rules";

export type BellItem = {
  id: string;
  text: string;
  link: string;
  unread: boolean;
  ago: string; // "3 hours ago", worked out on the server
};

// The bell in the header. <details> gives us open/close for free; opening
// it marks everything read (the dots stay until the next page load, so you
// can still see which ones are new).
export function NotificationBell({
  items,
  unread,
}: {
  items: BellItem[];
  unread: number;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const [seen, setSeen] = useState(false);
  const [, startTransition] = useTransition();
  const label = seen ? null : badgeLabel(unread);

  function handleToggle() {
    if (ref.current?.open && unread > 0 && !seen) {
      setSeen(true);
      // Calls the Server Action; the badge is already cleared on screen.
      startTransition(() => markAllRead());
    }
  }

  // Close the dropdown when clicking anywhere outside it, or on Escape
  // (then focus goes back to the bell, so keyboard users aren't lost).
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const details = ref.current;
      if (details?.open && !details.contains(event.target as Node)) {
        details.open = false;
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      const details = ref.current;
      if (event.key === "Escape" && details?.open) {
        details.open = false;
        details.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <details ref={ref} onToggle={handleToggle} className="relative">
      <summary
        aria-label={label ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative flex cursor-pointer list-none items-center rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 [&::-webkit-details-marker]:hidden"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {label && (
          <span className="absolute -top-1 -right-1 min-w-4 rounded-full bg-red-600 px-1 text-center text-[10px] leading-4 font-semibold text-white">
            {label}
          </span>
        )}
      </summary>

      <div className="absolute right-0 z-10 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <p className="border-b border-zinc-200 px-4 py-2 font-medium dark:border-zinc-800">
          Notifications
        </p>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-center text-zinc-500">
            No notifications yet.
          </p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.link}
                  onClick={() => ref.current?.removeAttribute("open")}
                  className="flex gap-2 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <span
                    aria-hidden
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${
                      item.unread ? "bg-blue-600" : "bg-transparent"
                    }`}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span>
                      {item.unread && <span className="sr-only">New: </span>}
                      {item.text}
                    </span>
                    <span className="text-xs text-zinc-500">{item.ago}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
