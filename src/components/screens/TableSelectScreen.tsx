import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { MIN_TABLE, MAX_TABLE } from '../../constants/game'
import { useGame } from '../../contexts/GameContext'
import { getLastSelectedTables } from '../../utils/storage'

export function TableSelectScreen() {
  const navigate = useNavigate()
  const { selectTables } = useGame()
  const [selected, setSelected] = useState<readonly number[]>(getLastSelectedTables)

  const toggleTable = useCallback((table: number) => {
    setSelected(prev =>
      prev.includes(table)
        ? prev.filter(t => t !== table)
        : [...prev, table]
    )
  }, [])

  const selectAll = useCallback(() => {
    const all = Array.from({ length: MAX_TABLE - MIN_TABLE + 1 }, (_, i) => i + MIN_TABLE)
    setSelected(all)
  }, [])

  const handleStart = useCallback(() => {
    selectTables(selected)
    navigate('/play')
  }, [selectTables, selected, navigate])

  const tables = Array.from({ length: MAX_TABLE - MIN_TABLE + 1 }, (_, i) => i + MIN_TABLE)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 w-full max-w-md"
    >
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white mb-2">
          Pick Your Tables
        </h2>
        <p className="text-white/60">
          Select one or more tables to practice
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {tables.map(table => {
          const isSelected = selected.includes(table)
          return (
            <motion.button
              key={table}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleTable(table)}
              className={`
                p-4 text-xl font-bold rounded-xl cursor-pointer transition-all
                ${isSelected
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                }
              `}
            >
              {table}
            </motion.button>
          )
        })}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={selectAll}
          variant="secondary"
          size="sm"
          className="flex-1"
        >
          Select All
        </Button>
        <Button
          onClick={handleStart}
          disabled={selected.length === 0}
          size="lg"
          className="flex-2"
        >
          Start! ({selected.length} {selected.length === 1 ? 'table' : 'tables'})
        </Button>
      </div>
    </motion.div>
  )
}
