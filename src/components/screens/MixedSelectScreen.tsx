import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { MIN_TABLE, MAX_TABLE } from '../../constants/game'
import { getLastSelectedTables, saveLastSelectedTables } from '../../utils/storage'

const tables = Array.from({ length: MAX_TABLE - MIN_TABLE + 1 }, (_, i) => i + MIN_TABLE)

export function MixedSelectScreen() {
  const navigate = useNavigate()
  const lastSelected = getLastSelectedTables()
  const [selected, setSelected] = useState<readonly number[]>(
    lastSelected.length > 0 ? lastSelected : [2, 5, 10],
  )

  const toggleTable = (table: number) => {
    setSelected(prev =>
      prev.includes(table)
        ? prev.filter(t => t !== table)
        : [...prev, table],
    )
  }

  const handleStart = () => {
    saveLastSelectedTables(selected)
    navigate('/mixed', { state: { tables: selected } })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 w-full max-w-md mx-auto space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button onClick={() => navigate('/')} variant="secondary" size="sm">
          Back
        </Button>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-12">
          Mixed Mode
        </h1>
      </div>

      <p className="text-white/70 text-sm text-center">
        Select maths tables to mix with spelling questions
      </p>

      <div className="grid grid-cols-4 gap-2">
        {tables.map(table => (
          <motion.button
            key={table}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleTable(table)}
            className={`p-3 text-lg font-bold rounded-xl cursor-pointer transition-colors
              ${selected.includes(table)
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white/50 hover:bg-white/20'
              }`}
          >
            {table}
          </motion.button>
        ))}
      </div>

      <Button
        onClick={handleStart}
        size="lg"
        className="w-full"
        disabled={selected.length === 0}
      >
        Start Mixed ({selected.length} tables + spelling)
      </Button>
    </motion.div>
  )
}
