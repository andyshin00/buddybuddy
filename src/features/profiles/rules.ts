import type { LinkKey } from "@/lib/constants";

// How the viewer is related to the profile they're looking at.
// - self:         it's their own profile
// - collaborator: an accepted application between them, either direction (M7)
// - reviewer:     the profile owner applied to the viewer's post (M7)
// - stranger:     anyone else who is signed in
export type Relationship = "self" | "collaborator" | "reviewer" | "stranger";

// A row from the profile_private table.
export type PrivateDetails = {
  realName: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  githubPublic: boolean;
  linkedinPublic: boolean;
  portfolioPublic: boolean;
  email: string | null;
  discord: string | null;
};

// What the viewer is allowed to see. A field the viewer may not see is
// left out completely, so it can never reach the browser.
export type VisiblePrivateDetails = {
  realName?: string;
  links: Partial<Record<LinkKey, string>>;
  email?: string;
  discord?: string;
};

// The rules from docs/privacy.md, as one pure function (no database, easy to test).
export function visiblePrivateDetails(
  relationship: Relationship,
  details: PrivateDetails,
): VisiblePrivateDetails {
  const links = {
    github: { url: details.githubUrl, isPublic: details.githubPublic },
    linkedin: { url: details.linkedinUrl, isPublic: details.linkedinPublic },
    portfolio: { url: details.portfolioUrl, isPublic: details.portfolioPublic },
  };

  const seesEverything =
    relationship === "self" || relationship === "collaborator";
  // Applying is consent to be reviewed: a poster sees an applicant's links.
  const seesAllLinks = seesEverything || relationship === "reviewer";

  const visible: VisiblePrivateDetails = { links: {} };
  for (const [key, link] of Object.entries(links) as [
    LinkKey,
    { url: string | null; isPublic: boolean },
  ][]) {
    if (link.url && (seesAllLinks || link.isPublic)) {
      visible.links[key] = link.url;
    }
  }

  if (seesEverything) {
    if (details.realName) visible.realName = details.realName;
    if (details.email) visible.email = details.email;
    if (details.discord) visible.discord = details.discord;
  }

  return visible;
}
