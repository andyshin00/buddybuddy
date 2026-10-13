import type { Metadata } from "next";
import { Suspense } from "react";

import { DeleteAccountForm } from "@/features/account/components/delete-account-form";
import { confirmationWord } from "@/features/account/rules";
import { requireViewer } from "@/server/auth";

export const metadata: Metadata = { title: "Account · BuddyBuddy" };

export default function AccountPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Account</h1>
      <section className="flex flex-col gap-4 rounded-lg border border-red-300 p-6 dark:border-red-900">
        <h2 className="text-lg font-medium">Delete account</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This permanently deletes your profile, your posts (and everyone’s
          applications to them), your applications and your notifications. It
          can’t be undone.
        </p>
        <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
          <DeleteAccount />
        </Suspense>
      </section>
    </main>
  );
}

// Reads the session, so it sits inside <Suspense>. No username needed:
// someone who never finished onboarding can delete their account too.
async function DeleteAccount() {
  const viewer = await requireViewer();
  return <DeleteAccountForm word={confirmationWord(viewer)} />;
}
