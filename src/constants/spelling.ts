import type { SpellingWord } from '../types/spelling'

export const SPELLING_WORDS: readonly SpellingWord[] = [
  { word: 'important', hint: 'Something that matters a lot' },
  { word: 'therefore', hint: 'For that reason, so' },
  { word: 'explore', hint: 'To travel and discover new things' },
  { word: 'normal', hint: 'The usual or expected way' },
  { word: 'squawk', hint: 'The loud cry a parrot makes' },
  { word: 'drawing', hint: 'A picture made with pencils or crayons' },
  { word: 'caught', hint: 'Past tense of catch' },
  { word: 'August', hint: 'The eighth month of the year' },
  { word: 'naughty', hint: 'Badly behaved or cheeky' },
  { word: 'autumn', hint: 'The season between summer and winter' },
] as const

export const SPELLING_TIMER_DURATION_SECONDS = 60
export const SPELLING_QUESTIONS_PER_SESSION = 10

export const SPELLING_HIGH_SCORE_KEY = 'kai-spelling-high-score'
export const SPELLING_PERFORMANCE_KEY = 'kai-spelling-performance'
export const SPELLING_SESSION_KEY = 'kai-spelling-session'
