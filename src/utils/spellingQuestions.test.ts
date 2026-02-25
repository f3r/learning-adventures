import { describe, it, expect } from 'vitest'
import { computeWordWeight, generateSpellingQuestions, generateWeakestSpellingQuestions } from './spellingQuestions'
import type { SpellingPerformanceMap } from '../types/spelling'

describe('computeWordWeight', () => {
  const now = Date.now()
  const MS_PER_DAY = 86_400_000

  it('returns 3 for never-seen words', () => {
    expect(computeWordWeight({}, 'autumn', now)).toBe(3)
  })

  it('returns 3 for words with zero attempts', () => {
    const perf: SpellingPerformanceMap = {
      autumn: { correct: 0, incorrect: 0, lastSeen: now },
    }
    expect(computeWordWeight(perf, 'autumn', now)).toBe(3)
  })

  it('returns 3 for 100% failure seen today', () => {
    const perf: SpellingPerformanceMap = {
      autumn: { correct: 0, incorrect: 10, lastSeen: now },
    }
    expect(computeWordWeight(perf, 'autumn', now)).toBe(3)
  })

  it('returns 0.5 (floor) for 100% correct seen today', () => {
    const perf: SpellingPerformanceMap = {
      autumn: { correct: 10, incorrect: 0, lastSeen: now },
    }
    expect(computeWordWeight(perf, 'autumn', now)).toBe(0.5)
  })

  it('returns 1 for 100% correct seen 7+ days ago', () => {
    const perf: SpellingPerformanceMap = {
      autumn: { correct: 10, incorrect: 0, lastSeen: now - 7 * MS_PER_DAY },
    }
    expect(computeWordWeight(perf, 'autumn', now)).toBe(1)
  })

  it('caps weight at 4', () => {
    const perf: SpellingPerformanceMap = {
      autumn: { correct: 0, incorrect: 100, lastSeen: now - 30 * MS_PER_DAY },
    }
    expect(computeWordWeight(perf, 'autumn', now)).toBe(4)
  })

  it('normalizes word to lowercase', () => {
    const perf: SpellingPerformanceMap = {
      autumn: { correct: 5, incorrect: 5, lastSeen: now },
    }
    expect(computeWordWeight(perf, 'Autumn', now)).toBe(computeWordWeight(perf, 'autumn', now))
  })
})

describe('generateSpellingQuestions', () => {
  it('generates exactly 10 questions', () => {
    const questions = generateSpellingQuestions()
    expect(questions).toHaveLength(10)
  })

  it('generates questions with type spelling', () => {
    const questions = generateSpellingQuestions()
    for (const q of questions) {
      expect(q.type).toBe('spelling')
    }
  })

  it('generates questions with matching word and answer', () => {
    const questions = generateSpellingQuestions()
    for (const q of questions) {
      expect(q.answer).toBe(q.word.word.toLowerCase())
    }
  })

  it('generates questions with hints', () => {
    const questions = generateSpellingQuestions()
    for (const q of questions) {
      expect(q.word.hint).toBeTruthy()
    }
  })

  it('accepts performance data without error', () => {
    const performance: SpellingPerformanceMap = {
      autumn: { correct: 1, incorrect: 3, lastSeen: Date.now() },
    }
    const questions = generateSpellingQuestions(performance)
    expect(questions).toHaveLength(10)
  })

  it('favors failed words when performance data exists', () => {
    const performance: SpellingPerformanceMap = {
      autumn: { correct: 0, incorrect: 10, lastSeen: Date.now() },
    }

    let appearances = 0
    const runs = 200
    for (let i = 0; i < runs; i++) {
      const questions = generateSpellingQuestions(performance)
      const hasAutumn = questions.some(q => q.word.word === 'autumn')
      if (hasAutumn) appearances++
    }

    expect(appearances).toBeGreaterThan(runs * 0.7)
  })
})

describe('generateWeakestSpellingQuestions', () => {
  it('returns 10 questions', () => {
    const questions = generateWeakestSpellingQuestions()
    expect(questions).toHaveLength(10)
  })

  it('works with empty performance data', () => {
    const questions = generateWeakestSpellingQuestions({})
    expect(questions).toHaveLength(10)
    for (const q of questions) {
      expect(q.type).toBe('spelling')
      expect(q.answer).toBe(q.word.word.toLowerCase())
    }
  })

  it('prioritizes attempted words with high failure rates', () => {
    const perf: SpellingPerformanceMap = {
      autumn: { correct: 0, incorrect: 10, lastSeen: Date.now() },
      caught: { correct: 9, incorrect: 1, lastSeen: Date.now() },
    }
    const questions = generateWeakestSpellingQuestions(perf)
    expect(questions).toHaveLength(10)
  })
})
