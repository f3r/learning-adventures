import { SPELLING_HIGH_SCORE_KEY, SPELLING_PERFORMANCE_KEY, SPELLING_SESSION_KEY } from '../constants/spelling'
import type { SpellingPerformanceMap, SpellingWordPerformance, SpellingSession } from '../types/spelling'

export function getSpellingHighScore(): number {
  try {
    const stored = localStorage.getItem(SPELLING_HIGH_SCORE_KEY)
    if (stored === null) return 0
    const parsed = Number(stored)
    return Number.isFinite(parsed) ? parsed : 0
  } catch {
    return 0
  }
}

export function setSpellingHighScore(score: number): void {
  try {
    localStorage.setItem(SPELLING_HIGH_SCORE_KEY, String(score))
  } catch {
    // localStorage may be unavailable
  }
}

export function updateSpellingHighScoreIfNeeded(score: number): boolean {
  const current = getSpellingHighScore()
  if (score > current) {
    setSpellingHighScore(score)
    return true
  }
  return false
}

export function getSpellingPerformance(): SpellingPerformanceMap {
  try {
    const stored = localStorage.getItem(SPELLING_PERFORMANCE_KEY)
    if (stored === null) return {}
    const parsed = JSON.parse(stored) as SpellingPerformanceMap
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    return parsed
  } catch {
    return {}
  }
}

export function updateWordPerformance(word: string, isCorrect: boolean): void {
  try {
    const performance = getSpellingPerformance()
    const key = word.toLowerCase()
    const existing: SpellingWordPerformance = performance[key] ?? { correct: 0, incorrect: 0, lastSeen: 0 }
    const updated: SpellingPerformanceMap = {
      ...performance,
      [key]: {
        correct: existing.correct + (isCorrect ? 1 : 0),
        incorrect: existing.incorrect + (isCorrect ? 0 : 1),
        lastSeen: Date.now(),
      },
    }
    localStorage.setItem(SPELLING_PERFORMANCE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage may be unavailable
  }
}

export function getSpellingSession(): SpellingSession | null {
  try {
    const stored = localStorage.getItem(SPELLING_SESSION_KEY)
    if (stored === null) return null
    const parsed = JSON.parse(stored) as unknown
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
    const session = parsed as SpellingSession
    if (!Array.isArray(session.questions)) return null
    return session
  } catch {
    return null
  }
}

export function saveSpellingSession(session: SpellingSession): void {
  try {
    localStorage.setItem(SPELLING_SESSION_KEY, JSON.stringify(session))
  } catch {
    // localStorage may be unavailable
  }
}

export function clearSpellingSession(): void {
  try {
    localStorage.removeItem(SPELLING_SESSION_KEY)
  } catch {
    // localStorage may be unavailable
  }
}
