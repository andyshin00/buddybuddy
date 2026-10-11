import type { Duration, ExperienceLevel, LinkKey, PostType, QuestionType } from '../types'

export const APP_NAME = 'Crewup'

export const POST_TYPES: { value: PostType; label: string; short: string; badgeClass: string }[] = [
  {
    value: 'need-builders',
    label: 'Have an idea, need builders',
    short: 'Need builders',
    badgeClass: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  },
  {
    value: 'ideate',
    label: 'Open to ideating together',
    short: 'Ideating',
    badgeClass: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  {
    value: 'fill-role',
    label: 'Existing project, need a role filled',
    short: 'Role to fill',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
]

export const DURATIONS: { value: Duration; label: string }[] = [
  { value: 'weekend', label: 'A weekend' },
  { value: '2-weeks', label: '~2 weeks' },
  { value: '1-month', label: '~1 month' },
  { value: '3-months', label: '~3 months' },
  { value: '3-plus-months', label: '3+ months' },
]

export const EXPERIENCE_LEVELS: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced']

export const LINKS: { key: LinkKey; label: string }[] = [
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'portfolio', label: 'Portfolio' },
]

export const TIMEZONES = [
  'UTC-8 (Pacific)',
  'UTC-7 (Mountain)',
  'UTC-6 (Central)',
  'UTC-5 (Eastern)',
  'UTC-3 (São Paulo)',
  'UTC+0 (London)',
  'UTC+1 (Central Europe)',
  'UTC+3 (Nairobi)',
  'UTC+5:30 (India)',
  'UTC+8 (Singapore)',
  'UTC+9 (Tokyo)',
  'UTC+10 (Sydney)',
]

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'short', label: 'Short text' },
  { value: 'long', label: 'Long text' },
  { value: 'dropdown', label: 'Dropdown (single choice)' },
  { value: 'multi', label: 'Multiple choice (checkboxes)' },
  { value: 'yesno', label: 'Yes / No' },
]

/** Suggestions for tag inputs. Users can still type anything. */
export const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Svelte', 'HTML/CSS', 'Tailwind',
  'Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Go', 'Java', 'C#', 'C++', 'Rust',
  'PostgreSQL', 'MongoDB', 'Firebase', 'Supabase', 'AWS', 'Docker', 'GraphQL', 'WebSockets',
  'Swift', 'SwiftUI', 'Kotlin', 'React Native', 'Flutter', 'Unity', 'Godot', 'Pixel art',
  'Figma', 'UI design', 'UX research', 'PyTorch', 'Pandas', 'Machine learning', 'D3.js', 'Git',
]

export const ROLE_SUGGESTIONS = [
  'Frontend', 'Backend', 'Full-stack', 'Designer', 'Mobile (iOS)', 'Mobile (Android)',
  'ML Engineer', 'Game programmer', 'Artist', 'Sound designer', 'Researcher', 'Product / PM',
]

export function postTypeMeta(type: PostType) {
  return POST_TYPES.find((t) => t.value === type) ?? POST_TYPES[0]
}

export function durationLabel(d: Duration) {
  return DURATIONS.find((x) => x.value === d)?.label ?? d
}

export function linkLabel(key: LinkKey) {
  return LINKS.find((l) => l.key === key)?.label ?? key
}
