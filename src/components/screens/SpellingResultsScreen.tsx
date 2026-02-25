import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { StarRating } from '../ui/StarRating'
import { Confetti } from '../ui/Confetti'
import { useSpelling } from '../../contexts/SpellingContext'
import { calculateStars, isPerfectGame } from '../../utils/scoring'

export function SpellingResultsScreen() {
  const navigate = useNavigate()
  const { state, startGame, reset } = useSpelling()
  const session = state.session!

  const correctCount = session.answers.filter(a => a.isCorrect).length
  const stars = calculateStars(session.score)
  const perfect = isPerfectGame(correctCount, session.questions.length)
  const isNewHighScore = session.score >= state.highScore && session.score > 0

  const handlePlayAgain = () => {
    startGame()
    navigate('/spelling', { replace: true })
  }

  const handleHome = () => {
    reset()
    navigate('/', { replace: true })
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

      <div className="bg-white/5 rounded-2xl p-4 space-y-2">
        <h3 className="text-white/70 text-sm font-semibold mb-2">Word Results</h3>
        {session.answers.map((a, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className={a.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
              {a.isCorrect ? '\u2713' : '\u2717'} {a.question.word.word}
            </span>
            {!a.isCorrect && (
              <span className="text-white/50 text-xs">
                you typed: {a.userAnswer || '(no answer)'}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Button onClick={handlePlayAgain} size="lg" className="w-full">
          Play Again
        </Button>
        <Button onClick={handleHome} variant="secondary" size="md" className="w-full">
          Home
        </Button>
      </div>
    </motion.div>
  )
}
