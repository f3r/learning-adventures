import { motion } from 'framer-motion'
import type { AnsweredQuestion } from '../../types/game'

interface ProgressBarProps {
  readonly answers: readonly AnsweredQuestion[]
  readonly total: number
  readonly currentIndex: number
}

export function ProgressBar({ answers, total, currentIndex }: ProgressBarProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const answer = answers[i]
        const isCurrent = i === currentIndex

        let bgColor = 'bg-white/20'
        if (answer) {
          bgColor = answer.isCorrect ? 'bg-emerald-400' : 'bg-red-400'
        }

        return (
          <motion.div
            key={i}
            className={`h-2.5 flex-1 rounded-full ${bgColor}`}
            animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
            transition={isCurrent ? { repeat: Infinity, duration: 1.5 } : {}}
          />
        )
      })}
    </div>
  )
}
