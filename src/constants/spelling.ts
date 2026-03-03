import type { SpellingWord } from '../types/spelling'

export const SPELLING_WORDS: readonly SpellingWord[] = [
  // Week 7
  { word: 'important', hint: 'Something that matters a lot', week: 7 },
  { word: 'therefore', hint: 'For that reason, so', week: 7 },
  { word: 'explore', hint: 'To travel and discover new things', week: 7 },
  { word: 'normal', hint: 'The usual or expected way', week: 7 },
  { word: 'squawk', hint: 'The loud cry a parrot makes', week: 7 },
  { word: 'drawing', hint: 'A picture made with pencils or crayons', week: 7 },
  { word: 'caught', hint: 'Past tense of catch', week: 7 },
  { word: 'August', hint: 'The eighth month of the year', week: 7 },
  { word: 'naughty', hint: 'Badly behaved or cheeky', week: 7 },
  { word: 'autumn', hint: 'The season between summer and winter', week: 7 },
  // Week 8
  { word: 'devotion', hint: 'A strong feeling of love or loyalty', week: 8 },
  { word: 'meditation', hint: 'Quiet thinking or focusing your mind', week: 8 },
  { word: 'celebration', hint: 'A party or event to mark something special', week: 8 },
  { word: 'hesitation', hint: 'A pause before doing something', week: 8 },
  { word: 'attraction', hint: 'Something that draws people in', week: 8 },
  { word: 'exhibition', hint: 'A public display of art or objects', week: 8 },
  { word: 'invention', hint: 'Something new that has been created', week: 8 },
  { word: 'action', hint: 'The process of doing something', week: 8 },
  { word: 'mention', hint: 'To briefly say or write about something', week: 8 },
  { word: 'position', hint: 'The place where something is located', week: 8 },
] as const

export const SPELLING_TIMER_DURATION_SECONDS = 60
export const SPELLING_QUESTIONS_PER_SESSION = 10

export const SPELLING_HIGH_SCORE_KEY = 'kai-spelling-high-score'
export const SPELLING_PERFORMANCE_KEY = 'kai-spelling-performance'
export const SPELLING_SESSION_KEY = 'kai-spelling-session'
