import { LINKS, type LinkKey } from "@/lib/constants";

// Pure business rules for applying (no database, unit-tested).
// Ported from docs/reference/prototype/rules.ts.

// The parts of a post these rules look at.
export type ApplyPost = {
  ownerId: string;
  status: "open" | "closed";
  roles: { id: string; filled: boolean }[];
  requiredLinks: LinkKey[];
};

export function openRoles<R extends { filled: boolean }>(roles: R[]): R[] {
  return roles.filter((role) => !role.filled);
}

// Which of the post's required links the applicant hasn't added to their
// profile. Only checks that the link EXISTS; it may be private (docs/privacy.md).
export function missingRequiredLinks(
  requiredLinks: LinkKey[],
  profileLinks: Partial<Record<LinkKey, string | null>>,
): LinkKey[] {
  return requiredLinks.filter((key) => !profileLinks[key]?.trim());
}

export type ApplyBlocker = { reason: string; missingLinks?: LinkKey[] };

// Why this person can't apply to this post right now, or null if they can.
// The checks run in order; the first one that fails is the reason shown.
export function getApplyBlocker(
  post: ApplyPost,
  applicant: {
    id: string;
    links: Partial<Record<LinkKey, string | null>>;
    alreadyApplied: boolean;
    blocked?: boolean; // a block either way between applicant and poster
  },
): ApplyBlocker | null {
  if (post.ownerId === applicant.id) return { reason: "This is your post." };
  if (applicant.blocked) return { reason: "You can’t apply to this post." };
  if (applicant.alreadyApplied) {
    return { reason: "You’ve already applied to this project." };
  }
  if (post.status === "closed") {
    return { reason: "This post is closed to new applications." };
  }
  if (openRoles(post.roles).length === 0) {
    return { reason: "All roles on this project have been filled." };
  }
  const missing = missingRequiredLinks(post.requiredLinks, applicant.links);
  if (missing.length > 0) {
    const names = missing.map(
      (key) => LINKS.find((link) => link.key === key)?.label ?? key,
    );
    return {
      reason: `This post requires ${names.join(" and ")} on your profile.`,
      missingLinks: missing,
    };
  }
  return null;
}
