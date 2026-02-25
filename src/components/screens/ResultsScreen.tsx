import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { StarRating } from '../ui/StarRating'
import { Confetti } from '../ui/Confetti'
import { useGame } from '../../contexts/GameContext'
import { calculateStars, isPerfectGame } from '../../utils/scoring'

export function ResultsScreen() {
  const navigate = useNavigate()
  const { state, selectTables, startWeakestMode, reset } = useGame()
  const session = state.session!

  const correctCount = session.answers.filter(a => a.isCorrect).length
  const stars = calculateStars(session.score)
  const perfect = isPerfectGame(correctCount, session.questions.length)
  const isNewHighScore = session.score >= state.highScore && session.score > 0

  const isWeakestMode = session.selectedTables.length === 0

  const handlePlayAgain = () => {
    if (isWeakestMode) {
      startWeakestMode()
    } else {
      selectTables(session.selectedTables)
    }
    navigate('/play', { replace: true })
  }

  const handleNewTables = () => {
    reset()
    navigate('/select', { replace: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 p-6 w-full max-w-md text-center"
    >
      <Confetti fire={perfect} />

      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <h2 className="text-4xl font-extrabold text-white mb-4">
          {perfect ? 'Perfect!' : correctCount >= 7 ? 'Great Job!' : 'Keep Practicing!'}
        </h2>
        <StarRating stars={stars} />
      </motion.div>

      <div className="bg-white/10 rounded-2xl p-6 space-y-3">
        <div className="flex justify-between text-white">
          <span className="text-white/70">Score</span>
          <span className="font-bold text-2xl">{session.score}</span>
        </div>
        <div className="flex justify-between text-white">
          <span className="text-white/70">Correct</span>
          <span className="font-bold">{correctCount} / {session.questions.length}</span>
        </div>
        <div className="flex justify-between text-white">
          <span className="text-white/70">Best Streak</span>
          <span className="font-bold">
            {Math.max(...session.answers.reduce<number[]>((acc, a) => {
              if (a.isCorrect) {
                const last = acc.length > 0 ? acc[acc.length - 1] : 0
                return [...acc.slice(0, -1), last + 1]
              }
              return [...acc, 0]
            }, [0]))}
          </span>
        </div>
        {isNewHighScore && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
            className="bg-yellow-500/20 text-yellow-300 font-bold py-2 rounded-lg"
          >
            New High Score!
          </motion.div>
        )}
      </div>

      <div className="space-y-3">
        <Button onClick={handlePlayAgain} size="lg" className="w-full">
          {isWeakestMode ? 'Practice Weakest Again' : 'Play Again (Same Tables)'}
        </Button>
        <Button onClick={handleNewTables} variant="secondary" size="md" className="w-full">
          Choose Different Tables
        </Button>
      </div>
    </motion.div>
  )
}
