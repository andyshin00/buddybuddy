// All data models for the app. The store (src/data/store.ts) reads and writes these shapes.

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export type LinkKey = 'github' | 'linkedin' | 'portfolio'

export interface User {
  id: string
  name: string
  bio: string
  /** School + year, or job title, e.g. "CS junior @ UT Austin" */
  headline: string
  skills: string[]
  experience: ExperienceLevel
  hoursPerWeek: number
  timezone: string
  links: Partial<Record<LinkKey, string>>
  /** Tailwind bg-* class used for the initials avatar */
  avatarColor: string
}

/** Private contact details. Only revealed once two users are collaborating (an accepted application). */
export interface ContactInfo {
  email: string
  discord: string
}

export type PostType = 'need-builders' | 'ideate' | 'fill-role'

export type PostStatus = 'open' | 'closed'

export type Duration = 'weekend' | '2-weeks' | '1-month' | '3-months' | '3-plus-months'

export interface Role {
  id: string
  name: string
  filled: boolean
}

export type QuestionType = 'dropdown' | 'multi' | 'short' | 'long' | 'yesno'

export interface Question {
  id: string
  type: QuestionType
  label: string
  required: boolean
  /** Only used by 'dropdown' and 'multi' */
  options?: string[]
}

export interface Post {
  id: string
  ownerId: string
  title: string
  description: string
  type: PostType
  roles: Role[]
  requiredSkills: string[]
  niceToHaveSkills: string[]
  hoursPerWeek: number
  duration: Duration
  /** Empty string = no preference */
  timezone: string
  requiredLinks: LinkKey[]
  status: PostStatus
  questions: Question[]
  createdAt: string
}

/** The editable part of a post (what the post form produces). */
export type PostInput = Omit<Post, 'id' | 'ownerId' | 'createdAt'>

/** string for dropdown/short/long/yesno ('Yes' | 'No'), string[] for multi */
export type AnswerValue = string | string[]

export interface Answer {
  questionId: string
  value: AnswerValue
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export interface Application {
  id: string
  postId: string
  applicantId: string
  roleId: string
  answers: Answer[]
  message: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export type ApplicationInput = Pick<Application, 'postId' | 'applicantId' | 'roleId' | 'answers' | 'message'>

export type NotificationKind = 'new-application' | 'status-change' | 'withdrawn'

export interface Notification {
  id: string
  userId: string
  kind: NotificationKind
  text: string
  /** In-app path to open when clicked */
  link: string
  read: boolean
  createdAt: string
}
