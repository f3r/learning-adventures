import { useReducer, useCallback } from 'react'
import type { GameState, GameAction, Question } from '../types/game'
import { calculatePoints } from '../utils/scoring'
import { generateQuestions, generateWeakestQuestions } from '../utils/questions'
import { getHighScore, updateHighScoreIfNeeded, getPerformance, updatePairPerformance, saveLastSelectedTables, getSession, saveSession, clearSession } from '../utils/storage'

function createInitialState(): GameState {
  return {
    session: getSession(),
    highScore: getHighScore(),
  }
}

const initialState: GameState = createInitialState()

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_TABLES': {
      const questions = generateQuestions(action.tables, getPerformance())
      const now = Date.now()
      const session = {
        selectedTables: action.tables,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        streak: 0,
        questionStartTime: now,
      }
      saveSession(session)
      return {
        ...state,
        session,
      }
    }

    case 'START_GAME': {
      const session = {
        selectedTables: action.selectedTables ?? state.session?.selectedTables ?? [],
        questions: action.questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        streak: 0,
        questionStartTime: action.startTime,
      }
      saveSession(session)
      return {
        ...state,
        session,
      }
    }

    case 'SUBMIT_ANSWER': {
      if (!state.session) return state
      const { session } = state
      const currentQuestion = session.questions[session.currentQuestionIndex]
      const isCorrect = action.userAnswer === currentQuestion.answer
      const timeSpent = action.timestamp - session.questionStartTime
      const newStreak = isCorrect ? session.streak + 1 : 0
      const pointsEarned = calculatePoints(isCorrect, session.streak, timeSpent)

      const answeredQuestion = {
        question: currentQuestion,
        userAnswer: action.userAnswer,
        isCorrect,
        timeSpent,
        pointsEarned,
      }

      const newScore = session.score + pointsEarned
      const isLastQuestion = session.currentQuestionIndex >= session.questions.length - 1
      const isNewHighScore = isLastQuestion ? updateHighScoreIfNeeded(newScore) : false

      const updatedSession = {
        ...session,
        answers: [...session.answers, answeredQuestion],
        score: newScore,
        streak: newStreak,
      }
      saveSession(updatedSession)

      return {
        ...state,
        highScore: isNewHighScore ? newScore : state.highScore,
        session: updatedSession,
      }
    }

    case 'NEXT_QUESTION': {
      if (!state.session) return state
      const updatedSession = {
        ...state.session,
        currentQuestionIndex: state.session.currentQuestionIndex + 1,
        questionStartTime: action.timestamp,
      }
      saveSession(updatedSession)
      return {
        ...state,
        session: updatedSession,
      }
    }

    case 'FINISH_SESSION': {
      if (!state.session) return state
      updateHighScoreIfNeeded(state.session.score)
      saveSession(state.session)
      return {
        ...state,
        highScore: Math.max(state.highScore, state.session.score),
      }
    }

    case 'RESET':
      clearSession()
      return {
        session: null,
        highScore: getHighScore(),
      }

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  const selectTables = useCallback((tables: readonly number[]) => {
    saveLastSelectedTables(tables)
    dispatch({ type: 'SELECT_TABLES', tables })
  }, [])

  const startGame = useCallback((questions: readonly Question[], startTime: number) => {
    dispatch({ type: 'START_GAME', questions, startTime })
  }, [])

  const startWeakestMode = useCallback(() => {
    const questions = generateWeakestQuestions(getPerformance())
    dispatch({ type: 'START_GAME', questions, startTime: Date.now(), selectedTables: [] })
  }, [])

  const submitAnswer = useCallback((userAnswer: number | null) => {
    if (state.session) {
      const currentQuestion = state.session.questions[state.session.currentQuestionIndex]
      const isCorrect = userAnswer === currentQuestion.answer
      updatePairPerformance(currentQuestion.factorA, currentQuestion.factorB, isCorrect)
    }
    dispatch({ type: 'SUBMIT_ANSWER', userAnswer, timestamp: Date.now() })
  }, [state.session])

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION', timestamp: Date.now() })
  }, [])

  const finishSession = useCallback(() => dispatch({ type: 'FINISH_SESSION' }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return {
    state,
    selectTables,
    startGame,
    startWeakestMode,
    submitAnswer,
    nextQuestion,
    finishSession,
    reset,
  }
}

export { gameReducer, initialState }
