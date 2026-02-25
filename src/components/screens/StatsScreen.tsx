import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { getPerformance, pairKey } from '../../utils/storage'
import type { PerformanceMap } from '../../types/game'

interface CellData {
  readonly correct: number
  readonly total: number
  readonly rate: number
  readonly seen: boolean
}

function getCellData(performance: PerformanceMap, row: number, col: number): CellData {
  const key = pairKey(row, col)
  const entry = performance[key]

  if (!entry) {
    return { correct: 0, total: 0, rate: 0, seen: false }
  }

  const total = entry.correct + entry.incorrect
  const rate = total > 0 ? entry.correct / total : 0

  return { correct: entry.correct, total, rate, seen: true }
}

function getCellStyle(cell: CellData): string {
  if (!cell.seen) return 'bg-white/5 text-white/25'
  if (cell.rate >= 0.75) return 'bg-emerald-500/80 text-white shadow-sm shadow-emerald-500/20'
  return 'bg-rose-500/80 text-white shadow-sm shadow-rose-500/20'
}

const GRID_SIZE = 12
const numbers = Array.from({ length: GRID_SIZE }, (_, i) => i + 1)

export function StatsScreen() {
  const navigate = useNavigate()
  const performance = getPerformance()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-3 w-full max-w-lg mx-auto"
    >
      <div className="flex items-center gap-3 mb-4">
        <Button onClick={() => navigate('/')} variant="secondary" size="sm">
          Back
        </Button>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-12">
          Times Table Stats
        </h1>
      </div>

      <div className="flex gap-4 justify-center mb-3 text-[11px] text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
          mastered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500/80" />
          needs work
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-white/5 border border-white/10" />
          unseen
        </span>
      </div>

      <div className="bg-white/5 rounded-xl p-2 backdrop-blur-sm">
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `1.5rem repeat(${GRID_SIZE}, 1fr)` }}
          role="grid"
          aria-label="Multiplication performance grid"
        >
          <div className="flex items-center justify-center text-[10px] text-white/30 font-medium aspect-square">
            ×
          </div>
          {numbers.map((col) => (
            <div
              key={`header-col-${col}`}
              className="flex items-center justify-center text-[11px] font-semibold text-white/40 aspect-square"
              role="columnheader"
            >
              {col}
            </div>
          ))}

          {numbers.map((row) => (
            <Fragment key={`row-${row}`}>
              <div
                className="flex items-center justify-center text-[11px] font-semibold text-white/40 aspect-square"
                role="rowheader"
              >
                {row}
              </div>
              {numbers.map((col) => {
                const cell = getCellData(performance, row, col)
                const style = getCellStyle(cell)
                return (
                  <div
                    key={`cell-${row}-${col}`}
                    className={`flex items-center justify-center rounded aspect-square text-[9px] font-semibold leading-none ${style}`}
                    role="gridcell"
                    aria-label={`${row} times ${col}: ${cell.seen ? `${cell.correct} of ${cell.total} correct` : 'not attempted'}`}
                    title={`${row} × ${col}`}
                  >
                    {cell.seen ? `${cell.correct}/${cell.total}` : '—'}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
