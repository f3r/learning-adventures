import type { SpellingWord } from '../types/spelling'

export const SPELLING_WORDS: readonly SpellingWord[] = [
  { word: 'expression', hint: 'A look on your face that shows how you feel' },
  { word: 'discussion', hint: 'A talk between people about a topic' },
  { word: 'confession', hint: 'Telling someone something you did wrong' },
  { word: 'permission', hint: 'When someone says you are allowed to do something' },
  { word: 'admission', hint: 'Being let in, or saying something is true' },
  { word: 'mission', hint: 'An important job or task to complete' },
  { word: 'possession', hint: 'Something that belongs to you' },
  { word: 'profession', hint: 'A job that needs special training, like a doctor' },
  { word: 'impression', hint: 'The idea or feeling you get about someone' },
  { word: 'compassion', hint: 'Caring about others when they are sad or hurt' },
] as const

export const SPELLING_TIMER_DURATION_SECONDS = 60
export const SPELLING_QUESTIONS_PER_SESSION = 10

export const SPELLING_HIGH_SCORE_KEY = 'kai-spelling-high-score'
export const SPELLING_PERFORMANCE_KEY = 'kai-spelling-performance'
export const SPELLING_SESSION_KEY = 'kai-spelling-session'
