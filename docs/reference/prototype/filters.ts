import type { Duration, Post, PostType } from '../types'

export interface Filters {
  search: string
  type: PostType | ''
  skills: string[]
  maxHours: number | ''
  duration: Duration | ''
}

export const EMPTY_FILTERS: Filters = { search: '', type: '', skills: [], maxHours: '', duration: '' }

/** All filters combine (AND). Within skills, a post matches if it lists ANY selected skill. */
export function applyFilters(posts: Post[], f: Filters) {
  const query = f.search.trim().toLowerCase()
  const wanted = f.skills.map((s) => s.toLowerCase())

  return posts.filter((post) => {
    const postSkills = [...post.requiredSkills, ...post.niceToHaveSkills]
    if (query) {
      const haystack = [post.title, post.description, ...postSkills, ...post.roles.map((r) => r.name)].join(' ').toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (f.type && post.type !== f.type) return false
    if (f.duration && post.duration !== f.duration) return false
    if (f.maxHours !== '' && post.hoursPerWeek > f.maxHours) return false
    if (wanted.length && !postSkills.some((s) => wanted.includes(s.toLowerCase()))) return false
    return true
  })
}
