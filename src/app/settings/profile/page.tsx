import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ProfileForm } from "@/features/profiles/components/profile-form";
import { getOwnProfileForEdit } from "@/features/profiles/queries";
import { requireProfile } from "@/server/auth";

export const metadata: Metadata = { title: "Edit profile · BuddyBuddy" };

export default function EditProfilePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Edit profile</h1>
      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <EditProfile />
      </Suspense>
    </main>
  );
}

// Reads the session, so it sits inside <Suspense>.
async function EditProfile() {
  const viewer = await requireProfile();
  const own = await getOwnProfileForEdit(viewer);
  if (!own) redirect("/onboarding");

  const { profile: p, private: priv } = own;
  return (
    <ProfileForm
      initial={{
        displayName: p.displayName ?? "",
        headline: p.headline ?? "",
        bio: p.bio ?? "",
        experience: p.experience ?? "",
        hoursPerWeek: p.hoursPerWeek?.toString() ?? "",
        timezone: p.timezone ?? "",
        skills: own.skills.join(", "),
        realName: priv?.realName ?? "",
        githubUrl: priv?.githubUrl ?? "",
        linkedinUrl: priv?.linkedinUrl ?? "",
        portfolioUrl: priv?.portfolioUrl ?? "",
        githubPublic: priv?.githubPublic ?? false,
        linkedinPublic: priv?.linkedinPublic ?? false,
        portfolioPublic: priv?.portfolioPublic ?? false,
        email: priv?.email ?? "",
        discord: priv?.discord ?? "",
      }}
    />
  );
}
