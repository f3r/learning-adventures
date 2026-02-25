import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getHighScore, setHighScore, updateHighScoreIfNeeded, pairKey, getPerformance, updatePairPerformance, getLastSelectedTables, saveLastSelectedTables, getSession, saveSession, clearSession } from './storage'
import { HIGH_SCORE_KEY, PERFORMANCE_KEY, LAST_TABLES_KEY, SESSION_KEY } from '../constants/game'
import type { GameSession } from '../types/game'

const mockSession: GameSession = {
  selectedTables: [3, 5],
  questions: [
    { factorA: 3, factorB: 5, answer: 15 },
    { factorA: 5, factorB: 3, answer: 15 },
  ],
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  streak: 0,
  questionStartTime: 1000,
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getHighScore', () => {
    it('returns 0 when no score saved', () => {
      expect(getHighScore()).toBe(0)
    })

    it('returns saved score', () => {
      localStorage.setItem(HIGH_SCORE_KEY, '150')
      expect(getHighScore()).toBe(150)
    })

    it('returns 0 for invalid stored value', () => {
      localStorage.setItem(HIGH_SCORE_KEY, 'not-a-number')
      expect(getHighScore()).toBe(0)
    })

    it('returns 0 when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(getHighScore()).toBe(0)
      vi.restoreAllMocks()
    })
  })

  describe('setHighScore', () => {
    it('saves score to localStorage', () => {
      setHighScore(100)
      expect(localStorage.getItem(HIGH_SCORE_KEY)).toBe('100')
    })
  })

  describe('updateHighScoreIfNeeded', () => {
    it('updates when score is higher', () => {
      setHighScore(50)
      const updated = updateHighScoreIfNeeded(100)
      expect(updated).toBe(true)
      expect(getHighScore()).toBe(100)
    })

    it('does not update when score is lower', () => {
      setHighScore(100)
      const updated = updateHighScoreIfNeeded(50)
      expect(updated).toBe(false)
      expect(getHighScore()).toBe(100)
    })

    it('does not update when score is equal', () => {
      setHighScore(100)
      const updated = updateHighScoreIfNeeded(100)
      expect(updated).toBe(false)
    })
  })

  describe('pairKey', () => {
    it('puts smaller factor first', () => {
      expect(pairKey(7, 3)).toBe('3x7')
      expect(pairKey(3, 7)).toBe('3x7')
    })

    it('handles equal factors', () => {
      expect(pairKey(5, 5)).toBe('5x5')
    })
  })

  describe('getPerformance', () => {
    it('returns empty object when nothing stored', () => {
      expect(getPerformance()).toEqual({})
    })

    it('returns stored performance data', () => {
      const data = { '3x7': { correct: 2, incorrect: 1, lastSeen: 1000 } }
      localStorage.setItem(PERFORMANCE_KEY, JSON.stringify(data))
      expect(getPerformance()).toEqual(data)
    })

    it('returns empty object for invalid JSON', () => {
      localStorage.setItem(PERFORMANCE_KEY, 'not-json')
      expect(getPerformance()).toEqual({})
    })

    it('returns empty object for non-object JSON', () => {
      localStorage.setItem(PERFORMANCE_KEY, '"string"')
      expect(getPerformance()).toEqual({})
    })

    it('returns empty object when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(getPerformance()).toEqual({})
      vi.restoreAllMocks()
    })
  })

  describe('updatePairPerformance', () => {
    it('creates new entry for unseen pair on correct answer', () => {
      updatePairPerformance(3, 7, true)
      const perf = getPerformance()
      expect(perf['3x7']).toEqual(expect.objectContaining({
        correct: 1,
        incorrect: 0,
      }))
    })

    it('creates new entry for unseen pair on incorrect answer', () => {
      updatePairPerformance(3, 7, false)
      const perf = getPerformance()
      expect(perf['3x7']).toEqual(expect.objectContaining({
        correct: 0,
        incorrect: 1,
      }))
    })

    it('increments existing entry', () => {
      updatePairPerformance(3, 7, true)
      updatePairPerformance(3, 7, true)
      updatePairPerformance(3, 7, false)
      const perf = getPerformance()
      expect(perf['3x7'].correct).toBe(2)
      expect(perf['3x7'].incorrect).toBe(1)
    })

    it('normalizes factor order', () => {
      updatePairPerformance(7, 3, true)
      updatePairPerformance(3, 7, false)
      const perf = getPerformance()
      expect(perf['3x7'].correct).toBe(1)
      expect(perf['3x7'].incorrect).toBe(1)
    })

    it('sets lastSeen timestamp', () => {
      const before = Date.now()
      updatePairPerformance(3, 7, true)
      const after = Date.now()
      const perf = getPerformance()
      expect(perf['3x7'].lastSeen).toBeGreaterThanOrEqual(before)
      expect(perf['3x7'].lastSeen).toBeLessThanOrEqual(after)
    })

    it('does not throw when localStorage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(() => updatePairPerformance(3, 7, true)).not.toThrow()
      vi.restoreAllMocks()
    })
  })

  describe('getLastSelectedTables', () => {
    it('returns empty array when nothing stored', () => {
      expect(getLastSelectedTables()).toEqual([])
    })

    it('returns stored tables', () => {
      localStorage.setItem(LAST_TABLES_KEY, JSON.stringify([3, 5, 7]))
      expect(getLastSelectedTables()).toEqual([3, 5, 7])
    })

    it('returns empty array for invalid JSON', () => {
      localStorage.setItem(LAST_TABLES_KEY, 'not-json')
      expect(getLastSelectedTables()).toEqual([])
    })

    it('returns empty array for non-array JSON', () => {
      localStorage.setItem(LAST_TABLES_KEY, '{"a":1}')
      expect(getLastSelectedTables()).toEqual([])
    })

    it('filters out non-number values', () => {
      localStorage.setItem(LAST_TABLES_KEY, JSON.stringify([3, 'bad', 7, null]))
      expect(getLastSelectedTables()).toEqual([3, 7])
    })

    it('returns empty array when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(getLastSelectedTables()).toEqual([])
      vi.restoreAllMocks()
    })
  })

  describe('saveLastSelectedTables', () => {
    it('saves tables to localStorage', () => {
      saveLastSelectedTables([2, 5, 9])
      expect(localStorage.getItem(LAST_TABLES_KEY)).toBe('[2,5,9]')
    })

    it('does not throw when localStorage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(() => saveLastSelectedTables([3])).not.toThrow()
      vi.restoreAllMocks()
    })
  })

  describe('getSession', () => {
    it('returns null when nothing stored', () => {
      expect(getSession()).toBeNull()
    })

    it('returns stored session', () => {
      localStorage.setItem(SESSION_KEY, JSON.stringify(mockSession))
      const session = getSession()
      expect(session).toEqual(mockSession)
    })

    it('returns null for invalid JSON', () => {
      localStorage.setItem(SESSION_KEY, 'not-json')
      expect(getSession()).toBeNull()
    })

    it('returns null for non-object JSON', () => {
      localStorage.setItem(SESSION_KEY, '"string"')
      expect(getSession()).toBeNull()
    })

    it('returns null for array JSON', () => {
      localStorage.setItem(SESSION_KEY, '[1,2,3]')
      expect(getSession()).toBeNull()
    })

    it('returns null for object missing questions array', () => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ selectedTables: [3], questions: 'bad' }))
      expect(getSession()).toBeNull()
    })

    it('returns null for object missing selectedTables array', () => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ selectedTables: 'bad', questions: [] }))
      expect(getSession()).toBeNull()
    })

    it('returns null when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(getSession()).toBeNull()
      vi.restoreAllMocks()
    })
  })

  describe('saveSession', () => {
    it('saves session to localStorage', () => {
      saveSession(mockSession)
      const stored = localStorage.getItem(SESSION_KEY)
      expect(JSON.parse(stored!)).toEqual(mockSession)
    })

    it('does not throw when localStorage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(() => saveSession(mockSession)).not.toThrow()
      vi.restoreAllMocks()
    })
  })

  describe('clearSession', () => {
    it('removes session from localStorage', () => {
      saveSession(mockSession)
      expect(getSession()).not.toBeNull()
      clearSession()
      expect(getSession()).toBeNull()
    })

    it('does not throw when localStorage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(() => clearSession()).not.toThrow()
      vi.restoreAllMocks()
    })
  })
})
