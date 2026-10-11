import type { AnswerValue, Application, ApplicationStatus, Notification, Post, Question, User } from '../types'
import type { Database } from './store'
import { QUESTION_TEMPLATES } from './templates'

// Demo data restored by "Reset demo data". Dates are relative to when the seed is created.

function daysAgo(days: number, hours = 0) {
  return new Date(Date.now() - (days * 24 + hours) * 3600_000).toISOString()
}

const LEVELS = ['None', 'Some', 'Comfortable', 'Expert']

/** Build a post's questions from a template, with stable ids like "p1-q1". */
function fromTemplate(templateId: string, postId: string, extra: Omit<Question, 'id'>[] = []): Question[] {
  const template = QUESTION_TEMPLATES.find((t) => t.id === templateId)!
  return withIds(postId, [...template.questions, ...extra])
}

function withIds(postId: string, questions: Omit<Question, 'id'>[]): Question[] {
  return questions.map((q, i) => ({ ...q, id: `${postId}-q${i + 1}` }))
}

const users: User[] = [
  {
    id: 'u-maya',
    name: 'Maya Chen',
    headline: 'CS junior @ UC Berkeley',
    bio: 'Frontend-focused student who loves turning messy ideas into clean, usable interfaces. Looking for side projects that real people will use.',
    skills: ['React', 'TypeScript', 'Tailwind', 'HTML/CSS', 'Figma', 'Git'],
    experience: 'Intermediate',
    hoursPerWeek: 8,
    timezone: 'UTC-8 (Pacific)',
    links: { github: 'https://github.com/mayachen', linkedin: 'https://linkedin.com/in/mayachen', portfolio: 'https://maya.dev' },
    avatarColor: 'bg-rose-500',
  },
  {
    id: 'u-jordan',
    name: 'Jordan Okafor',
    headline: 'Backend engineer @ a fintech startup',
    bio: 'Five years building APIs and data pipelines. I maintain a couple of small open-source tools and enjoy mentoring newer devs.',
    skills: ['Node.js', 'Go', 'PostgreSQL', 'AWS', 'Docker', 'TypeScript', 'GraphQL'],
    experience: 'Advanced',
    hoursPerWeek: 6,
    timezone: 'UTC-5 (Eastern)',
    links: { github: 'https://github.com/jokafor', linkedin: 'https://linkedin.com/in/jordanokafor' },
    avatarColor: 'bg-sky-600',
  },
  {
    id: 'u-priya',
    name: 'Priya Raman',
    headline: 'Product designer, codes a bit',
    bio: 'Designer at an agency by day. I prototype in Figma and can ship simple HTML/CSS. Passionate about accessible, calm software.',
    skills: ['Figma', 'UI design', 'UX research', 'HTML/CSS', 'Tailwind'],
    experience: 'Intermediate',
    hoursPerWeek: 10,
    timezone: 'UTC+5:30 (India)',
    links: { linkedin: 'https://linkedin.com/in/priyaraman', portfolio: 'https://priyaraman.design' },
    avatarColor: 'bg-violet-500',
  },
  {
    id: 'u-leo',
    name: 'Leo Martins',
    headline: 'Data analyst, ML hobbyist',
    bio: 'I analyze data for a logistics company and tinker with generative models on weekends. Want to build something creative with ML.',
    skills: ['Python', 'PyTorch', 'Pandas', 'Machine learning', 'FastAPI'],
    experience: 'Intermediate',
    hoursPerWeek: 5,
    timezone: 'UTC+1 (Central Europe)',
    links: { github: 'https://github.com/leomartins', linkedin: 'https://linkedin.com/in/leomartins' },
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'u-sam',
    name: 'Sam Rivera',
    headline: 'First-year CS @ Georgia Tech',
    bio: 'Brand new to programming outside of class. I have lots of time and energy and want to learn by building with others.',
    skills: ['Python', 'Java', 'HTML/CSS', 'Git'],
    experience: 'Beginner',
    hoursPerWeek: 12,
    timezone: 'UTC-5 (Eastern)',
    links: { github: 'https://github.com/samrivera' },
    avatarColor: 'bg-amber-500',
  },
  {
    id: 'u-aiko',
    name: 'Aiko Tanaka',
    headline: 'Indie mobile & game developer',
    bio: 'Shipped three iOS apps and a handful of jam games. I like small teams, short cycles, and cozy aesthetics.',
    skills: ['Swift', 'SwiftUI', 'Kotlin', 'Unity', 'C#', 'Pixel art'],
    experience: 'Advanced',
    hoursPerWeek: 8,
    timezone: 'UTC+9 (Tokyo)',
    links: { github: 'https://github.com/aikotanaka', linkedin: 'https://linkedin.com/in/aikotanaka', portfolio: 'https://aiko.games' },
    avatarColor: 'bg-teal-600',
  },
]

const contacts: Database['contacts'] = {
  'u-maya': { email: 'maya.chen@example.edu', discord: 'mayac#2048' },
  'u-jordan': { email: 'jordan.okafor@example.com', discord: 'jokafor' },
  'u-priya': { email: 'priya@priyaraman.design', discord: 'priya.designs' },
  'u-leo': { email: 'leo.martins@example.com', discord: 'leo_m' },
  'u-sam': { email: 'sam.rivera@example.edu', discord: 'samr_codes' },
  'u-aiko': { email: 'hello@aiko.games', discord: 'aiko.tanaka' },
}

function buildPosts(): Post[] {
  return [
    {
      id: 'p1',
      ownerId: 'u-maya',
      title: 'StudySync — shared study rooms for CS courses',
      description:
        'A web app where students in the same course can spin up a study room with a shared timer, a whiteboard, and a queue for questions. I have mockups and a React prototype of the room UI. I need someone to own the backend (auth, rooms, real-time sync) and a designer to polish the flows.',
      type: 'need-builders',
      roles: [
        { id: 'p1-r1', name: 'Backend', filled: false },
        { id: 'p1-r2', name: 'Designer', filled: true },
      ],
      requiredSkills: ['Node.js', 'WebSockets'],
      niceToHaveSkills: ['PostgreSQL', 'Figma'],
      hoursPerWeek: 6,
      duration: '1-month',
      timezone: 'UTC-8 (Pacific)',
      requiredLinks: [],
      status: 'open',
      questions: fromTemplate('web-app', 'p1', [
        { type: 'short', label: 'Which course would you want a study room for first?', required: false },
      ]),
      createdAt: daysAgo(3),
    },
    {
      id: 'p2',
      ownerId: 'u-jordan',
      title: 'Ledgerline: open-source personal finance CLI needs a web dashboard',
      description:
        'Ledgerline is a Go CLI (about 200 users) that categorizes bank CSV exports. People keep asking for a web dashboard with charts. The API is ready; I need a frontend dev to build the dashboard in React + TypeScript. Good first issues are labeled in the repo.',
      type: 'fill-role',
      roles: [{ id: 'p2-r1', name: 'Frontend', filled: false }],
      requiredSkills: ['React', 'TypeScript'],
      niceToHaveSkills: ['D3.js', 'Tailwind'],
      hoursPerWeek: 5,
      duration: '3-plus-months',
      timezone: '',
      requiredLinks: ['github'],
      status: 'open',
      questions: withIds('p2', [
        { type: 'dropdown', label: 'How much TypeScript experience do you have?', required: true, options: LEVELS },
        { type: 'yesno', label: 'Have you used a charting library (Recharts, D3, Chart.js)?', required: true },
        { type: 'long', label: 'Skim our open issues — which would you pick up first, and why?', required: true },
      ]),
      createdAt: daysAgo(6),
    },
    {
      id: 'p3',
      ownerId: 'u-priya',
      title: 'Let’s brainstorm: study tools for neurodivergent students',
      description:
        'No code yet — I want to find 2–3 people to explore problems neurodivergent students face (focus, time blindness, overwhelming group work) and decide together whether there’s a small tool worth building. Lived experience very welcome.',
      type: 'ideate',
      roles: [
        { id: 'p3-r1', name: 'Engineer', filled: false },
        { id: 'p3-r2', name: 'Researcher', filled: false },
      ],
      requiredSkills: [],
      niceToHaveSkills: ['UX research', 'React'],
      hoursPerWeek: 3,
      duration: '2-weeks',
      timezone: '',
      requiredLinks: [],
      status: 'open',
      questions: withIds('p3', [
        {
          type: 'multi',
          label: 'Which problem areas resonate with you?',
          required: true,
          options: ['Focus & time blindness', 'Note-taking', 'Group work', 'Exam anxiety', 'Something else'],
        },
        {
          type: 'long',
          label: 'Any lived experience or research background here? (Share only what you’re comfortable with.)',
          required: false,
        },
        {
          type: 'dropdown',
          label: 'How do you prefer to ideate?',
          required: true,
          options: ['Async in a shared doc', 'Weekly video call', 'Discord chat'],
        },
      ]),
      createdAt: daysAgo(2),
    },
    {
      id: 'p4',
      ownerId: 'u-leo',
      title: 'Sprite Forge: pixel-art sprite generator with small diffusion models',
      description:
        'I’m fine-tuning a small diffusion model to generate 32×32 game sprites from text prompts. Training works locally. I want an ML collaborator to help with dataset curation and evaluation, and a frontend dev to build a simple web playground.',
      type: 'need-builders',
      roles: [
        { id: 'p4-r1', name: 'ML Engineer', filled: false },
        { id: 'p4-r2', name: 'Frontend', filled: false },
      ],
      requiredSkills: ['Python', 'PyTorch'],
      niceToHaveSkills: ['React', 'Pixel art'],
      hoursPerWeek: 5,
      duration: '3-months',
      timezone: 'UTC+1 (Central Europe)',
      requiredLinks: ['github'],
      status: 'open',
      questions: withIds('p4', [
        { type: 'dropdown', label: 'How much PyTorch experience do you have?', required: true, options: LEVELS },
        { type: 'yesno', label: 'Have you trained or fine-tuned a model before?', required: true },
        { type: 'short', label: 'Do you have GPU access? (local card or cloud)', required: false },
        { type: 'long', label: 'Why does this project interest you?', required: true },
      ]),
      createdAt: daysAgo(9),
    },
    {
      id: 'p5',
      ownerId: 'u-aiko',
      title: 'Cozy farming game for the October 48h game jam',
      description:
        'Joining a 48-hour online jam next weekend. Theme is announced at kickoff, but I want to make something cozy and farm-y in Unity. Looking for a programmer, a pixel artist, and someone for music/SFX. Beginners welcome if you’re ready to scope small!',
      type: 'need-builders',
      roles: [
        { id: 'p5-r1', name: 'Game programmer', filled: false },
        { id: 'p5-r2', name: 'Artist', filled: false },
        { id: 'p5-r3', name: 'Sound designer', filled: false },
      ],
      requiredSkills: ['Unity', 'C#'],
      niceToHaveSkills: ['Pixel art'],
      hoursPerWeek: 20,
      duration: 'weekend',
      timezone: '',
      requiredLinks: [],
      status: 'open',
      questions: fromTemplate('game', 'p5'),
      createdAt: daysAgo(1, 5),
    },
    {
      id: 'p6',
      ownerId: 'u-sam',
      title: 'Ideas for a campus lost & found app?',
      description:
        'Our campus lost & found is a spreadsheet nobody checks. I think a simple app (post a found item with a photo, get notified if it matches what you lost) could help. I’m a beginner and would love to ideate with someone more experienced before we build anything.',
      type: 'ideate',
      roles: [
        { id: 'p6-r1', name: 'Mobile (Android)', filled: false },
        { id: 'p6-r2', name: 'Backend', filled: false },
      ],
      requiredSkills: [],
      niceToHaveSkills: ['Firebase', 'React Native'],
      hoursPerWeek: 4,
      duration: '1-month',
      timezone: 'UTC-5 (Eastern)',
      requiredLinks: [],
      status: 'open',
      questions: fromTemplate('general', 'p6'),
      createdAt: daysAgo(4),
    },
    {
      id: 'p7',
      ownerId: 'u-jordan',
      title: 'Streaks: habit tracker needs an iOS developer',
      description:
        'Streaks has a working backend (Go + Postgres) and a web version with ~1k weekly users. We want a native iOS app with widgets and reminders. Looking for an experienced Swift/SwiftUI developer to own the client.',
      type: 'fill-role',
      roles: [{ id: 'p7-r1', name: 'Mobile (iOS)', filled: false }],
      requiredSkills: ['Swift', 'SwiftUI'],
      niceToHaveSkills: ['GraphQL'],
      hoursPerWeek: 6,
      duration: '3-plus-months',
      timezone: '',
      requiredLinks: ['github', 'linkedin'],
      status: 'open',
      questions: fromTemplate('mobile-app', 'p7'),
      createdAt: daysAgo(12),
    },
    {
      id: 'p8',
      ownerId: 'u-maya',
      title: 'Folio: one-click portfolio sites for students',
      description:
        'Paste your GitHub and resume, get a clean portfolio site. Built over a weekend hackathon — team is full, keeping this up for reference.',
      type: 'need-builders',
      roles: [{ id: 'p8-r1', name: 'Frontend', filled: true }],
      requiredSkills: ['React'],
      niceToHaveSkills: ['Next.js'],
      hoursPerWeek: 4,
      duration: 'weekend',
      timezone: '',
      requiredLinks: [],
      status: 'closed',
      questions: fromTemplate('web-app', 'p8'),
      createdAt: daysAgo(30),
    },
  ]
}

interface SeedApplication {
  id: string
  postId: string
  applicantId: string
  roleId: string
  status: ApplicationStatus
  /** Answers in question order; '' or [] = skipped */
  values: AnswerValue[]
  message: string
  appliedDaysAgo: number
  /** Is the owner's "new application" notification still unread? */
  unread?: boolean
}

const seedApplications: SeedApplication[] = [
  {
    id: 'a1', postId: 'p1', applicantId: 'u-sam', roleId: 'p1-r1', status: 'pending', appliedDaysAgo: 0.2, unread: true,
    values: ['Some', ['None yet'], 'No', 'I just finished data structures and want to learn how real backends work. I use study groups constantly, so I’d actually use this.', 'CS 1332'],
    message: 'I’m a beginner, but I have a lot of time this semester and I learn fast!',
  },
  {
    id: 'a2', postId: 'p1', applicantId: 'u-priya', roleId: 'p1-r2', status: 'accepted', appliedDaysAgo: 2.5,
    values: ['Comfortable', ['React'], 'Yes', 'I’ve designed two study tools for class projects and would love to work on something that ships.', 'Intro to Algorithms'],
    message: 'Loved the prototype — happy to do a quick audit of the room flow this week.',
  },
  {
    id: 'a3', postId: 'p2', applicantId: 'u-maya', roleId: 'p2-r1', status: 'pending', appliedDaysAgo: 1, unread: true,
    values: ['Comfortable', 'Yes', 'The budget-breakdown chart issue — it’s the most visible feature and I’ve built a similar chart with Recharts.'],
    message: '',
  },
  {
    id: 'a4', postId: 'p2', applicantId: 'u-leo', roleId: 'p2-r1', status: 'rejected', appliedDaysAgo: 5,
    values: ['Some', 'Yes', 'CSV export — I work with CSVs all day.'],
    message: 'Mostly a data person, but keen to learn React.',
  },
  {
    id: 'a5', postId: 'p4', applicantId: 'u-maya', roleId: 'p4-r2', status: 'accepted', appliedDaysAgo: 7,
    values: ['None', 'No', '', 'I’d love to build the playground UI — a prompt box, a sprite grid, and a download button.'],
    message: 'Not an ML person, but I can make the frontend shine.',
  },
  {
    id: 'a6', postId: 'p7', applicantId: 'u-aiko', roleId: 'p7-r1', status: 'pending', appliedDaysAgo: 0.5, unread: true,
    values: [['iOS (Swift)', 'Android (Kotlin)'], 'Yes', 'Expert', 'https://aiko.games/apps', 'Habit apps are a great fit for widgets and I’ve shipped two WidgetKit apps.'],
    message: 'Happy to share TestFlight builds of my past apps.',
  },
  {
    id: 'a7', postId: 'p5', applicantId: 'u-sam', roleId: 'p5-r1', status: 'rejected', appliedDaysAgo: 1,
    values: [['Godot'], 'Programming', 'No', 'Stardew Valley — cozy forever.', 'I’ve never done a jam and want to try one.'],
    message: '',
  },
  {
    id: 'a8', postId: 'p5', applicantId: 'u-priya', roleId: 'p5-r2', status: 'pending', appliedDaysAgo: 0.3, unread: true,
    values: [['Unity', 'Godot'], 'Art', 'Yes', 'Spiritfarer — gorgeous and kind.', 'I’ve been learning pixel art and a jam is the perfect deadline.'],
    message: 'Here’s a tileset I made last month: priyaraman.design/pixels',
  },
  {
    id: 'a9', postId: 'p6', applicantId: 'u-jordan', roleId: 'p6-r2', status: 'pending', appliedDaysAgo: 0.8, unread: true,
    values: ['3–6 hours', 'Ledgerline, a personal finance CLI', 'Yes', 'Helping a newer dev scope something real for their campus.'],
    message: 'Happy to mentor and help you pick a stack that keeps it simple.',
  },
  {
    id: 'a10', postId: 'p3', applicantId: 'u-leo', roleId: 'p3-r1', status: 'pending', appliedDaysAgo: 1.5,
    values: [['Focus & time blindness', 'Note-taking'], 'I have ADHD and have built a few scripts to keep myself on track.', 'Async in a shared doc'],
    message: '',
  },
]

export function createSeedData(): Database {
  const posts = buildPosts()
  const applications: Application[] = []
  const notifications: Notification[] = []

  for (const s of seedApplications) {
    const post = posts.find((p) => p.id === s.postId)!
    const applicant = users.find((u) => u.id === s.applicantId)!
    const role = post.roles.find((r) => r.id === s.roleId)!
    const createdAt = daysAgo(s.appliedDaysAgo)
    const updatedAt = s.status === 'pending' ? createdAt : daysAgo(s.appliedDaysAgo / 2)

    applications.push({
      id: s.id,
      postId: s.postId,
      applicantId: s.applicantId,
      roleId: s.roleId,
      answers: post.questions.map((q, i) => ({ questionId: q.id, value: s.values[i] ?? '' })),
      message: s.message,
      status: s.status,
      createdAt,
      updatedAt,
    })

    notifications.push({
      id: `n-${s.id}-new`,
      userId: post.ownerId,
      kind: 'new-application',
      text: `${applicant.name} applied for ${role.name} on “${post.title}”`,
      link: `/posts/${post.id}/applicants`,
      read: !s.unread,
      createdAt,
    })

    if (s.status !== 'pending') {
      notifications.push({
        id: `n-${s.id}-status`,
        userId: s.applicantId,
        kind: 'status-change',
        text: `Your application for ${role.name} on “${post.title}” was ${s.status}`,
        link: '/applications',
        // Leave Sam's rejection unread so the applicant-side badge is visible on first load.
        read: s.applicantId !== 'u-sam',
        createdAt: updatedAt,
      })
    }
  }

  return {
    users: structuredClone(users),
    contacts: structuredClone(contacts),
    posts,
    applications,
    notifications,
  }
}

export const DEFAULT_USER_ID = 'u-maya'
