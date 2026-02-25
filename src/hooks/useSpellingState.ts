import { useReducer, useCallback } from 'react'
import type { SpellingState, SpellingAction, SpellingQuestion } from '../types/spelling'
import { calculatePoints } from '../utils/scoring'
import { generateSpellingQuestions, generateWeakestSpellingQuestions } from '../utils/spellingQuestions'
import {
  getSpellingHighScore,
  updateSpellingHighScoreIfNeeded,
  getSpellingPerformance,
  updateWordPerformance,
  getSpellingSession,
  saveSpellingSession,
  clearSpellingSession,
} from '../utils/spellingStorage'

function createInitialState(): SpellingState {
  return {
    session: getSpellingSession(),
    highScore: getSpellingHighScore(),
  }
}

function spellingReducer(state: SpellingState, action: SpellingAction): SpellingState {
  switch (action.type) {
    case 'START_GAME': {
      const session = {
        questions: action.questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        streak: 0,
        questionStartTime: action.startTime,
      }
      saveSpellingSession(session)
      return { ...state, session }
    }

    case 'SUBMIT_ANSWER': {
      if (!state.session) return state
      const { session } = state
      const currentQuestion = session.questions[session.currentQuestionIndex]
      const isCorrect = action.userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase()
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
      const isNewHighScore = isLastQuestion ? updateSpellingHighScoreIfNeeded(newScore) : false

      const updatedSession = {
        ...session,
        answers: [...session.answers, answeredQuestion],
        score: newScore,
        streak: newStreak,
      }
      saveSpellingSession(updatedSession)

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
      saveSpellingSession(updatedSession)
      return { ...state, session: updatedSession }
    }

    case 'FINISH_SESSION': {
      if (!state.session) return state
      updateSpellingHighScoreIfNeeded(state.session.score)
      saveSpellingSession(state.session)
      return {
        ...state,
        highScore: Math.max(state.highScore, state.session.score),
      }
    }

    case 'RESET':
      clearSpellingSession()
      return {
        session: null,
        highScore: getSpellingHighScore(),
      }

    default:
      return state
  }
}

export function useSpellingState() {
  const [state, dispatch] = useReducer(spellingReducer, undefined, createInitialState)

  const startGame = useCallback(() => {
    const questions = generateSpellingQuestions(getSpellingPerformance())
    dispatch({ type: 'START_GAME', questions, startTime: Date.now() })
  }, [])

  const startWeakestMode = useCallback(() => {
    const questions = generateWeakestSpellingQuestions(getSpellingPerformance())
    dispatch({ type: 'START_GAME', questions, startTime: Date.now() })
  }, [])

  const startWithQuestions = useCallback((questions: readonly SpellingQuestion[]) => {
    dispatch({ type: 'START_GAME', questions, startTime: Date.now() })
  }, [])

  const submitAnswer = useCallback((userAnswer: string) => {
    if (state.session) {
      const currentQuestion = state.session.questions[state.session.currentQuestionIndex]
      const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase()
      updateWordPerformance(currentQuestion.word.word, isCorrect)
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
    startGame,
    startWeakestMode,
    startWithQuestions,
    submitAnswer,
    nextQuestion,
    finishSession,
    reset,
  }
}

export { spellingReducer }
