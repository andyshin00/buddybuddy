import type { Question } from '../types'

// Prebuilt application-form question sets. Posters insert one and then edit freely.
// To add a template, append an object to QUESTION_TEMPLATES — ids are generated on insert.

export interface QuestionTemplate {
  id: string
  name: string
  description: string
  questions: Omit<Question, 'id'>[]
}

const LEVELS = ['None', 'Some', 'Comfortable', 'Expert']

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    id: 'web-app',
    name: 'Web app',
    description: 'Frontend fundamentals, frameworks, deployment',
    questions: [
      { type: 'dropdown', label: 'How familiar are you with HTML/CSS/JS?', required: true, options: LEVELS },
      {
        type: 'multi',
        label: 'Which frontend frameworks have you used?',
        required: false,
        options: ['React', 'Vue', 'Svelte', 'Angular', 'None yet'],
      },
      { type: 'yesno', label: 'Have you deployed a site before?', required: true },
      { type: 'long', label: 'Why does this project interest you?', required: true },
    ],
  },
  {
    id: 'mobile-app',
    name: 'Mobile app',
    description: 'Platforms, shipping experience, mobile UI',
    questions: [
      {
        type: 'multi',
        label: 'Which mobile platforms have you built for?',
        required: true,
        options: ['iOS (Swift)', 'Android (Kotlin)', 'React Native', 'Flutter', 'None yet'],
      },
      { type: 'yesno', label: 'Have you shipped an app to the App Store or Play Store?', required: true },
      { type: 'dropdown', label: 'How comfortable are you with mobile UI patterns?', required: false, options: LEVELS },
      { type: 'short', label: 'Link to an app or repo you’re proud of', required: false },
      { type: 'long', label: 'Why does this project interest you?', required: true },
    ],
  },
  {
    id: 'game',
    name: 'Game',
    description: 'Engines, area of focus, jam experience',
    questions: [
      {
        type: 'multi',
        label: 'Which engines have you used?',
        required: true,
        options: ['Unity', 'Godot', 'Unreal', 'GameMaker', 'Custom / none'],
      },
      {
        type: 'dropdown',
        label: 'Which area do you want to work on?',
        required: true,
        options: ['Programming', 'Art', 'Sound & music', 'Level design', 'Writing'],
      },
      { type: 'yesno', label: 'Have you done a game jam before?', required: false },
      { type: 'short', label: 'Favorite game, and why (one line)', required: false },
      { type: 'long', label: 'Why does this project interest you?', required: true },
    ],
  },
  {
    id: 'general',
    name: 'General / any project',
    description: 'Time, past work, collaboration style',
    questions: [
      {
        type: 'dropdown',
        label: 'How much time can you realistically give each week?',
        required: true,
        options: ['Under 3 hours', '3–6 hours', '6–10 hours', '10+ hours'],
      },
      { type: 'short', label: 'What’s one project you’ve built?', required: false },
      { type: 'yesno', label: 'Are you comfortable with Git and pull requests?', required: false },
      { type: 'long', label: 'What do you hope to get out of this collaboration?', required: true },
    ],
  },
]
