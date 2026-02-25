import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QuestionCard } from '../game/QuestionCard'
import { AnswerInput } from '../game/AnswerInput'
import { ProgressBar } from '../game/ProgressBar'
import { ScoreDisplay } from '../game/ScoreDisplay'
import { Timer } from '../game/Timer'
import { Feedback } from '../game/Feedback'
import { useTimer } from '../../hooks/useTimer'
import { useGame } from '../../contexts/GameContext'
import { calculatePoints } from '../../utils/scoring'
import { TIMER_DURATION_SECONDS, QUESTIONS_PER_SESSION } from '../../constants/game'

interface FeedbackState {
  readonly show: boolean
  readonly isCorrect: boolean
  readonly points: number
  readonly correctAnswer: number
}

export function GameScreen() {
  const navigate = useNavigate()
  const { state, submitAnswer, nextQuestion } = useGame()
  const session = state.session!

  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    isCorrect: false,
    points: 0,
    correctAnswer: 0,
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
    submitAnswer(null)
  }, [currentQuestion, submitAnswer, inputDisabled])

  const { secondsLeft, progress, resetTimer } = useTimer({
    durationSeconds: TIMER_DURATION_SECONDS,
    onTimeUp: handleTimeUp,
    isActive: !inputDisabled,
  })

  const handleSubmit = useCallback((answer: number) => {
    if (inputDisabled) return
    setInputDisabled(true)

    const isCorrect = answer === currentQuestion.answer
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
        navigate('/results', { replace: true })
      } else {
        nextQuestion()
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [feedback.show, nextQuestion, resetTimer, isLastQuestion, navigate])

  return (
    <div className="space-y-5 p-4 w-full max-w-md">
      <ScoreDisplay score={session.score} streak={session.streak} />
      <Timer secondsLeft={secondsLeft} progress={progress} />
      <ProgressBar
        answers={session.answers}
        total={QUESTIONS_PER_SESSION}
        currentIndex={session.currentQuestionIndex}
      />

      {feedback.show ? (
        <Feedback
          show={feedback.show}
          isCorrect={feedback.isCorrect}
          points={feedback.points}
          correctAnswer={feedback.isCorrect ? undefined : feedback.correctAnswer}
          questionKey={`${session.currentQuestionIndex}`}
        />
      ) : (
        <>
          <QuestionCard
            question={currentQuestion}
            questionNumber={session.currentQuestionIndex + 1}
            total={QUESTIONS_PER_SESSION}
          />
          <AnswerInput
            onSubmit={handleSubmit}
            disabled={inputDisabled}
            questionKey={`${session.currentQuestionIndex}`}
          />
        </>
      )}
    </div>
  )
}
