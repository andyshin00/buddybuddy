// Pure rules for notifications (no database, unit-tested): what each one
// says, and where clicking it goes.

export type Notice = {
  kind: "new_application" | "status_change" | "withdrawn";
  text: string;
  link: string;
};

type About = { postId: string; postTitle: string; roleName: string };

// To the poster: someone applied.
export function newApplicationNotice(
  about: About & { applicantUsername: string },
): Notice {
  return {
    kind: "new_application",
    text: `@${about.applicantUsername} applied for ${about.roleName} on “${about.postTitle}”`,
    link: `/posts/${about.postId}/applicants?status=pending`,
  };
}

// To the applicant: the poster accepted, rejected, or undid a decision.
// "Rejected" is worded the same gentle way as the status badge.
const OUTCOMES = {
  accepted: "was accepted 🎉",
  rejected: "was not selected",
  pending: "was moved back to pending",
} as const;

export function statusChangeNotice(
  about: About & { status: keyof typeof OUTCOMES },
): Notice {
  return {
    kind: "status_change",
    text: `Your application for ${about.roleName} on “${about.postTitle}” ${OUTCOMES[about.status]}`,
    link: "/applications",
  };
}

// To the poster: someone took their application back.
export function withdrawnNotice(
  about: About & { applicantUsername: string },
): Notice {
  return {
    kind: "withdrawn",
    text: `@${about.applicantUsername} withdrew their application for ${about.roleName} on “${about.postTitle}”`,
    link: `/posts/${about.postId}/applicants`,
  };
}

// The number on the bell. Past 9 it just says "9+".
export function badgeLabel(unread: number): string | null {
  if (unread <= 0) return null;
  return unread > 9 ? "9+" : String(unread);
}
