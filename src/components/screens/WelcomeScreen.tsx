import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { useGame } from '../../contexts/GameContext'
import { getWeakPairCount } from '../../utils/questions'
import { getPerformance } from '../../utils/storage'

export function WelcomeScreen() {
  const navigate = useNavigate()
  const { state, startWeakestMode } = useGame()
  const weakPairCount = getWeakPairCount(getPerformance())

  const handlePracticeWeakest = () => {
    startWeakestMode()
    navigate('/play')
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
          Kai&apos;s Math
        </h1>
        <h2 className="text-3xl font-bold text-cyan-300">
          Adventure
        </h2>
      </div>

      <p className="text-white/70 text-lg">
        Master your multiplication tables!
      </p>

      <div className="space-y-3">
        <Button onClick={() => navigate('/select')} size="lg" className="w-full max-w-xs mx-auto block">
          Let&apos;s Go!
        </Button>
        {weakPairCount > 0 && (
          <Button onClick={handlePracticeWeakest} variant="secondary" size="md" className="w-full max-w-xs mx-auto block">
            Practice Weakest
          </Button>
        )}
        <Button onClick={() => navigate('/stats')} variant="secondary" size="sm" className="w-full max-w-xs mx-auto block">
          Stats
        </Button>
      </div>

      {state.highScore > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/50 text-sm"
        >
          High Score: {state.highScore}
        </motion.p>
      )}
    </motion.div>
  )
}
