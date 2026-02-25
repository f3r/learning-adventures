import { describe, it, expect, vi } from 'vitest'
import { generateQuestions, generateWeakestQuestions, getWeakPairCount, computeWeight, weightedSample } from './questions'
import type { PerformanceMap, Question } from '../types/game'

function assertCorrectAnswer(q: Question): void {
  if (q.operation === 'multiply') {
    expect(q.answer).toBe(q.factorA * q.factorB)
  } else {
    expect(q.answer).toBe(q.factorA / q.factorB)
  }
}

describe('generateQuestions', () => {
  it('generates exactly 10 questions', () => {
    const questions = generateQuestions([5])
    expect(questions).toHaveLength(10)
  })

  it('generates questions with correct answers', () => {
    const questions = generateQuestions([3])
    for (const q of questions) {
      assertCorrectAnswer(q)
    }
  })

  it('generates questions from selected tables', () => {
    const questions = generateQuestions([7])
    for (const q of questions) {
      // For multiply: factorA or factorB is 7
      // For divide: factorB or answer is 7 (factorA is the product)
      const involvesTable = q.factorA === 7 || q.factorB === 7 || q.answer === 7
      expect(involvesTable).toBe(true)
    }
  })

  it('handles multiple selected tables', () => {
    const questions = generateQuestions([2, 5])
    for (const q of questions) {
      const involves2 = q.factorA === 2 || q.factorB === 2 || q.answer === 2
      const involves5 = q.factorA === 5 || q.factorB === 5 || q.answer === 5
      expect(involves2 || involves5).toBe(true)
    }
  })

  it('returns 10 even when fewer pairs available from single table', () => {
    const questions = generateQuestions([1])
    expect(questions).toHaveLength(10)
  })

  it('generates questions with factors in valid range', () => {
    const questions = generateQuestions([6])
    for (const q of questions) {
      if (q.operation === 'multiply') {
        expect(q.factorA).toBeGreaterThanOrEqual(1)
        expect(q.factorA).toBeLessThanOrEqual(12)
        expect(q.factorB).toBeGreaterThanOrEqual(1)
        expect(q.factorB).toBeLessThanOrEqual(12)
      } else {
        // Division: factorA is the product (up to 144), factorB is 1-12
        expect(q.factorA).toBeGreaterThanOrEqual(1)
        expect(q.factorA).toBeLessThanOrEqual(144)
        expect(q.factorB).toBeGreaterThanOrEqual(1)
        expect(q.factorB).toBeLessThanOrEqual(12)
        expect(q.answer).toBeGreaterThanOrEqual(1)
        expect(q.answer).toBeLessThanOrEqual(12)
      }
    }
  })

  it('accepts performance data without error', () => {
    const performance: PerformanceMap = {
      '3x5': { correct: 1, incorrect: 3, lastSeen: Date.now() },
    }
    const questions = generateQuestions([3], performance)
    expect(questions).toHaveLength(10)
  })

  it('favors failed pairs when performance data exists', () => {
    const performance: PerformanceMap = {
      '3x7': { correct: 0, incorrect: 10, lastSeen: Date.now() },
    }

    let appearances = 0
    const runs = 200
    for (let i = 0; i < runs; i++) {
      const questions = generateQuestions([3], performance)
      const has3x7 = questions.some(q => {
        if (q.operation === 'multiply') {
          return (q.factorA === 3 && q.factorB === 7) || (q.factorA === 7 && q.factorB === 3)
        }
        // divide: product is 21, divisor is 3 or 7
        return q.factorA === 21 && (q.factorB === 3 || q.factorB === 7)
      })
      if (has3x7) appearances++
    }

    // With weight 3 (100% failure) vs weight 3 (never seen), all pairs have
    // equal weight so each has ~10/12 ≈ 83% chance. Allow for statistical variance.
    expect(appearances).toBeGreaterThan(runs * 0.7)
  })
})

describe('getWeakPairCount', () => {
  it('returns 0 for empty performance', () => {
    expect(getWeakPairCount({})).toBe(0)
  })

  it('counts pairs with attempts', () => {
    const perf: PerformanceMap = {
      '3x5': { correct: 1, incorrect: 2, lastSeen: Date.now() },
      '4x6': { correct: 5, incorrect: 0, lastSeen: Date.now() },
    }
    expect(getWeakPairCount(perf)).toBe(2)
  })

  it('excludes pairs with zero attempts', () => {
    const perf: PerformanceMap = {
      '3x5': { correct: 0, incorrect: 0, lastSeen: Date.now() },
      '4x6': { correct: 1, incorrect: 0, lastSeen: Date.now() },
    }
    expect(getWeakPairCount(perf)).toBe(1)
  })
})

describe('generateWeakestQuestions', () => {
  it('returns 10 questions from weakest pairs', () => {
    const perf: PerformanceMap = {}
    for (let i = 1; i <= 12; i++) {
      perf[`${i}x${i}`] = { correct: 5, incorrect: 5, lastSeen: Date.now() }
    }
    const questions = generateWeakestQuestions(perf)
    expect(questions).toHaveLength(10)
    for (const q of questions) {
      assertCorrectAnswer(q)
    }
  })

  it('prioritizes highest failure rate pairs', () => {
    const perf: PerformanceMap = {
      '2x3': { correct: 0, incorrect: 10, lastSeen: Date.now() },
      '4x5': { correct: 9, incorrect: 1, lastSeen: Date.now() },
    }
    // With only 2 attempted pairs, both will be included plus 8 unseen
    const questions = generateWeakestQuestions(perf)
    expect(questions).toHaveLength(10)
  })

  it('works when fewer than 10 pairs attempted (pads with unseen)', () => {
    const perf: PerformanceMap = {
      '3x7': { correct: 1, incorrect: 4, lastSeen: Date.now() },
    }
    const questions = generateWeakestQuestions(perf)
    expect(questions).toHaveLength(10)
    for (const q of questions) {
      assertCorrectAnswer(q)
    }
  })

  it('works with empty performance data', () => {
    const questions = generateWeakestQuestions({})
    expect(questions).toHaveLength(10)
    for (const q of questions) {
      assertCorrectAnswer(q)
      expect(q.answer).toBeGreaterThanOrEqual(1)
      expect(q.answer).toBeLessThanOrEqual(144)
    }
  })

  it('includes high-failure pairs more often than low-failure pairs', () => {
    const perf: PerformanceMap = {}
    for (let a = 1; a <= 12; a++) {
      for (let b = a; b <= 12; b++) {
        perf[`${a}x${b}`] = { correct: 10, incorrect: 0, lastSeen: Date.now() }
      }
    }
    // Make 3x7 the weakest pair
    perf['3x7'] = { correct: 0, incorrect: 10, lastSeen: Date.now() }

    let appearances = 0
    const runs = 100
    for (let i = 0; i < runs; i++) {
      const questions = generateWeakestQuestions(perf)
      const has3x7 = questions.some(q => {
        if (q.operation === 'multiply') {
          return (q.factorA === 3 && q.factorB === 7) || (q.factorA === 7 && q.factorB === 3)
        }
        return q.factorA === 21 && (q.factorB === 3 || q.factorB === 7)
      })
      if (has3x7) appearances++
    }
    expect(appearances).toBeGreaterThan(runs * 0.5)
  })
})

describe('division questions', () => {
  it('generates a mix of multiply and divide operations', () => {
    let multiplyCount = 0
    let divideCount = 0
    const runs = 50
    for (let i = 0; i < runs; i++) {
      const questions = generateQuestions([6])
      for (const q of questions) {
        if (q.operation === 'multiply') multiplyCount++
        else divideCount++
      }
    }
    expect(multiplyCount).toBeGreaterThan(0)
    expect(divideCount).toBeGreaterThan(0)
  })

  it('division questions have correct answers', () => {
    for (let i = 0; i < 50; i++) {
      const questions = generateQuestions([7])
      for (const q of questions) {
        if (q.operation === 'divide') {
          expect(q.factorA / q.factorB).toBe(q.answer)
          expect(Number.isInteger(q.answer)).toBe(true)
          expect(q.answer).toBeGreaterThanOrEqual(1)
          expect(q.answer).toBeLessThanOrEqual(12)
        }
      }
    }
  })

  it('multiply questions still have correct answers', () => {
    for (let i = 0; i < 50; i++) {
      const questions = generateQuestions([4])
      for (const q of questions) {
        if (q.operation === 'multiply') {
          expect(q.factorA * q.factorB).toBe(q.answer)
        }
      }
    }
  })

  it('weakest questions also include both operations', () => {
    let multiplyCount = 0
    let divideCount = 0
    const runs = 50
    for (let i = 0; i < runs; i++) {
      const questions = generateWeakestQuestions({})
      for (const q of questions) {
        if (q.operation === 'multiply') multiplyCount++
        else divideCount++
      }
    }
    expect(multiplyCount).toBeGreaterThan(0)
    expect(divideCount).toBeGreaterThan(0)
  })

  it('all questions have a valid operation field', () => {
    const questions = generateQuestions([3, 8])
    for (const q of questions) {
      expect(['multiply', 'divide']).toContain(q.operation)
    }
  })
})

describe('computeWeight', () => {
  const now = Date.now()
  const MS_PER_DAY = 86_400_000

  it('returns 3 for never-seen pairs (coverage boost only)', () => {
    expect(computeWeight({}, 3, 7, now)).toBe(3)
  })

  it('returns 3 for pairs with zero attempts', () => {
    const perf: PerformanceMap = {
      '3x7': { correct: 0, incorrect: 0, lastSeen: now },
    }
    expect(computeWeight(perf, 3, 7, now)).toBe(3)
  })

  it('returns 3 for 100% failure seen today', () => {
    const perf: PerformanceMap = {
      '3x7': { correct: 0, incorrect: 10, lastSeen: now },
    }
    // coverageBoost=0 + failureBoost=3 + recencyBoost=0 = 3
    expect(computeWeight(perf, 3, 7, now)).toBe(3)
  })

  it('returns ~1.93 for 50% failure seen 3 days ago', () => {
    const perf: PerformanceMap = {
      '3x7': { correct: 5, incorrect: 5, lastSeen: now - 3 * MS_PER_DAY },
    }
    // coverageBoost=0 + failureBoost=1.5 + recencyBoost=3/7≈0.4286 = ~1.93
    const weight = computeWeight(perf, 3, 7, now)
    expect(weight).toBeCloseTo(1.93, 1)
  })

  it('returns 0.5 (floor) for 100% correct seen today', () => {
    const perf: PerformanceMap = {
      '3x7': { correct: 10, incorrect: 0, lastSeen: now },
    }
    // coverageBoost=0 + failureBoost=0 + recencyBoost=0 = 0 → floor 0.5
    expect(computeWeight(perf, 3, 7, now)).toBe(0.5)
  })

  it('returns 1 for 100% correct seen 7+ days ago', () => {
    const perf: PerformanceMap = {
      '3x7': { correct: 10, incorrect: 0, lastSeen: now - 7 * MS_PER_DAY },
    }
    // coverageBoost=0 + failureBoost=0 + recencyBoost=1 = 1
    expect(computeWeight(perf, 3, 7, now)).toBe(1)
  })

  it('caps recency boost at 1 for very old pairs', () => {
    const perf: PerformanceMap = {
      '3x7': { correct: 10, incorrect: 0, lastSeen: now - 30 * MS_PER_DAY },
    }
    // recencyBoost = min(30/7, 1) = 1 → total = 1
    expect(computeWeight(perf, 3, 7, now)).toBe(1)
  })

  it('caps weight at 4', () => {
    const perf: PerformanceMap = {
      '3x7': { correct: 0, incorrect: 100, lastSeen: now - 30 * MS_PER_DAY },
    }
    // coverageBoost=0 + failureBoost=3 + recencyBoost=1 = 4
    expect(computeWeight(perf, 3, 7, now)).toBe(4)
  })

  it('normalizes factor order', () => {
    const perf: PerformanceMap = {
      '3x7': { correct: 5, incorrect: 5, lastSeen: now },
    }
    expect(computeWeight(perf, 7, 3, now)).toBe(computeWeight(perf, 3, 7, now))
  })

  it('orders weights: never-seen > failed > stale > recently-mastered', () => {
    const perf: PerformanceMap = {
      '3x4': { correct: 0, incorrect: 10, lastSeen: now },         // failed
      '3x5': { correct: 10, incorrect: 0, lastSeen: now - 5 * MS_PER_DAY }, // stale
      '3x6': { correct: 10, incorrect: 0, lastSeen: now },         // recently mastered
    }
    const neverSeen = computeWeight(perf, 3, 7, now)      // 3x7 not in perf
    const failed = computeWeight(perf, 3, 4, now)
    const stale = computeWeight(perf, 3, 5, now)
    const recentlyMastered = computeWeight(perf, 3, 6, now)

    expect(neverSeen).toBeGreaterThanOrEqual(failed)
    expect(failed).toBeGreaterThan(stale)
    expect(stale).toBeGreaterThan(recentlyMastered)
  })
})

describe('weightedSample', () => {
  it('returns requested number of items', () => {
    const items = [1, 2, 3, 4, 5]
    const weights = [1, 1, 1, 1, 1]
    const result = weightedSample(items, weights, 3)
    expect(result).toHaveLength(3)
  })

  it('returns all items if count exceeds length', () => {
    const items = [1, 2, 3]
    const weights = [1, 1, 1]
    const result = weightedSample(items, weights, 5)
    expect(result).toHaveLength(3)
  })

  it('does not repeat items', () => {
    const items = [1, 2, 3, 4, 5]
    const weights = [1, 1, 1, 1, 1]
    const result = weightedSample(items, weights, 5)
    expect(new Set(result).size).toBe(5)
  })

  it('favors higher-weighted items', () => {
    const items = ['rare', 'common']
    const weights = [0.01, 100]
    const counts = { rare: 0, common: 0 }
    for (let i = 0; i < 500; i++) {
      const [first] = weightedSample(items, weights, 1)
      counts[first]++
    }
    expect(counts.common).toBeGreaterThan(counts.rare * 5)
  })
})
