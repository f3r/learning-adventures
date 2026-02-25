import { HIGH_SCORE_KEY, PERFORMANCE_KEY, LAST_TABLES_KEY, SESSION_KEY } from '../constants/game'
import type { PerformanceMap, PairPerformance, GameSession } from '../types/game'

export function getHighScore(): number {
  try {
    const stored = localStorage.getItem(HIGH_SCORE_KEY)
    if (stored === null) return 0
    const parsed = Number(stored)
    return Number.isFinite(parsed) ? parsed : 0
  } catch {
    return 0
  }
}

export function setHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score))
  } catch {
    // localStorage may be unavailable
  }
}

export function updateHighScoreIfNeeded(score: number): boolean {
  const current = getHighScore()
  if (score > current) {
    setHighScore(score)
    return true
  }
  return false
}

export function pairKey(a: number, b: number): string {
  return `${Math.min(a, b)}x${Math.max(a, b)}`
}

export function getPerformance(): PerformanceMap {
  try {
    const stored = localStorage.getItem(PERFORMANCE_KEY)
    if (stored === null) return {}
    const parsed = JSON.parse(stored) as PerformanceMap
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    return parsed
  } catch {
    return {}
  }
}

export function getLastSelectedTables(): readonly number[] {
  try {
    const stored = localStorage.getItem(LAST_TABLES_KEY)
    if (stored === null) return []
    const parsed = JSON.parse(stored) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
  } catch {
    return []
  }
}

export function saveLastSelectedTables(tables: readonly number[]): void {
  try {
    localStorage.setItem(LAST_TABLES_KEY, JSON.stringify(tables))
  } catch {
    // localStorage may be unavailable
  }
}

export function getSession(): GameSession | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored === null) return null
    const parsed = JSON.parse(stored) as unknown
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
    const session = parsed as GameSession
    if (!Array.isArray(session.questions) || !Array.isArray(session.selectedTables)) return null
    return session
  } catch {
    return null
  }
}

export function saveSession(session: GameSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // localStorage may be unavailable
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // localStorage may be unavailable
  }
}

export function updatePairPerformance(factorA: number, factorB: number, isCorrect: boolean): void {
  try {
    const performance = getPerformance()
    const key = pairKey(factorA, factorB)
    const existing: PairPerformance = performance[key] ?? { correct: 0, incorrect: 0, lastSeen: 0 }
    const updated: PerformanceMap = {
      ...performance,
      [key]: {
        correct: existing.correct + (isCorrect ? 1 : 0),
        incorrect: existing.incorrect + (isCorrect ? 0 : 1),
        lastSeen: Date.now(),
      },
    }
    localStorage.setItem(PERFORMANCE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage may be unavailable
  }
}
