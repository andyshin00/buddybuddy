"use client"; // Error pages must be Client Components

import Link from "next/link";
import { useEffect } from "react";

// Shown when something on a page throws: a database hiccup, a bug, or a
// rate limit on a button (src/server/rate-limit.ts). The header stays.
// In production the real message is hidden (it could leak details), so
// the text here has to cover every case.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Shows up in the browser console; `digest` matches the server logs.
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Try again in a moment. If you were clicking quickly, wait a minute
        first.
      </p>
      {error.digest && (
        <p className="text-xs text-zinc-500">Error code: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium dark:border-zinc-700"
        >
          Back to projects
        </Link>
      </div>
    </main>
  );
}
