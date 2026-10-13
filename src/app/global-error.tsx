"use client"; // Error pages must be Client Components

import "./globals.css";

// The last line of defense: shown only if the root layout itself breaks.
// It replaces the whole page, so it brings its own <html> and <body>.
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center font-sans">
        <title>Something went wrong · BuddyBuddy</title>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-zinc-600">
          BuddyBuddy couldn’t load. Try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
