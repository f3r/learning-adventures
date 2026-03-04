import type { SpellingWord } from '../types/spelling'

export const SPELLING_WORDS: readonly SpellingWord[] = [
  { word: 'devotion', hint: 'A strong feeling of love or loyalty' },
  { word: 'meditation', hint: 'Thinking deeply and calmly, often to relax' },
  { word: 'celebration', hint: 'A party or special event for something good' },
  { word: 'hesitation', hint: 'A pause before doing something, being unsure' },
  { word: 'attraction', hint: 'Something interesting that draws people in' },
  { word: 'exhibition', hint: 'A public display of art or objects' },
  { word: 'invention', hint: 'Something new that someone has created' },
  { word: 'action', hint: 'The process of doing something' },
  { word: 'mention', hint: 'To talk about something briefly' },
  { word: 'position', hint: 'The place where something or someone is' },
] as const

export const SPELLING_TIMER_DURATION_SECONDS = 60
export const SPELLING_QUESTIONS_PER_SESSION = 10

export const SPELLING_HIGH_SCORE_KEY = 'kai-spelling-high-score'
export const SPELLING_PERFORMANCE_KEY = 'kai-spelling-performance'
export const SPELLING_SESSION_KEY = 'kai-spelling-session'
