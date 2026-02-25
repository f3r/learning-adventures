import { useState, useEffect, useCallback, useRef } from 'react'

interface UseTimerOptions {
  readonly durationSeconds: number
  readonly onTimeUp: () => void
  readonly isActive: boolean
}

export function useTimer({ durationSeconds, onTimeUp, isActive }: UseTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)
  const onTimeUpRef = useRef(onTimeUp)
  onTimeUpRef.current = onTimeUp

  const resetTimer = useCallback(() => {
    setSecondsLeft(durationSeconds)
  }, [durationSeconds])

  useEffect(() => {
    if (!isActive) return

    if (secondsLeft <= 0) {
      onTimeUpRef.current()
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(interval)
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, secondsLeft])

  const progress = secondsLeft / durationSeconds

  return { secondsLeft, progress, resetTimer }
}
