import { describe, it, expect } from 'vitest'
import { calculatePoints, calculateStars, isPerfectGame } from './scoring'

describe('calculatePoints', () => {
  it('returns 0 for incorrect answer', () => {
    expect(calculatePoints(false, 0, 2000)).toBe(0)
  })

  it('returns base 10 points for correct answer with no streak', () => {
    expect(calculatePoints(true, 0, 6000)).toBe(10)
  })

  it('adds streak bonus of 5 per streak', () => {
    expect(calculatePoints(true, 3, 6000)).toBe(10 + 15)
  })

  it('adds fast speed bonus (+5) for under 3 seconds', () => {
    expect(calculatePoints(true, 0, 2000)).toBe(15)
  })

  it('adds medium speed bonus (+3) for under 5 seconds', () => {
    expect(calculatePoints(true, 0, 4000)).toBe(13)
  })

  it('no speed bonus for 5+ seconds', () => {
    expect(calculatePoints(true, 0, 5000)).toBe(10)
  })

  it('combines streak and speed bonuses', () => {
    // streak 2 = +10, speed <3s = +5
    expect(calculatePoints(true, 2, 1000)).toBe(10 + 10 + 5)
  })

  it('returns 0 for incorrect answer regardless of streak', () => {
    expect(calculatePoints(false, 5, 1000)).toBe(0)
  })
})

describe('calculateStars', () => {
  it('returns 1 star for score under 50', () => {
    expect(calculateStars(0)).toBe(1)
    expect(calculateStars(49)).toBe(1)
  })

  it('returns 2 stars for score 50-99', () => {
    expect(calculateStars(50)).toBe(2)
    expect(calculateStars(99)).toBe(2)
  })

  it('returns 3 stars for score 100+', () => {
    expect(calculateStars(100)).toBe(3)
    expect(calculateStars(200)).toBe(3)
  })
})

describe('isPerfectGame', () => {
  it('returns true when all answers correct', () => {
    expect(isPerfectGame(10, 10)).toBe(true)
  })

  it('returns false when some answers wrong', () => {
    expect(isPerfectGame(9, 10)).toBe(false)
  })
})
