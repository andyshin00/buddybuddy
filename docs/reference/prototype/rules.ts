import { linkLabel } from '../data/constants'
import type { AnswerValue, LinkKey, Post, Question, QuestionType, User } from '../types'

// Pure business rules shared by the UI and the store, so the two never disagree.

export function hasSkill(skills: string[], skill: string) {
  const needle = skill.toLowerCase()
  return skills.some((s) => s.toLowerCase() === needle)
}

export function missingRequiredLinks(post: Post, user: User): LinkKey[] {
  return post.requiredLinks.filter((key) => !user.links[key]?.trim())
}

export function openRoles(post: Post) {
  return post.roles.filter((r) => !r.filled)
}

export interface ApplyBlocker {
  reason: string
  missingLinks?: LinkKey[]
}

/** Why `user` can't apply to `post` right now, or null if they can. */
export function getApplyBlocker(post: Post, user: User, alreadyApplied: boolean): ApplyBlocker | null {
  if (post.ownerId === user.id) return { reason: 'This is your post.' }
  if (alreadyApplied) return { reason: 'You’ve already applied to this project.' }
  if (post.status === 'closed') return { reason: 'This post is closed to new applications.' }
  if (openRoles(post).length === 0) return { reason: 'All roles on this project have been filled.' }
  const missing = missingRequiredLinks(post, user)
  if (missing.length > 0) {
    return {
      reason: `This post requires ${missing.map(linkLabel).join(' and ')} on your profile.`,
      missingLinks: missing,
    }
  }
  return null
}

export function isAnswered(value: AnswerValue | undefined) {
  if (value === undefined) return false
  return Array.isArray(value) ? value.length > 0 : value.trim().length > 0
}

/** Returns a map of questionId -> error message for unanswered required questions. */
export function validateAnswers(questions: Question[], answers: Record<string, AnswerValue>) {
  const errors: Record<string, string> = {}
  for (const q of questions) {
    if (q.required && !isAnswered(answers[q.id])) errors[q.id] = 'This question is required.'
  }
  return errors
}

export function hasOptions(type: QuestionType) {
  return type === 'dropdown' || type === 'multi'
}
