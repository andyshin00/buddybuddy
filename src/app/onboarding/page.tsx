import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { OnboardingForm } from "@/features/profiles/components/onboarding-form";
import { requireViewer } from "@/server/auth";

export const metadata: Metadata = { title: "Choose a username · BuddyBuddy" };

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Choose a username</h1>
      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <Onboarding />
      </Suspense>
    </main>
  );
}

// Reads the session, so it sits inside <Suspense>.
async function Onboarding() {
  const viewer = await requireViewer(); // signed out → /sign-in
  if (viewer.username) redirect("/"); // already done
  return <OnboardingForm />;
}
