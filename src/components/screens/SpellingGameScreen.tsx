import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SpellingQuestionCard } from '../game/SpellingQuestionCard'
import { SpellingInput } from '../game/SpellingInput'
import { ProgressBar } from '../game/ProgressBar'
import { ScoreDisplay } from '../game/ScoreDisplay'
import { Timer } from '../game/Timer'
import { Feedback } from '../game/Feedback'
import { useTimer } from '../../hooks/useTimer'
import { useSpelling } from '../../contexts/SpellingContext'
import { calculatePoints } from '../../utils/scoring'
import { SPELLING_TIMER_DURATION_SECONDS, SPELLING_QUESTIONS_PER_SESSION } from '../../constants/spelling'

interface FeedbackState {
  readonly show: boolean
  readonly isCorrect: boolean
  readonly points: number
  readonly correctAnswer: string
}

export function SpellingGameScreen() {
  const navigate = useNavigate()
  const { state, submitAnswer, nextQuestion } = useSpelling()
  const session = state.session!

  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    isCorrect: false,
    points: 0,
    correctAnswer: '',
  })
  const [inputDisabled, setInputDisabled] = useState(false)

  const isLastQuestion = session.currentQuestionIndex >= session.questions.length - 1
  const currentQuestion = session.questions[session.currentQuestionIndex]

  const handleTimeUp = useCallback(() => {
    if (inputDisabled) return
    setInputDisabled(true)
    setFeedback({
      show: true,
      isCorrect: false,
      points: 0,
      correctAnswer: currentQuestion.answer,
    })
    submitAnswer('')
  }, [currentQuestion, submitAnswer, inputDisabled])

  const { secondsLeft, progress, resetTimer } = useTimer({
    durationSeconds: SPELLING_TIMER_DURATION_SECONDS,
    onTimeUp: handleTimeUp,
    isActive: !inputDisabled,
  })

  const handleSubmit = useCallback((answer: string) => {
    if (inputDisabled) return
    setInputDisabled(true)

    const isCorrect = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase()
    const timeSpent = Date.now() - session.questionStartTime
    const pointsEarned = calculatePoints(isCorrect, session.streak, timeSpent)

    submitAnswer(answer)

    setFeedback({
      show: true,
      isCorrect,
      points: pointsEarned,
      correctAnswer: currentQuestion.answer,
    })
  }, [currentQuestion, submitAnswer, inputDisabled, session.questionStartTime, session.streak])

  useEffect(() => {
    if (!feedback.show) return

    const timer = setTimeout(() => {
      setFeedback(prev => ({ ...prev, show: false }))
      setInputDisabled(false)
      resetTimer()

      if (isLastQuestion) {
        navigate('/spelling-results', { replace: true })
      } else {
        nextQuestion()
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [feedback.show, nextQuestion, resetTimer, isLastQuestion, navigate])

  const progressAnswers = session.answers.map(a => ({
    question: a.question as unknown as import('../../types/game').Question,
    userAnswer: null,
    isCorrect: a.isCorrect,
    timeSpent: a.timeSpent,
    pointsEarned: a.pointsEarned,
  }))

  return (
    <div className="space-y-5 p-4 w-full max-w-md">
      <ScoreDisplay score={session.score} streak={session.streak} />
      <Timer secondsLeft={secondsLeft} progress={progress} />
      <ProgressBar
        answers={progressAnswers}
        total={SPELLING_QUESTIONS_PER_SESSION}
        currentIndex={session.currentQuestionIndex}
      />

      {feedback.show ? (
        <Feedback
          show={feedback.show}
          isCorrect={feedback.isCorrect}
          points={feedback.points}
          correctAnswer={feedback.isCorrect ? undefined : feedback.correctAnswer}
          questionKey={`spelling-${session.currentQuestionIndex}`}
        />
      ) : (
        <>
          <SpellingQuestionCard
            word={currentQuestion.word}
            questionNumber={session.currentQuestionIndex + 1}
            total={SPELLING_QUESTIONS_PER_SESSION}
          />
          <SpellingInput
            onSubmit={handleSubmit}
            disabled={inputDisabled}
            questionKey={`spelling-${session.currentQuestionIndex}`}
          />
        </>
      )}
    </div>
  )
}
