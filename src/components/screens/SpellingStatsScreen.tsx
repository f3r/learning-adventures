import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { getSpellingPerformance } from '../../utils/spellingStorage'
import { getWordBank } from '../../utils/spellingWordBank'
import type { SpellingPerformanceMap, SpellingWord } from '../../types/spelling'

interface WordStat {
  readonly word: string
  readonly hint: string
  readonly correct: number
  readonly total: number
  readonly rate: number
  readonly seen: boolean
}

function getWordStat(performance: SpellingPerformanceMap, w: SpellingWord): WordStat {
  const key = w.word.toLowerCase()
  const entry = performance[key]

  if (!entry) {
    return { word: w.word, hint: w.hint, correct: 0, total: 0, rate: 0, seen: false }
  }

  const total = entry.correct + entry.incorrect
  const rate = total > 0 ? entry.correct / total : 0

  return { word: w.word, hint: w.hint, correct: entry.correct, total, rate, seen: true }
}

function getMasteryIcon(stat: WordStat): string {
  if (!stat.seen) return '\u2014'
  if (stat.rate >= 0.75) return '\u2713'
  return '\u2717'
}

function getCardBorder(stat: WordStat): string {
  if (!stat.seen) return 'border-white/10'
  if (stat.rate >= 0.75) return 'border-emerald-500/50'
  return 'border-rose-500/50'
}

function getIconColor(stat: WordStat): string {
  if (!stat.seen) return 'text-white/20'
  if (stat.rate >= 0.75) return 'text-emerald-400'
  return 'text-rose-400'
}

export function SpellingStatsScreen() {
  const navigate = useNavigate()
  const performance = getSpellingPerformance()
  const words = getWordBank()

  const stats = words.map(w => getWordStat(performance, w))
  const seenCount = stats.filter(s => s.seen).length
  const masteredCount = stats.filter(s => s.seen && s.rate >= 0.75).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 w-full max-w-md mx-auto"
    >
      <div className="flex items-center gap-3 mb-5">
        <Button onClick={() => navigate('/')} variant="secondary" size="sm">
          Back
        </Button>
        <h1 className="text-xl font-bold text-white flex-1 text-center pr-12">
          Spelling Stats
        </h1>
      </div>

      <div className="bg-white/5 rounded-2xl p-4 mb-5 backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-extrabold text-white">{words.length}</p>
            <p className="text-xs text-white/50">words</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-cyan-300">{seenCount}</p>
            <p className="text-xs text-white/50">practised</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-emerald-400">{masteredCount}</p>
            <p className="text-xs text-white/50">mastered</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center mb-4 text-xs text-white/60">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
          mastered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-rose-500/30 border border-rose-500/50" />
          needs work
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-white/5 border border-white/10" />
          unseen
        </span>
      </div>

      <div className="space-y-2">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.word}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`rounded-xl border p-4 bg-white/5 backdrop-blur-sm ${getCardBorder(stat)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-lg font-bold ${getIconColor(stat)}`}>
                    {getMasteryIcon(stat)}
                  </span>
                  <span className="text-lg font-bold text-white">{stat.word}</span>
                </div>
                <p className="text-sm text-white/50 leading-snug">{stat.hint}</p>
              </div>

              <div className="ml-3">
                {stat.seen ? (
                  <div className="text-right">
                    <p className="text-base font-bold text-white">
                      {stat.correct}/{stat.total}
                    </p>
                    <p className="text-xs text-white/40">
                      {Math.round(stat.rate * 100)}%
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-white/20 italic">not tried</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
