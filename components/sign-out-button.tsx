"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setErrorMessage(null);
    setLoading(true);

    const { error } = await authClient.signOut();

    setLoading(false);

    if (error) {
      setErrorMessage(error.message ?? "Sign out failed");
      return;
    }

    router.push("/sign-in");
  }

  return (
    <div>
      <Button onClick={handleSignOut} disabled={loading}>
        {loading ? "Signing out..." : "Sign out"}
      </Button>
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
