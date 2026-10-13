// Shown right away while a page's first content loads, for any page that
// doesn't have its own loading state yet. Most pages also show a more
// specific "Loading…" inside their own <Suspense>.
export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-8"
    >
      <p className="sr-only">Loading…</p>
      {/* Grey placeholder blocks ("skeleton"); hidden from screen readers. */}
      <div
        aria-hidden
        className="h-8 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"
      />
      <div
        aria-hidden
        className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900"
      />
      <div
        aria-hidden
        className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900"
      />
    </main>
  );
}
