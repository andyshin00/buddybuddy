// Fills the local database with demo data, ported from the prototype
// (docs/reference/prototype/seed.ts). Run it with `npm run db:seed`.
//
// It deletes the old demo users and ALL skills first, so only run it against the
// `dev` database in .env.local, never production.
//
// Real names, links and contact details go in profile_private (see
// docs/privacy.md). Posts, applications and notifications come after them.

import "./load-env"; // must come first, see load-env.ts

import { inArray, sql } from "drizzle-orm";

import {
  QUESTION_TEMPLATES,
  type QuestionDraft,
} from "@/features/posts/templates";
import {
  newApplicationNotice,
  statusChangeNotice,
} from "@/features/notifications/rules";
import type {
  Duration,
  LinkKey,
  PostType,
  QuestionType,
} from "@/lib/constants";

import { db } from "./index";
import {
  application,
  notification,
  post,
  postQuestion,
  postRole,
  postSkill,
  profile,
  profilePrivate,
  profileSkill,
  rateLimit,
  skill,
  user,
} from "./schema";
import { findOrCreateSkills } from "./skills";

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

const LEVELS = ["None", "Some", "Comfortable", "Expert"];

// A template's questions, plus any extra ones.
function fromTemplate(id: string, extra: QuestionDraft[] = []) {
  const template = QUESTION_TEMPLATES.find((t) => t.id === id)!;
  return [...template.questions, ...extra];
}

// Posts from the prototype. `daysAgo` sets how old each one looks.
const demoPosts: {
  ownerId: string;
  title: string;
  description: string;
  type: PostType;
  status?: "open" | "closed";
  roles: { name: string; filled?: boolean }[];
  requiredSkills: string[];
  niceSkills: string[];
  hoursPerWeek: number;
  duration: Duration;
  timezone?: string;
  requiredLinks?: LinkKey[];
  questions: QuestionDraft[];
  daysAgo: number;
}[] = [
  {
    ownerId: "u-maya",
    title: "StudySync — shared study rooms for CS courses",
    description:
      "A web app where students in the same course can spin up a study room with a shared timer, a whiteboard, and a queue for questions. I have mockups and a React prototype of the room UI. I need someone to own the backend (auth, rooms, real-time sync) and a designer to polish the flows.",
    type: "need-builders",
    roles: [{ name: "Backend" }, { name: "Designer", filled: true }],
    requiredSkills: ["Node.js", "WebSockets"],
    niceSkills: ["PostgreSQL", "Figma"],
    hoursPerWeek: 6,
    duration: "1-month",
    timezone: "UTC-8 (Pacific)",
    questions: fromTemplate("web-app", [
      {
        type: "short",
        label: "Which course would you want a study room for first?",
        required: false,
        options: [],
      },
    ]),
    daysAgo: 3,
  },
  {
    ownerId: "u-jordan",
    title: "Ledgerline: open-source personal finance CLI needs a web dashboard",
    description:
      "Ledgerline is a Go CLI (about 200 users) that categorizes bank CSV exports. People keep asking for a web dashboard with charts. The API is ready; I need a frontend dev to build the dashboard in React + TypeScript. Good first issues are labeled in the repo.",
    type: "fill-role",
    roles: [{ name: "Frontend" }],
    requiredSkills: ["React", "TypeScript"],
    niceSkills: ["D3.js", "Tailwind"],
    hoursPerWeek: 5,
    duration: "3-plus-months",
    requiredLinks: ["github"],
    questions: [
      {
        type: "dropdown",
        label: "How much TypeScript experience do you have?",
        required: true,
        options: LEVELS,
      },
      {
        type: "yesno",
        label: "Have you used a charting library (Recharts, D3, Chart.js)?",
        required: true,
        options: [],
      },
      {
        type: "long",
        label: "Skim our open issues — which would you pick up first, and why?",
        required: true,
        options: [],
      },
    ],
    daysAgo: 6,
  },
  {
    ownerId: "u-priya",
    title: "Let’s brainstorm: study tools for neurodivergent students",
    description:
      "No code yet — I want to find 2–3 people to explore problems neurodivergent students face (focus, time blindness, overwhelming group work) and decide together whether there’s a small tool worth building. Lived experience very welcome.",
    type: "ideate",
    roles: [{ name: "Engineer" }, { name: "Researcher" }],
    requiredSkills: [],
    niceSkills: ["UX research", "React"],
    hoursPerWeek: 3,
    duration: "2-weeks",
    questions: [
      {
        type: "multi",
        label: "Which problem areas resonate with you?",
        required: true,
        options: [
          "Focus & time blindness",
          "Note-taking",
          "Group work",
          "Exam anxiety",
          "Something else",
        ],
      },
      {
        type: "long",
        label:
          "Any lived experience or research background here? (Share only what you’re comfortable with.)",
        required: false,
        options: [],
      },
      {
        type: "dropdown",
        label: "How do you prefer to ideate?",
        required: true,
        options: ["Async in a shared doc", "Weekly video call", "Discord chat"],
      },
    ],
    daysAgo: 2,
  },
  {
    ownerId: "u-leo",
    title:
      "Sprite Forge: pixel-art sprite generator with small diffusion models",
    description:
      "I’m fine-tuning a small diffusion model to generate 32×32 game sprites from text prompts. Training works locally. I want an ML collaborator to help with dataset curation and evaluation, and a frontend dev to build a simple web playground.",
    type: "need-builders",
    roles: [{ name: "ML Engineer" }, { name: "Frontend" }],
    requiredSkills: ["Python", "PyTorch"],
    niceSkills: ["React", "Pixel art"],
    hoursPerWeek: 5,
    duration: "3-months",
    timezone: "UTC+1 (Central Europe)",
    requiredLinks: ["github"],
    questions: [
      {
        type: "dropdown",
        label: "How much PyTorch experience do you have?",
        required: true,
        options: LEVELS,
      },
      {
        type: "yesno",
        label: "Have you trained or fine-tuned a model before?",
        required: true,
        options: [],
      },
      {
        type: "short",
        label: "Do you have GPU access? (local card or cloud)",
        required: false,
        options: [],
      },
      {
        type: "long",
        label: "Why does this project interest you?",
        required: true,
        options: [],
      },
    ],
    daysAgo: 9,
  },
  {
    ownerId: "u-aiko",
    title: "Cozy farming game for the October 48h game jam",
    description:
      "Joining a 48-hour online jam next weekend. Theme is announced at kickoff, but I want to make something cozy and farm-y in Unity. Looking for a programmer, a pixel artist, and someone for music/SFX. Beginners welcome if you’re ready to scope small!",
    type: "need-builders",
    roles: [
      { name: "Game programmer" },
      { name: "Artist" },
      { name: "Sound designer" },
    ],
    requiredSkills: ["Unity", "C#"],
    niceSkills: ["Pixel art"],
    hoursPerWeek: 20,
    duration: "weekend",
    questions: fromTemplate("game"),
    daysAgo: 1.2,
  },
  {
    ownerId: "u-sam",
    title: "Ideas for a campus lost & found app?",
    description:
      "Our campus lost & found is a spreadsheet nobody checks. I think a simple app (post a found item with a photo, get notified if it matches what you lost) could help. I’m a beginner and would love to ideate with someone more experienced before we build anything.",
    type: "ideate",
    roles: [{ name: "Mobile (Android)" }, { name: "Backend" }],
    requiredSkills: [],
    niceSkills: ["Firebase", "React Native"],
    hoursPerWeek: 4,
    duration: "1-month",
    timezone: "UTC-5 (Eastern)",
    questions: fromTemplate("general"),
    daysAgo: 4,
  },
  {
    ownerId: "u-jordan",
    title: "Streaks: habit tracker needs an iOS developer",
    description:
      "Streaks has a working backend (Go + Postgres) and a web version with ~1k weekly users. We want a native iOS app with widgets and reminders. Looking for an experienced Swift/SwiftUI developer to own the client.",
    type: "fill-role",
    roles: [{ name: "Mobile (iOS)" }],
    requiredSkills: ["Swift", "SwiftUI"],
    niceSkills: ["GraphQL"],
    hoursPerWeek: 6,
    duration: "3-plus-months",
    requiredLinks: ["github", "linkedin"],
    questions: fromTemplate("mobile-app"),
    daysAgo: 12,
  },
  {
    ownerId: "u-maya",
    title: "Folio: one-click portfolio sites for students",
    description:
      "Paste your GitHub and resume, get a clean portfolio site. Built over a weekend hackathon — team is full, keeping this up for reference.",
    type: "need-builders",
    status: "closed",
    roles: [{ name: "Frontend", filled: true }],
    requiredSkills: ["React"],
    niceSkills: ["Next.js"],
    hoursPerWeek: 4,
    duration: "weekend",
    questions: fromTemplate("web-app"),
    daysAgo: 30,
  },
];

// Applications from the prototype. `post` is the start of the post's title;
// `values` are the answers in question order.
const demoApplications: {
  post: string;
  applicant: string;
  role: string;
  status: "pending" | "accepted" | "rejected";
  values: (string | string[])[];
  message: string;
  daysAgo: number;
}[] = [
  {
    post: "StudySync",
    applicant: "u-sam",
    role: "Backend",
    status: "pending",
    daysAgo: 0.2,
    values: [
      "Some",
      ["None yet"],
      "No",
      "I just finished data structures and want to learn how real backends work. I use study groups constantly, so I’d actually use this.",
      "CS 1332",
    ],
    message:
      "I’m a beginner, but I have a lot of time this semester and I learn fast!",
  },
  {
    post: "StudySync",
    applicant: "u-priya",
    role: "Designer",
    status: "accepted",
    daysAgo: 2.5,
    values: [
      "Comfortable",
      ["React"],
      "Yes",
      "I’ve designed two study tools for class projects and would love to work on something that ships.",
      "Intro to Algorithms",
    ],
    message:
      "Loved the prototype — happy to do a quick audit of the room flow this week.",
  },
  {
    post: "Ledgerline",
    applicant: "u-maya",
    role: "Frontend",
    status: "pending",
    daysAgo: 1,
    values: [
      "Comfortable",
      "Yes",
      "The budget-breakdown chart issue — it’s the most visible feature and I’ve built a similar chart with Recharts.",
    ],
    message: "",
  },
  {
    post: "Ledgerline",
    applicant: "u-leo",
    role: "Frontend",
    status: "rejected",
    daysAgo: 5,
    values: ["Some", "Yes", "CSV export — I work with CSVs all day."],
    message: "Mostly a data person, but keen to learn React.",
  },
  {
    post: "Sprite Forge",
    applicant: "u-maya",
    role: "Frontend",
    status: "accepted",
    daysAgo: 7,
    values: [
      "None",
      "No",
      "",
      "I’d love to build the playground UI — a prompt box, a sprite grid, and a download button.",
    ],
    message: "Not an ML person, but I can make the frontend shine.",
  },
  {
    post: "Streaks",
    applicant: "u-aiko",
    role: "Mobile (iOS)",
    status: "pending",
    daysAgo: 0.5,
    values: [
      ["iOS (Swift)", "Android (Kotlin)"],
      "Yes",
      "Expert",
      "https://aiko.games/apps",
      "Habit apps are a great fit for widgets and I’ve shipped two WidgetKit apps.",
    ],
    message: "Happy to share TestFlight builds of my past apps.",
  },
  {
    post: "Cozy farming game",
    applicant: "u-sam",
    role: "Game programmer",
    status: "rejected",
    daysAgo: 1,
    values: [
      ["Godot"],
      "Programming",
      "No",
      "Stardew Valley — cozy forever.",
      "I’ve never done a jam and want to try one.",
    ],
    message: "",
  },
  {
    post: "Cozy farming game",
    applicant: "u-priya",
    role: "Artist",
    status: "pending",
    daysAgo: 0.3,
    values: [
      ["Unity", "Godot"],
      "Art",
      "Yes",
      "Spiritfarer — gorgeous and kind.",
      "I’ve been learning pixel art and a jam is the perfect deadline.",
    ],
    message: "Here’s a tileset I made last month: priyaraman.design/pixels",
  },
  {
    post: "Ideas for a campus lost & found",
    applicant: "u-jordan",
    role: "Backend",
    status: "pending",
    daysAgo: 0.8,
    values: [
      "3–6 hours",
      "Ledgerline, a personal finance CLI",
      "Yes",
      "Helping a newer dev scope something real for their campus.",
    ],
    message: "Happy to mentor and help you pick a stack that keeps it simple.",
  },
  {
    post: "Let’s brainstorm",
    applicant: "u-leo",
    role: "Engineer",
    status: "pending",
    daysAgo: 1.5,
    values: [
      ["Focus & time blindness", "Note-taking"],
      "I have ADHD and have built a few scripts to keep myself on track.",
      "Async in a shared doc",
    ],
    message: "",
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
    // Rate-limit counters ("apply:u-sam") aren't linked to users, so clear
    // the demo users' by hand: tests can run again straight away.
    await tx
      .delete(rateLimit)
      .where(inArray(sql`split_part(${rateLimit.key}, ':', 2)`, demoUserIds));

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

    // 7. Posts, with their roles, skills and application questions.
    //    Remember what was created, so applications can point at it.
    const created = new Map<
      string,
      {
        id: string;
        roles: Map<string, string>;
        questions: { id: string; label: string; type: QuestionType }[];
      }
    >();
    for (const demo of demoPosts) {
      const {
        roles,
        requiredSkills,
        niceSkills,
        questions,
        daysAgo,
        ...columns
      } = demo;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
      const [row] = await tx
        .insert(post)
        .values({ ...columns, createdAt, updatedAt: createdAt })
        .returning({ id: post.id });
      const roleRows = await tx
        .insert(postRole)
        .values(
          roles.map((role, position) => ({
            postId: row.id,
            position,
            ...role,
          })),
        )
        .returning({ id: postRole.id, name: postRole.name });
      const questionRows = await tx
        .insert(postQuestion)
        .values(
          questions.map((question, position) => ({
            postId: row.id,
            position,
            ...question,
          })),
        )
        .returning({
          id: postQuestion.id,
          label: postQuestion.label,
          type: postQuestion.type,
          position: postQuestion.position,
        });
      created.set(demo.title, {
        id: row.id,
        roles: new Map(roleRows.map((r) => [r.name, r.id])),
        questions: questionRows.sort((a, b) => a.position - b.position),
      });
      const all = [...requiredSkills, ...niceSkills];
      const ids = await findOrCreateSkills(tx, all);
      if (all.length > 0) {
        await tx.insert(postSkill).values(
          all.map((name) => ({
            postId: row.id,
            skillId: ids.get(name.toLowerCase())!,
            kind: requiredSkills.includes(name)
              ? ("required" as const)
              : ("nice" as const),
          })),
        );
      }
    }

    // 8. Applications, with answers saved next to a copy of each question.
    for (const demo of demoApplications) {
      const title = [...created.keys()].find((t) => t.startsWith(demo.post))!;
      const target = created.get(title)!;
      const appliedAt = new Date(Date.now() - demo.daysAgo * 24 * 3600 * 1000);
      await tx.insert(application).values({
        postId: target.id,
        applicantId: demo.applicant,
        roleId: target.roles.get(demo.role)!,
        roleName: demo.role,
        status: demo.status,
        message: demo.message || null,
        // Answers are in question order; "" or [] means skipped.
        answers: target.questions.flatMap((q, i) => {
          const value = demo.values[i];
          const skipped =
            value === undefined ||
            (Array.isArray(value) ? value.length === 0 : value === "");
          return skipped
            ? []
            : [{ questionId: q.id, label: q.label, type: q.type, value }];
        }),
        createdAt: appliedAt,
        updatedAt: appliedAt,
      });

      // The notifications this would have sent. Pending ones are still
      // unread for the poster; Sam's decision is unread for Sam, so both
      // sides of the bell show a badge on first load.
      const about = {
        postId: target.id,
        postTitle: title,
        roleName: demo.role,
      };
      const applicantUsername = demoProfiles.find(
        (d) => d.profile.userId === demo.applicant,
      )!.profile.username;
      const owner = demoPosts.find((p) => p.title === title)!.ownerId;
      await tx.insert(notification).values({
        userId: owner,
        ...newApplicationNotice({ ...about, applicantUsername }),
        readAt: demo.status === "pending" ? null : appliedAt,
        createdAt: appliedAt,
      });
      if (demo.status !== "pending") {
        const decidedAt = new Date(appliedAt.getTime() / 2 + Date.now() / 2);
        await tx.insert(notification).values({
          userId: demo.applicant,
          ...statusChangeNotice({ ...about, status: demo.status }),
          readAt: demo.applicant === "u-sam" ? null : decidedAt,
          createdAt: decidedAt,
        });
      }
    }

    console.log(
      `Seeded ${demoProfiles.length} profiles, ${demoPosts.length} posts, ${demoApplications.length} applications, with notifications.`,
    );
  });
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
