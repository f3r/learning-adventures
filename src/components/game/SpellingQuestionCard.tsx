import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { SpellingWord } from '../../types/spelling'
import { speakWord, isSpeechSupported } from '../../utils/speechSynthesis'

interface SpellingQuestionCardProps {
  readonly word: SpellingWord
  readonly questionNumber: number
  readonly total: number
}

export function SpellingQuestionCard({ word, questionNumber, total }: SpellingQuestionCardProps) {
  useEffect(() => {
    speakWord(word.word)
  }, [word.word])

  return (
    <motion.div
      key={`${word.word}-${questionNumber}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl p-8 shadow-xl text-center"
    >
      <p className="text-sm text-gray-400 mb-2">
        Question {questionNumber} of {total}
      </p>
      <p className="text-xl text-gray-600 mb-4 italic">
        &ldquo;{word.hint}&rdquo;
      </p>
      {isSpeechSupported() && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => speakWord(word.word)}
          className="text-3xl cursor-pointer hover:scale-110 transition-transform"
          aria-label="Hear the word again"
        >
          🔊
        </motion.button>
      )}
    </motion.div>
  )
}
