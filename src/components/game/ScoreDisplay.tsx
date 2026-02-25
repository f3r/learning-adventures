import { motion, AnimatePresence } from 'framer-motion'

interface ScoreDisplayProps {
  readonly score: number
  readonly streak: number
}

export function ScoreDisplay({ score, streak }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between text-white">
      <motion.div
        key={score}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="text-lg font-bold"
      >
        Score: {score}
      </motion.div>

      <AnimatePresence>
        {streak >= 2 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-1 bg-orange-500/30 px-3 py-1 rounded-full"
          >
            <span className="text-lg">{streak >= 3 ? '\uD83D\uDD25' : '\u26A1'}</span>
            <span className="font-bold text-sm">{streak}x streak</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
