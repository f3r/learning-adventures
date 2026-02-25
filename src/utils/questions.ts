import type { Question, PerformanceMap, Operation } from '../types/game'
import { QUESTIONS_PER_SESSION } from '../constants/game'
import { pairKey } from './storage'

function buildQuestion(a: number, b: number): Question {
  const operation: Operation = Math.random() > 0.5 ? 'multiply' : 'divide'
  const product = a * b

  if (operation === 'divide') {
    const shouldSwap = Math.random() > 0.5
    const divisor = shouldSwap ? a : b
    const quotient = shouldSwap ? b : a
    return { factorA: product, factorB: divisor, answer: quotient, operation }
  }

  const shouldSwap = Math.random() > 0.5
  return {
    factorA: shouldSwap ? b : a,
    factorB: shouldSwap ? a : b,
    answer: product,
    operation,
  }
}

const MAX_WEIGHT = 4
const MIN_WEIGHT = 0.5
const MS_PER_DAY = 86_400_000
const RECENCY_WINDOW_DAYS = 7

export function computeWeight(
  performance: PerformanceMap,
  a: number,
  b: number,
  now: number = Date.now(),
): number {
  const key = pairKey(a, b)
  const entry = performance[key]

  if (!entry) return 3

  const total = entry.correct + entry.incorrect
  if (total === 0) return 3

  const coverageBoost = 0
  const failureBoost = (entry.incorrect / total) * 3
  const daysSinceLastSeen = (now - entry.lastSeen) / MS_PER_DAY
  const recencyBoost = Math.min(daysSinceLastSeen / RECENCY_WINDOW_DAYS, 1)

  const raw = coverageBoost + failureBoost + recencyBoost
  return Math.min(Math.max(raw, MIN_WEIGHT), MAX_WEIGHT)
}

export function weightedSample<T>(
  items: readonly T[],
  weights: readonly number[],
  count: number,
): T[] {
  const remaining = items.map((item, i) => ({ item, weight: weights[i] }))
  const selected: T[] = []

  for (let n = 0; n < count && remaining.length > 0; n++) {
    const totalWeight = remaining.reduce((sum, r) => sum + r.weight, 0)
    let random = Math.random() * totalWeight

    let pickedIndex = remaining.length - 1
    for (let i = 0; i < remaining.length; i++) {
      random -= remaining[i].weight
      if (random <= 0) {
        pickedIndex = i
        break
      }
    }

    selected.push(remaining[pickedIndex].item)
    remaining.splice(pickedIndex, 1)
  }

  return selected
}

export function getWeakPairCount(performance: PerformanceMap): number {
  return Object.values(performance).filter(
    entry => entry.correct + entry.incorrect > 0,
  ).length
}

export function generateWeakestQuestions(
  performance: PerformanceMap = {},
): Question[] {
  const attemptedPairs: { table: number; multiplier: number; failureRate: number }[] = []

  for (let a = 1; a <= 12; a++) {
    for (let b = a; b <= 12; b++) {
      const key = pairKey(a, b)
      const entry = performance[key]
      if (entry && entry.correct + entry.incorrect > 0) {
        const total = entry.correct + entry.incorrect
        attemptedPairs.push({ table: a, multiplier: b, failureRate: entry.incorrect / total })
      }
    }
  }

  attemptedPairs.sort((x, y) => y.failureRate - x.failureRate)

  const weakPairs = attemptedPairs.slice(0, QUESTIONS_PER_SESSION)

  if (weakPairs.length < QUESTIONS_PER_SESSION) {
    const attemptedKeys = new Set(attemptedPairs.map(p => pairKey(p.table, p.multiplier)))
    const unseenPairs: { table: number; multiplier: number; failureRate: number }[] = []

    for (let a = 1; a <= 12; a++) {
      for (let b = a; b <= 12; b++) {
        if (!attemptedKeys.has(pairKey(a, b))) {
          unseenPairs.push({ table: a, multiplier: b, failureRate: 0 })
        }
      }
    }

    const needed = QUESTIONS_PER_SESSION - weakPairs.length
    const randomUnseen = weightedSample(
      unseenPairs,
      unseenPairs.map(() => 1),
      needed,
    )
    weakPairs.push(...randomUnseen)
  }

  const weights = weakPairs.map(p => computeWeight(performance, p.table, p.multiplier))
  const selected = weightedSample(weakPairs, weights, QUESTIONS_PER_SESSION)

  return selected.map(p => buildQuestion(p.table, p.multiplier))
}

export function generateQuestions(
  tables: readonly number[],
  performance: PerformanceMap = {},
): Question[] {
  const pairs: { readonly table: number; readonly multiplier: number }[] = []

  for (const table of tables) {
    for (let i = 1; i <= 12; i++) {
      pairs.push({ table, multiplier: i })
    }
  }

  const weights = pairs.map(p => computeWeight(performance, p.table, p.multiplier))
  const selected = weightedSample(pairs, weights, QUESTIONS_PER_SESSION)

  return selected.map(p => buildQuestion(p.table, p.multiplier))
}
