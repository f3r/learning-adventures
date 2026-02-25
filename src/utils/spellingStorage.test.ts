import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getSpellingHighScore,
  setSpellingHighScore,
  updateSpellingHighScoreIfNeeded,
  getSpellingPerformance,
  updateWordPerformance,
  getSpellingSession,
  saveSpellingSession,
  clearSpellingSession,
} from './spellingStorage'
import { SPELLING_HIGH_SCORE_KEY, SPELLING_PERFORMANCE_KEY, SPELLING_SESSION_KEY } from '../constants/spelling'
import type { SpellingSession } from '../types/spelling'

const mockSession: SpellingSession = {
  questions: [
    { type: 'spelling', word: { word: 'autumn', hint: 'The season between summer and winter' }, answer: 'autumn' },
  ],
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  streak: 0,
  questionStartTime: 1000,
}

describe('spellingStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getSpellingHighScore', () => {
    it('returns 0 when no score saved', () => {
      expect(getSpellingHighScore()).toBe(0)
    })

    it('returns saved score', () => {
      localStorage.setItem(SPELLING_HIGH_SCORE_KEY, '150')
      expect(getSpellingHighScore()).toBe(150)
    })

    it('returns 0 for invalid stored value', () => {
      localStorage.setItem(SPELLING_HIGH_SCORE_KEY, 'not-a-number')
      expect(getSpellingHighScore()).toBe(0)
    })

    it('returns 0 when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(getSpellingHighScore()).toBe(0)
      vi.restoreAllMocks()
    })
  })

  describe('setSpellingHighScore', () => {
    it('saves score to localStorage', () => {
      setSpellingHighScore(100)
      expect(localStorage.getItem(SPELLING_HIGH_SCORE_KEY)).toBe('100')
    })
  })

  describe('updateSpellingHighScoreIfNeeded', () => {
    it('updates when score is higher', () => {
      setSpellingHighScore(50)
      const updated = updateSpellingHighScoreIfNeeded(100)
      expect(updated).toBe(true)
      expect(getSpellingHighScore()).toBe(100)
    })

    it('does not update when score is lower', () => {
      setSpellingHighScore(100)
      const updated = updateSpellingHighScoreIfNeeded(50)
      expect(updated).toBe(false)
      expect(getSpellingHighScore()).toBe(100)
    })

    it('does not update when score is equal', () => {
      setSpellingHighScore(100)
      const updated = updateSpellingHighScoreIfNeeded(100)
      expect(updated).toBe(false)
    })
  })

  describe('getSpellingPerformance', () => {
    it('returns empty object when nothing stored', () => {
      expect(getSpellingPerformance()).toEqual({})
    })

    it('returns stored performance data', () => {
      const data = { autumn: { correct: 2, incorrect: 1, lastSeen: 1000 } }
      localStorage.setItem(SPELLING_PERFORMANCE_KEY, JSON.stringify(data))
      expect(getSpellingPerformance()).toEqual(data)
    })

    it('returns empty object for invalid JSON', () => {
      localStorage.setItem(SPELLING_PERFORMANCE_KEY, 'not-json')
      expect(getSpellingPerformance()).toEqual({})
    })

    it('returns empty object for non-object JSON', () => {
      localStorage.setItem(SPELLING_PERFORMANCE_KEY, '"string"')
      expect(getSpellingPerformance()).toEqual({})
    })

    it('returns empty object when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(getSpellingPerformance()).toEqual({})
      vi.restoreAllMocks()
    })
  })

  describe('updateWordPerformance', () => {
    it('creates new entry for unseen word on correct answer', () => {
      updateWordPerformance('autumn', true)
      const perf = getSpellingPerformance()
      expect(perf['autumn']).toEqual(expect.objectContaining({
        correct: 1,
        incorrect: 0,
      }))
    })

    it('creates new entry for unseen word on incorrect answer', () => {
      updateWordPerformance('autumn', false)
      const perf = getSpellingPerformance()
      expect(perf['autumn']).toEqual(expect.objectContaining({
        correct: 0,
        incorrect: 1,
      }))
    })

    it('increments existing entry', () => {
      updateWordPerformance('autumn', true)
      updateWordPerformance('autumn', true)
      updateWordPerformance('autumn', false)
      const perf = getSpellingPerformance()
      expect(perf['autumn'].correct).toBe(2)
      expect(perf['autumn'].incorrect).toBe(1)
    })

    it('normalizes to lowercase', () => {
      updateWordPerformance('Autumn', true)
      updateWordPerformance('AUTUMN', false)
      const perf = getSpellingPerformance()
      expect(perf['autumn'].correct).toBe(1)
      expect(perf['autumn'].incorrect).toBe(1)
    })

    it('sets lastSeen timestamp', () => {
      const before = Date.now()
      updateWordPerformance('autumn', true)
      const after = Date.now()
      const perf = getSpellingPerformance()
      expect(perf['autumn'].lastSeen).toBeGreaterThanOrEqual(before)
      expect(perf['autumn'].lastSeen).toBeLessThanOrEqual(after)
    })

    it('does not throw when localStorage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(() => updateWordPerformance('autumn', true)).not.toThrow()
      vi.restoreAllMocks()
    })
  })

  describe('getSpellingSession', () => {
    it('returns null when nothing stored', () => {
      expect(getSpellingSession()).toBeNull()
    })

    it('returns stored session', () => {
      localStorage.setItem(SPELLING_SESSION_KEY, JSON.stringify(mockSession))
      expect(getSpellingSession()).toEqual(mockSession)
    })

    it('returns null for invalid JSON', () => {
      localStorage.setItem(SPELLING_SESSION_KEY, 'not-json')
      expect(getSpellingSession()).toBeNull()
    })

    it('returns null for non-object JSON', () => {
      localStorage.setItem(SPELLING_SESSION_KEY, '"string"')
      expect(getSpellingSession()).toBeNull()
    })

    it('returns null for object missing questions array', () => {
      localStorage.setItem(SPELLING_SESSION_KEY, JSON.stringify({ questions: 'bad' }))
      expect(getSpellingSession()).toBeNull()
    })

    it('returns null when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(getSpellingSession()).toBeNull()
      vi.restoreAllMocks()
    })
  })

  describe('saveSpellingSession', () => {
    it('saves session to localStorage', () => {
      saveSpellingSession(mockSession)
      const stored = localStorage.getItem(SPELLING_SESSION_KEY)
      expect(JSON.parse(stored!)).toEqual(mockSession)
    })

    it('does not throw when localStorage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(() => saveSpellingSession(mockSession)).not.toThrow()
      vi.restoreAllMocks()
    })
  })

  describe('clearSpellingSession', () => {
    it('removes session from localStorage', () => {
      saveSpellingSession(mockSession)
      expect(getSpellingSession()).not.toBeNull()
      clearSpellingSession()
      expect(getSpellingSession()).toBeNull()
    })

    it('does not throw when localStorage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(() => clearSpellingSession()).not.toThrow()
      vi.restoreAllMocks()
    })
  })
})
