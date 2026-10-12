// Fills the local database with demo data, ported from the prototype
// (docs/reference/prototype/seed.ts). Run it with `npm run db:seed`.
//
// It deletes the old demo users and ALL skills first, so only run it against the
// `dev` database in .env.local, never production.
//
// Real names, links and contact details go in profile_private (see
// docs/privacy.md). Posts and applications are added here once their
// tables exist.

import "./load-env"; // must come first, see load-env.ts

import { inArray } from "drizzle-orm";

import { db } from "./index";
import { profile, profilePrivate, profileSkill, skill, user } from "./schema";

const demoProfiles = [
  {
    profile: {
      userId: "u-maya",
      username: "maya",
      displayName: "Maya",
      headline: "CS junior @ UC Berkeley",
      bio: "Frontend-focused student who loves turning messy ideas into clean, usable interfaces. Looking for side projects that real people will use.",
      experience: "intermediate",
      hoursPerWeek: 8,
      timezone: "UTC-8 (Pacific)",
    },
    skills: ["React", "TypeScript", "Tailwind", "HTML/CSS", "Figma", "Git"],
  },
  {
    profile: {
      userId: "u-jordan",
      username: "jordan",
      displayName: "Jordan",
      headline: "Backend engineer @ a fintech startup",
      bio: "Five years building APIs and data pipelines. I maintain a couple of small open-source tools and enjoy mentoring newer devs.",
      experience: "advanced",
      hoursPerWeek: 6,
      timezone: "UTC-5 (Eastern)",
    },
    skills: [
      "Node.js",
      "Go",
      "PostgreSQL",
      "AWS",
      "Docker",
      "TypeScript",
      "GraphQL",
    ],
  },
  {
    profile: {
      userId: "u-priya",
      username: "priya",
      displayName: "Priya",
      headline: "Product designer, codes a bit",
      bio: "Designer at an agency by day. I prototype in Figma and can ship simple HTML/CSS. Passionate about accessible, calm software.",
      experience: "intermediate",
      hoursPerWeek: 10,
      timezone: "UTC+5:30 (India)",
    },
    skills: ["Figma", "UI design", "UX research", "HTML/CSS", "Tailwind"],
  },
  {
    profile: {
      userId: "u-leo",
      username: "leo",
      displayName: "Leo",
      headline: "Data analyst, ML hobbyist",
      bio: "I analyze data for a logistics company and tinker with generative models on weekends. Want to build something creative with ML.",
      experience: "intermediate",
      hoursPerWeek: 5,
      timezone: "UTC+1 (Central Europe)",
    },
    skills: ["Python", "PyTorch", "Pandas", "Machine learning", "FastAPI"],
  },
  {
    profile: {
      userId: "u-sam",
      username: "sam",
      displayName: "Sam",
      headline: "First-year CS @ Georgia Tech",
      bio: "Brand new to programming outside of class. I have lots of time and energy and want to learn by building with others.",
      experience: "beginner",
      hoursPerWeek: 12,
      timezone: "UTC-5 (Eastern)",
    },
    skills: ["Python", "Java", "HTML/CSS", "Git"],
  },
  {
    profile: {
      userId: "u-aiko",
      username: "aiko",
      displayName: "Aiko",
      headline: "Indie mobile & game developer",
      bio: "Shipped three iOS apps and a handful of jam games. I like small teams, short cycles, and cozy aesthetics.",
      experience: "advanced",
      hoursPerWeek: 8,
      timezone: "UTC+9 (Tokyo)",
    },
    skills: ["Swift", "SwiftUI", "Kotlin", "Unity", "C#", "Pixel art"],
  },
] as const;

// Private details (docs/privacy.md). A few GitHub links are public, so you
// can see the difference between "public" and "collaborators only".
const demoPrivate = [
  {
    userId: "u-maya",
    realName: "Maya Chen",
    githubUrl: "https://github.com/mayachen",
    linkedinUrl: "https://linkedin.com/in/mayachen",
    portfolioUrl: "https://maya.dev",
    githubPublic: true,
    email: "maya.chen@example.edu",
    discord: "mayac#2048",
  },
  {
    userId: "u-jordan",
    realName: "Jordan Okafor",
    githubUrl: "https://github.com/jokafor",
    linkedinUrl: "https://linkedin.com/in/jordanokafor",
    githubPublic: true,
    email: "jordan.okafor@example.com",
    discord: "jokafor",
  },
  {
    userId: "u-priya",
    realName: "Priya Raman",
    linkedinUrl: "https://linkedin.com/in/priyaraman",
    portfolioUrl: "https://priyaraman.design",
    portfolioPublic: true,
    email: "priya@example.com",
    discord: "priya.designs",
  },
  {
    userId: "u-leo",
    realName: "Leo Martins",
    githubUrl: "https://github.com/leomartins",
    linkedinUrl: "https://linkedin.com/in/leomartins",
    email: "leo.martins@example.com",
    discord: "leo_m",
  },
  {
    userId: "u-sam",
    realName: "Sam Rivera",
    githubUrl: "https://github.com/samrivera",
    email: "sam.rivera@example.edu",
    discord: "samr_codes",
  },
  {
    userId: "u-aiko",
    realName: "Aiko Tanaka",
    githubUrl: "https://github.com/aikotanaka",
    linkedinUrl: "https://linkedin.com/in/aikotanaka",
    portfolioUrl: "https://aiko.games",
    githubPublic: true,
    portfolioPublic: true,
    email: "aiko@example.com",
    discord: "aiko.tanaka",
  },
];

async function seed() {
  // One transaction: either everything is saved, or nothing is.
  await db.transaction(async (tx) => {
    // 1. Remove the old demo data. Deleting a demo user also deletes their
    //    profile (cascade). Your own dev account is left alone.
    const demoUserIds = demoProfiles.map((d) => d.profile.userId);
    await tx.delete(user).where(inArray(user.id, demoUserIds));
    await tx.delete(skill);

    // 2. A `user` row for each demo person (normally made by signing in).
    await tx.insert(user).values(
      demoProfiles.map((d) => ({
        id: d.profile.userId,
        name: d.profile.displayName,
        email: `${d.profile.username}@example.com`,
      })),
    );

    // 3. Every skill that appears on any profile, once each.
    const skillNames = [...new Set(demoProfiles.flatMap((d) => d.skills))];
    const skills = await tx
      .insert(skill)
      .values(skillNames.map((name) => ({ name })))
      .returning();
    const skillIdByName = new Map(skills.map((s) => [s.name, s.id]));

    // 4. The profiles themselves.
    await tx.insert(profile).values(demoProfiles.map((d) => d.profile));

    // 5. Their private details.
    await tx.insert(profilePrivate).values(demoPrivate);

    // 6. Link each profile to its skills.
    await tx.insert(profileSkill).values(
      demoProfiles.flatMap((d) =>
        d.skills.map((name) => ({
          userId: d.profile.userId,
          skillId: skillIdByName.get(name)!,
        })),
      ),
    );

    console.log(
      `Seeded ${demoProfiles.length} profiles and ${skills.length} skills.`,
    );
  });
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
