import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { QuestionCard } from '../game/QuestionCard'
import { AnswerInput } from '../game/AnswerInput'
import { SpellingQuestionCard } from '../game/SpellingQuestionCard'
import { SpellingInput } from '../game/SpellingInput'
import { ProgressBar } from '../game/ProgressBar'
import { ScoreDisplay } from '../game/ScoreDisplay'
import { Timer } from '../game/Timer'
import { Feedback } from '../game/Feedback'
import { useTimer } from '../../hooks/useTimer'
import { calculatePoints } from '../../utils/scoring'
import { generateQuestions } from '../../utils/questions'
import { generateSpellingQuestions } from '../../utils/spellingQuestions'
import { getPerformance, updatePairPerformance } from '../../utils/storage'
import { getSpellingPerformance } from '../../utils/spellingStorage'
import { updateWordPerformance } from '../../utils/spellingStorage'
import { TIMER_DURATION_SECONDS } from '../../constants/game'
import type { Question, AnsweredQuestion } from '../../types/game'
import type { SpellingQuestion } from '../../types/spelling'

type MixedQuestion =
  | { readonly kind: 'math'; readonly question: Question }
  | { readonly kind: 'spelling'; readonly question: SpellingQuestion }

interface MixedSession {
  readonly questions: readonly MixedQuestion[]
  readonly currentIndex: number
  readonly answers: readonly AnsweredQuestion[]
  readonly score: number
  readonly streak: number
  readonly questionStartTime: number
}

interface FeedbackState {
  readonly show: boolean
  readonly isCorrect: boolean
  readonly points: number
  readonly correctAnswer: number | string
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function MixedGameScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const tables: readonly number[] = (location.state as { tables?: number[] })?.tables ?? [2, 5, 10]

  const [session, setSession] = useState<MixedSession | null>(null)

  const mixedQuestions = useMemo(() => {
    const mathQuestions = generateQuestions(tables, getPerformance()).slice(0, 5)
    const spellingQuestions = generateSpellingQuestions(getSpellingPerformance()).slice(0, 5)

    const mixed: MixedQuestion[] = [
      ...mathQuestions.map(q => ({ kind: 'math' as const, question: q })),
      ...spellingQuestions.map(q => ({ kind: 'spelling' as const, question: q })),
    ]

    return shuffleArray(mixed)
  }, [tables])

  useEffect(() => {
    setSession({
      questions: mixedQuestions,
      currentIndex: 0,
      answers: [],
      score: 0,
      streak: 0,
      questionStartTime: Date.now(),
    })
  }, [mixedQuestions])

  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    isCorrect: false,
    points: 0,
    correctAnswer: 0,
  })
  const [inputDisabled, setInputDisabled] = useState(false)

  if (!session) return null

  const isLastQuestion = session.currentIndex >= session.questions.length - 1
  const current = session.questions[session.currentIndex]
  const totalQuestions = session.questions.length

  const handleTimeUp = useCallback(() => {
    if (inputDisabled || !session) return
    setInputDisabled(true)

    const correctAnswer = session.questions[session.currentIndex].kind === 'math'
      ? (session.questions[session.currentIndex].question as Question).answer
      : (session.questions[session.currentIndex].question as SpellingQuestion).answer

    setFeedback({ show: true, isCorrect: false, points: 0, correctAnswer })

    if (session.questions[session.currentIndex].kind === 'math') {
      const q = session.questions[session.currentIndex].question as Question
      updatePairPerformance(q.factorA, q.factorB, false)
    } else {
      const q = session.questions[session.currentIndex].question as SpellingQuestion
      updateWordPerformance(q.word.word, false)
    }

    setSession(prev => {
      if (!prev) return prev
      const answered: AnsweredQuestion = {
        question: prev.questions[prev.currentIndex].question as unknown as Question,
        userAnswer: null,
        isCorrect: false,
        timeSpent: Date.now() - prev.questionStartTime,
        pointsEarned: 0,
      }
      return {
        ...prev,
        answers: [...prev.answers, answered],
        streak: 0,
      }
    })
  }, [inputDisabled, session])

  const timerDuration = current.kind === 'spelling' ? 60 : TIMER_DURATION_SECONDS

  const { secondsLeft, progress, resetTimer } = useTimer({
    durationSeconds: timerDuration,
    onTimeUp: handleTimeUp,
    isActive: !inputDisabled && session !== null,
  })

  const handleMathSubmit = useCallback((answer: number) => {
    if (inputDisabled || !session || current.kind !== 'math') return
    setInputDisabled(true)

    const q = current.question
    const isCorrect = answer === q.answer
    const timeSpent = Date.now() - session.questionStartTime
    const pointsEarned = calculatePoints(isCorrect, session.streak, timeSpent)

    updatePairPerformance(q.factorA, q.factorB, isCorrect)

    setFeedback({ show: true, isCorrect, points: pointsEarned, correctAnswer: q.answer })

    setSession(prev => {
      if (!prev) return prev
      const answered: AnsweredQuestion = {
        question: q,
        userAnswer: answer,
        isCorrect,
        timeSpent,
        pointsEarned,
      }
      return {
        ...prev,
        answers: [...prev.answers, answered],
        score: prev.score + pointsEarned,
        streak: isCorrect ? prev.streak + 1 : 0,
      }
    })
  }, [inputDisabled, session, current])

  const handleSpellingSubmit = useCallback((answer: string) => {
    if (inputDisabled || !session || current.kind !== 'spelling') return
    setInputDisabled(true)

    const q = current.question
    const isCorrect = answer.toLowerCase().trim() === q.answer.toLowerCase()
    const timeSpent = Date.now() - session.questionStartTime
    const pointsEarned = calculatePoints(isCorrect, session.streak, timeSpent)

    updateWordPerformance(q.word.word, isCorrect)

    setFeedback({ show: true, isCorrect, points: pointsEarned, correctAnswer: q.answer })

    setSession(prev => {
      if (!prev) return prev
      const answered: AnsweredQuestion = {
        question: q as unknown as Question,
        userAnswer: null,
        isCorrect,
        timeSpent,
        pointsEarned,
      }
      return {
        ...prev,
        answers: [...prev.answers, answered],
        score: prev.score + pointsEarned,
        streak: isCorrect ? prev.streak + 1 : 0,
      }
    })
  }, [inputDisabled, session, current])

  useEffect(() => {
    if (!feedback.show) return

    const timer = setTimeout(() => {
      setFeedback(prev => ({ ...prev, show: false }))
      setInputDisabled(false)
      resetTimer()

      if (isLastQuestion) {
        navigate('/', { replace: true })
      } else {
        setSession(prev => {
          if (!prev) return prev
          return {
            ...prev,
            currentIndex: prev.currentIndex + 1,
            questionStartTime: Date.now(),
          }
        })
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [feedback.show, resetTimer, isLastQuestion, navigate])

  const progressAnswers = session.answers as readonly AnsweredQuestion[]

  return (
    <div className="space-y-5 p-4 w-full max-w-md">
      <ScoreDisplay score={session.score} streak={session.streak} />
      <Timer secondsLeft={secondsLeft} progress={progress} />
      <ProgressBar
        answers={progressAnswers}
        total={totalQuestions}
        currentIndex={session.currentIndex}
      />

      {feedback.show ? (
        <Feedback
          show={feedback.show}
          isCorrect={feedback.isCorrect}
          points={feedback.points}
          correctAnswer={feedback.isCorrect ? undefined : feedback.correctAnswer}
          questionKey={`mixed-${session.currentIndex}`}
        />
      ) : current.kind === 'math' ? (
        <>
          <QuestionCard
            question={current.question}
            questionNumber={session.currentIndex + 1}
            total={totalQuestions}
          />
          <AnswerInput
            onSubmit={handleMathSubmit}
            disabled={inputDisabled}
            questionKey={`mixed-${session.currentIndex}`}
          />
        </>
      ) : (
        <>
          <SpellingQuestionCard
            word={current.question.word}
            questionNumber={session.currentIndex + 1}
            total={totalQuestions}
          />
          <SpellingInput
            onSubmit={handleSpellingSubmit}
            disabled={inputDisabled}
            questionKey={`mixed-${session.currentIndex}`}
          />
        </>
      )}
    </div>
  )
}
