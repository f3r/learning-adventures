import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiProps {
  readonly fire: boolean
}

export function Confetti({ fire }: ConfettiProps) {
  useEffect(() => {
    if (!fire) return

    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#8b5cf6', '#22d3ee', '#4ade80', '#fbbf24'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#8b5cf6', '#22d3ee', '#4ade80', '#fbbf24'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [fire])

  return null
}
