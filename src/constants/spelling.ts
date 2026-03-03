import type { SpellingWord } from '../types/spelling'

export const SPELLING_WORDS: readonly SpellingWord[] = [
  { word: 'devotion', hint: 'A strong feeling of love or loyalty' },
  { word: 'meditation', hint: 'Quiet thinking or focusing your mind' },
  { word: 'celebration', hint: 'A party or event to mark something special' },
  { word: 'hesitation', hint: 'A pause before doing something' },
  { word: 'attraction', hint: 'Something that draws people in' },
  { word: 'exhibition', hint: 'A public display of art or objects' },
  { word: 'invention', hint: 'Something new that has been created' },
  { word: 'action', hint: 'The process of doing something' },
  { word: 'mention', hint: 'To briefly say or write about something' },
  { word: 'position', hint: 'The place where something is located' },
] as const

export const SPELLING_TIMER_DURATION_SECONDS = 60
export const SPELLING_QUESTIONS_PER_SESSION = 10

export const SPELLING_HIGH_SCORE_KEY = 'kai-spelling-high-score'
export const SPELLING_PERFORMANCE_KEY = 'kai-spelling-performance'
export const SPELLING_SESSION_KEY = 'kai-spelling-session'
