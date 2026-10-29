import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default function Dashboard() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DashboardContent />
    </Suspense>
  );
}

// Reads the session at request time, so it must sit behind <Suspense>
// (cacheComponents is enabled).
async function DashboardContent() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <SignOutButton />
    </div>
  );
}
