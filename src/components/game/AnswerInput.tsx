import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AnswerInputProps {
  readonly onSubmit: (answer: number) => void
  readonly disabled: boolean
  readonly questionKey: string
}

const NUM_PAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '\u2713'],
] as const

export function AnswerInput({ onSubmit, disabled, questionKey }: AnswerInputProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue('')
  }, [questionKey])

  const handleKey = useCallback((key: string) => {
    if (key === 'C') {
      setValue('')
    } else if (key === '\u2713') {
      return
    } else {
      setValue(prev => {
        if (prev.length >= 3) return prev
        return prev + key
      })
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (value === '') return
    onSubmit(parseInt(value, 10))
  }, [value, onSubmit])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return

      if (e.key >= '0' && e.key <= '9') {
        handleKey(e.key)
      } else if (e.key === 'Backspace') {
        setValue(prev => prev.slice(0, -1))
      } else if (e.key === 'Enter' && value !== '') {
        handleSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, handleKey, handleSubmit, value])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 text-center min-h-[60px] flex items-center justify-center shadow-inner">
        <span className="text-4xl font-bold text-gray-800">
          {value || <span className="text-gray-300">?</span>}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {NUM_PAD_KEYS.flat().map(key => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (key === '\u2713') {
                handleSubmit()
              } else {
                handleKey(key)
              }
            }}
            disabled={disabled || (key === '\u2713' && value === '')}
            className={`
              p-4 text-2xl font-bold rounded-xl cursor-pointer
              transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              ${key === '\u2713'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : key === 'C'
                  ? 'bg-red-100 hover:bg-red-200 text-red-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }
            `}
          >
            {key}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
