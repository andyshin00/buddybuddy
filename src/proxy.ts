import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Runs before the pages listed in `matcher`. It only checks that a session
// cookie EXISTS (fast, no database), and sends signed-out visitors to
// /sign-in. It's a convenience, not the security check: every page and
// Server Action still verifies the session itself (requireViewer).
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Pages that need a signed-in user. Add more as they're built.
  matcher: ["/onboarding"],
};
