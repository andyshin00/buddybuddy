import type { Metadata } from "next";

import { signInWith } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Sign in · BuddyBuddy" };

const buttonClass =
  "w-full rounded-md border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900";

export default function SignInPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Sign in to BuddyBuddy</h1>
      {/* Each form calls the signInWith Server Action with its provider. */}
      <form action={signInWith.bind(null, "github")}>
        <button type="submit" className={buttonClass}>
          Continue with GitHub
        </button>
      </form>
      <form action={signInWith.bind(null, "google")}>
        <button type="submit" className={buttonClass}>
          Continue with Google
        </button>
      </form>
      <p className="text-sm text-zinc-500">
        New here? Signing in creates your account.
      </p>
    </main>
  );
}
