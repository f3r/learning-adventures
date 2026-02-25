import { useState, useCallback, useEffect } from 'react'
import { QwertyKeyboard } from './QwertyKeyboard'

interface SpellingInputProps {
  readonly onSubmit: (answer: string) => void
  readonly disabled: boolean
  readonly questionKey: string
}

export function SpellingInput({ onSubmit, disabled, questionKey }: SpellingInputProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue('')
  }, [questionKey])

  const handleKeyPress = useCallback((key: string) => {
    setValue(prev => prev + key)
  }, [])

  const handleBackspace = useCallback(() => {
    setValue(prev => prev.slice(0, -1))
  }, [])

  const handleSubmit = useCallback(() => {
    if (value === '') return
    onSubmit(value)
  }, [value, onSubmit])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 text-center min-h-[60px] flex items-center justify-center shadow-inner">
        <span className="text-3xl font-bold text-gray-800 tracking-widest">
          {value || <span className="text-gray-300">type here...</span>}
        </span>
      </div>

      <QwertyKeyboard
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
        disabled={disabled}
        submitDisabled={value === ''}
      />
    </div>
  )
}
