import { motion } from 'framer-motion'
import type { Question } from '../../types/game'

interface QuestionCardProps {
  readonly question: Question
  readonly questionNumber: number
  readonly total: number
}

export function QuestionCard({ question, questionNumber, total }: QuestionCardProps) {
  return (
    <motion.div
      key={`${question.factorA}-${question.factorB}-${questionNumber}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl p-8 shadow-xl text-center"
    >
      <p className="text-sm text-gray-400 mb-2">
        Question {questionNumber} of {total}
      </p>
      <p className="text-5xl font-extrabold text-gray-800">
        {question.factorA} <span className="text-purple-500">{question.operation === 'multiply' ? '×' : '÷'}</span> {question.factorB}
      </p>
    </motion.div>
  )
}
