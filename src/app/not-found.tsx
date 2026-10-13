import Link from "next/link";

// Shown for any URL that doesn't exist, and whenever a page calls
// notFound(): a missing post, someone else's applicants page, a profile
// that blocked you. They all look the same on purpose (docs/privacy.md).
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-sm font-medium text-zinc-500">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        This page doesn’t exist, or you don’t have access to it.
      </p>
      <Link
        href="/"
        className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Back to projects
      </Link>
    </main>
  );
}
