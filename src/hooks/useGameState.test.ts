import { describe, it, expect, beforeEach } from 'vitest'
import { gameReducer, initialState } from './useGameState'
import type { GameState, Question } from '../types/game'

const mockQuestions: Question[] = [
  { factorA: 3, factorB: 4, answer: 12 },
  { factorA: 5, factorB: 6, answer: 30 },
  { factorA: 7, factorB: 8, answer: 56 },
]

describe('gameReducer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with no session', () => {
    expect(initialState.session).toBeNull()
  })

  it('SELECT_TABLES creates session', () => {
    const state = gameReducer(initialState, { type: 'SELECT_TABLES', tables: [5, 6] })
    expect(state.session).not.toBeNull()
    expect(state.session!.selectedTables).toEqual([5, 6])
    expect(state.session!.questions).toHaveLength(10)
    expect(state.session!.currentQuestionIndex).toBe(0)
    expect(state.session!.score).toBe(0)
    expect(state.session!.streak).toBe(0)
  })

  it('START_GAME sets up session with provided questions', () => {
    const now = Date.now()
    const state = gameReducer(initialState, {
      type: 'START_GAME',
      questions: mockQuestions,
      startTime: now,
    })
    expect(state.session!.questions).toEqual(mockQuestions)
    expect(state.session!.questionStartTime).toBe(now)
  })

  it('SUBMIT_ANSWER correct answer adds points and increases streak', () => {
    const now = Date.now()
    const playing: GameState = {
      highScore: 0,
      session: {
        selectedTables: [3],
        questions: mockQuestions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        streak: 0,
        questionStartTime: now - 2000,
      },
    }

    const state = gameReducer(playing, {
      type: 'SUBMIT_ANSWER',
      userAnswer: 12,
      timestamp: now,
    })

    expect(state.session!.streak).toBe(1)
    expect(state.session!.score).toBeGreaterThan(0)
    expect(state.session!.answers).toHaveLength(1)
    expect(state.session!.answers[0].isCorrect).toBe(true)
  })

  it('SUBMIT_ANSWER wrong answer resets streak', () => {
    const now = Date.now()
    const playing: GameState = {
      highScore: 0,
      session: {
        selectedTables: [3],
        questions: mockQuestions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        streak: 3,
        questionStartTime: now - 2000,
      },
    }

    const state = gameReducer(playing, {
      type: 'SUBMIT_ANSWER',
      userAnswer: 99,
      timestamp: now,
    })

    expect(state.session!.streak).toBe(0)
    expect(state.session!.answers[0].isCorrect).toBe(false)
    expect(state.session!.answers[0].pointsEarned).toBe(0)
  })

  it('NEXT_QUESTION advances index and resets start time', () => {
    const now = Date.now()
    const playing: GameState = {
      highScore: 0,
      session: {
        selectedTables: [3],
        questions: mockQuestions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        streak: 0,
        questionStartTime: now - 5000,
      },
    }

    const state = gameReducer(playing, { type: 'NEXT_QUESTION', timestamp: now })
    expect(state.session!.currentQuestionIndex).toBe(1)
    expect(state.session!.questionStartTime).toBe(now)
  })

  it('RESET clears session', () => {
    const playing: GameState = {
      highScore: 50,
      session: {
        selectedTables: [3],
        questions: mockQuestions,
        currentQuestionIndex: 2,
        answers: [],
        score: 50,
        streak: 0,
        questionStartTime: Date.now(),
      },
    }

    const state = gameReducer(playing, { type: 'RESET' })
    expect(state.session).toBeNull()
  })

  it('returns unchanged state for null session actions', () => {
    const state = gameReducer(initialState, { type: 'SUBMIT_ANSWER', userAnswer: 5, timestamp: Date.now() })
    expect(state).toBe(initialState)
  })
})
