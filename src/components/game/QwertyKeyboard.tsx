import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface QwertyKeyboardProps {
  readonly onKeyPress: (key: string) => void
  readonly onBackspace: () => void
  readonly onSubmit: () => void
  readonly disabled: boolean
  readonly submitDisabled: boolean
}

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
] as const

export function QwertyKeyboard({ onKeyPress, onBackspace, onSubmit, disabled, submitDisabled }: QwertyKeyboardProps) {
  const handlePhysicalKey = useCallback((e: KeyboardEvent) => {
    if (disabled) return

    const key = e.key.toLowerCase()
    if (key >= 'a' && key <= 'z' && key.length === 1) {
      onKeyPress(key)
    } else if (e.key === 'Backspace') {
      onBackspace()
    } else if (e.key === 'Enter' && !submitDisabled) {
      onSubmit()
    }
  }, [disabled, onKeyPress, onBackspace, onSubmit, submitDisabled])

  useEffect(() => {
    window.addEventListener('keydown', handlePhysicalKey)
    return () => window.removeEventListener('keydown', handlePhysicalKey)
  }, [handlePhysicalKey])

  return (
    <div className="space-y-1.5">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1">
          {row.map(key => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.9 }}
              onClick={() => onKeyPress(key)}
              disabled={disabled}
              className="w-8 h-10 text-sm font-bold rounded-lg cursor-pointer
                transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              {key}
            </motion.button>
          ))}
        </div>
      ))}

      <div className="flex justify-center gap-1.5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBackspace}
          disabled={disabled}
          className="px-4 h-10 text-sm font-bold rounded-lg cursor-pointer
            transition-colors disabled:opacity-40 disabled:cursor-not-allowed
            bg-red-100 hover:bg-red-200 text-red-600"
        >
          Backspace
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onSubmit}
          disabled={disabled || submitDisabled}
          className="px-6 h-10 text-sm font-bold rounded-lg cursor-pointer
            transition-colors disabled:opacity-40 disabled:cursor-not-allowed
            bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Submit
        </motion.button>
      </div>
    </div>
  )
}
