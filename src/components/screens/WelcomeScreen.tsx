import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { useGame } from '../../contexts/GameContext'
import { useSpelling } from '../../contexts/SpellingContext'
import { getWeakPairCount } from '../../utils/questions'
import { getPerformance } from '../../utils/storage'

export function WelcomeScreen() {
  const navigate = useNavigate()
  const { state: mathState, startWeakestMode } = useGame()
  const { state: spellingState, startGame: startSpelling } = useSpelling()
  const weakPairCount = getWeakPairCount(getPerformance())

  const handlePracticeWeakest = () => {
    startWeakestMode()
    navigate('/play')
  }

  const handleSpelling = () => {
    startSpelling()
    navigate('/spelling')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8 p-8"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="text-7xl"
      >
        🧮
      </motion.div>

      <div>
        <h1 className="text-5xl font-extrabold text-white mb-2">
          Learnbury
        </h1>
        <h2 className="text-3xl font-bold text-cyan-300">
          Adventure
        </h2>
      </div>

      <p className="text-white/70 text-lg">
        Master maths and spelling!
      </p>

      <div className="space-y-3">
        <Button onClick={() => navigate('/select')} size="lg" className="w-full max-w-xs mx-auto block">
          Maths
        </Button>
        <Button onClick={handleSpelling} size="lg" variant="success" className="w-full max-w-xs mx-auto block">
          Spelling
        </Button>
        <Button onClick={() => navigate('/mixed-select')} size="md" variant="secondary" className="w-full max-w-xs mx-auto block">
          Mixed Mode
        </Button>
        {weakPairCount > 0 && (
          <Button onClick={handlePracticeWeakest} variant="secondary" size="sm" className="w-full max-w-xs mx-auto block">
            Practice Weakest Maths
          </Button>
        )}
        <div className="flex gap-2 justify-center flex-wrap">
          <Button onClick={() => navigate('/stats')} variant="secondary" size="sm">
            Maths Stats
          </Button>
          <Button onClick={() => navigate('/spelling-stats')} variant="secondary" size="sm">
            Spelling Stats
          </Button>
          <Button onClick={() => navigate('/word-bank')} variant="secondary" size="sm">
            Manage Words
          </Button>
        </div>
      </div>

      {(mathState.highScore > 0 || spellingState.highScore > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/50 text-sm space-y-1"
        >
          {mathState.highScore > 0 && (
            <p>Maths High Score: {mathState.highScore}</p>
          )}
          {spellingState.highScore > 0 && (
            <p>Spelling High Score: {spellingState.highScore}</p>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
