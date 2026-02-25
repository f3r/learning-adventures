import { motion } from 'framer-motion'

interface TimerProps {
  readonly secondsLeft: number
  readonly progress: number
}

export function Timer({ secondsLeft, progress }: TimerProps) {
  const isLow = secondsLeft <= 5

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-white/70">
        <span>Time</span>
        <motion.span
          animate={isLow ? { scale: [1, 1.2, 1] } : {}}
          transition={isLow ? { repeat: Infinity, duration: 0.5 } : {}}
          className={isLow ? 'text-red-400 font-bold' : ''}
        >
          {secondsLeft}s
        </motion.span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-cyan-400'}`}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}
