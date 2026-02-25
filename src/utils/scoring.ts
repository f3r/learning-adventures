import {
  BASE_POINTS,
  STREAK_BONUS,
  SPEED_BONUS_FAST,
  SPEED_BONUS_MEDIUM,
  SPEED_THRESHOLD_FAST,
  SPEED_THRESHOLD_MEDIUM,
  STAR_THRESHOLDS,
} from '../constants/game'

export function calculatePoints(isCorrect: boolean, streak: number, timeSpentMs: number): number {
  if (!isCorrect) return 0

  let points = BASE_POINTS
  points += streak * STREAK_BONUS

  if (timeSpentMs < SPEED_THRESHOLD_FAST) {
    points += SPEED_BONUS_FAST
  } else if (timeSpentMs < SPEED_THRESHOLD_MEDIUM) {
    points += SPEED_BONUS_MEDIUM
  }

  return points
}

export function calculateStars(score: number): number {
  if (score >= STAR_THRESHOLDS.THREE) return 3
  if (score >= STAR_THRESHOLDS.TWO) return 2
  return 1
}

export function isPerfectGame(correctCount: number, totalQuestions: number): boolean {
  return correctCount === totalQuestions
}
