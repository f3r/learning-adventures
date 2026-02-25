import { motion, AnimatePresence } from 'framer-motion'
import { RandomPokemon } from './RandomPokemon'

interface FeedbackProps {
  readonly show: boolean
  readonly isCorrect: boolean
  readonly points: number
  readonly correctAnswer?: number
  readonly questionKey: string
}

export function Feedback({ show, isCorrect, points, correctAnswer, questionKey }: FeedbackProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center py-4"
        >
          {isCorrect ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <p className="text-3xl font-extrabold text-emerald-400">Correct!</p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-cyan-300 font-bold mt-1"
              >
                +{points} points
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              animate={{ x: [-10, 10, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-3xl font-extrabold text-red-400">Not quite!</p>
              {correctAnswer !== undefined && (
                <p className="text-white/70 mt-1">
                  The answer was <span className="font-bold text-white">{correctAnswer}</span>
                </p>
              )}
            </motion.div>
          )}

          <RandomPokemon pokemonKey={questionKey} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
