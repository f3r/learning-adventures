import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'
import { getWordBank, addWord, removeWord, resetWordBank } from '../../utils/spellingWordBank'
import type { SpellingWord } from '../../types/spelling'

export function WordBankScreen() {
  const navigate = useNavigate()
  const [words, setWords] = useState<readonly SpellingWord[]>(getWordBank)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWord, setNewWord] = useState('')
  const [newHint, setNewHint] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleAdd = () => {
    if (newWord.trim() === '' || newHint.trim() === '') return
    const updated = addWord(newWord, newHint)
    setWords(updated)
    setNewWord('')
    setNewHint('')
    setShowAddForm(false)
  }

  const handleRemove = (word: string) => {
    const updated = removeWord(word)
    setWords(updated)
    setConfirmDelete(null)
  }

  const handleReset = () => {
    const updated = resetWordBank()
    setWords(updated)
  }

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
          Word Bank
        </h1>
      </div>

      <div className="bg-white/5 rounded-2xl p-4 mb-5 backdrop-blur-sm text-center">
        <p className="text-2xl font-extrabold text-white">{words.length}</p>
        <p className="text-xs text-white/50">words</p>
      </div>

      <div className="space-y-2 mb-5">
        <AnimatePresence>
          {words.map((w, index) => (
            <motion.div
              key={w.word}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-xl border border-white/10 p-4 bg-white/5 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <span className="text-lg font-bold text-white">{w.word}</span>
                  <p className="text-sm text-white/50 leading-snug">{w.hint}</p>
                </div>

                <div className="ml-3">
                  {confirmDelete === w.word ? (
                    <div className="flex gap-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemove(w.word)}
                        className="w-8 h-8 rounded-lg bg-rose-500/80 text-white text-xs font-bold cursor-pointer"
                      >
                        Yes
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setConfirmDelete(null)}
                        className="w-8 h-8 rounded-lg bg-white/10 text-white/60 text-xs font-bold cursor-pointer"
                      >
                        No
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setConfirmDelete(w.word)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/30
                        hover:text-rose-400 transition-colors cursor-pointer flex items-center justify-center text-sm"
                      aria-label={`Remove ${w.word}`}
                    >
                      &#x2715;
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white/10 rounded-2xl p-4 space-y-3 border border-white/10">
              <h3 className="text-sm font-bold text-white/70">Add New Word</h3>
              <input
                type="text"
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                placeholder="Word (e.g. beautiful)"
                className="w-full bg-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30
                  border border-white/10 focus:border-cyan-400/50 focus:outline-none text-sm"
              />
              <input
                type="text"
                value={newHint}
                onChange={e => setNewHint(e.target.value)}
                placeholder="Hint (e.g. Very pretty or attractive)"
                className="w-full bg-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30
                  border border-white/10 focus:border-cyan-400/50 focus:outline-none text-sm"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAdd()
                }}
              />
              <div className="flex gap-2">
                <Button onClick={handleAdd} size="sm" disabled={newWord.trim() === '' || newHint.trim() === ''}>
                  Add Word
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="secondary" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} size="md" className="w-full">
            + Add Word
          </Button>
        )}
        <Button onClick={handleReset} variant="secondary" size="sm" className="w-full">
          Reset to Default Words
        </Button>
      </div>
    </motion.div>
  )
}
