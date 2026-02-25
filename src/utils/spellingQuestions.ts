import type { SpellingQuestion, SpellingPerformanceMap } from '../types/spelling'
import { SPELLING_QUESTIONS_PER_SESSION } from '../constants/spelling'
import { weightedSample } from './questions'
import { getWordBank } from './spellingWordBank'

const MAX_WEIGHT = 4
const MIN_WEIGHT = 0.5
const MS_PER_DAY = 86_400_000
const RECENCY_WINDOW_DAYS = 7

export function computeWordWeight(
  performance: SpellingPerformanceMap,
  word: string,
  now: number = Date.now(),
): number {
  const key = word.toLowerCase()
  const entry = performance[key]

  if (!entry) return 3

  const total = entry.correct + entry.incorrect
  if (total === 0) return 3

  const failureBoost = (entry.incorrect / total) * 3
  const daysSinceLastSeen = (now - entry.lastSeen) / MS_PER_DAY
  const recencyBoost = Math.min(daysSinceLastSeen / RECENCY_WINDOW_DAYS, 1)

  const raw = failureBoost + recencyBoost
  return Math.min(Math.max(raw, MIN_WEIGHT), MAX_WEIGHT)
}

export function generateSpellingQuestions(
  performance: SpellingPerformanceMap = {},
): SpellingQuestion[] {
  const words = getWordBank()
  const weights = words.map(w => computeWordWeight(performance, w.word))
  const selected = weightedSample(words, weights, SPELLING_QUESTIONS_PER_SESSION)

  return selected.map(w => ({
    type: 'spelling' as const,
    word: w,
    answer: w.word.toLowerCase(),
  }))
}

export function generateWeakestSpellingQuestions(
  performance: SpellingPerformanceMap = {},
): SpellingQuestion[] {
  const wordsWithRates = getWordBank().map(w => {
    const key = w.word.toLowerCase()
    const entry = performance[key]
    if (!entry || entry.correct + entry.incorrect === 0) {
      return { word: w, failureRate: 0, attempted: false }
    }
    const total = entry.correct + entry.incorrect
    return { word: w, failureRate: entry.incorrect / total, attempted: true }
  })

  wordsWithRates.sort((a, b) => {
    if (a.attempted && !b.attempted) return -1
    if (!a.attempted && b.attempted) return 1
    return b.failureRate - a.failureRate
  })

  const selected = wordsWithRates.slice(0, SPELLING_QUESTIONS_PER_SESSION)
  const weights = selected.map(w => computeWordWeight(performance, w.word.word))
  const sampled = weightedSample(
    selected.map(w => w.word),
    weights,
    SPELLING_QUESTIONS_PER_SESSION,
  )

  return sampled.map(w => ({
    type: 'spelling' as const,
    word: w,
    answer: w.word.toLowerCase(),
  }))
}
