import type { SpellingWord } from '../types/spelling'
import { SPELLING_WORDS } from '../constants/spelling'

const WORD_BANK_KEY = 'kai-spelling-word-bank'

export function getWordBank(): readonly SpellingWord[] {
  try {
    const stored = localStorage.getItem(WORD_BANK_KEY)
    if (stored === null) return SPELLING_WORDS
    const parsed = JSON.parse(stored) as unknown
    if (!Array.isArray(parsed)) return SPELLING_WORDS
    const valid = parsed.filter(
      (w): w is SpellingWord =>
        typeof w === 'object' &&
        w !== null &&
        typeof w.word === 'string' &&
        typeof w.hint === 'string' &&
        w.word.length > 0,
    )
    return valid.length > 0 ? valid : SPELLING_WORDS
  } catch {
    return SPELLING_WORDS
  }
}

export function saveWordBank(words: readonly SpellingWord[]): void {
  try {
    localStorage.setItem(WORD_BANK_KEY, JSON.stringify(words))
  } catch {
    // localStorage may be unavailable
  }
}

export function addWord(word: string, hint: string): readonly SpellingWord[] {
  const bank = getWordBank()
  const normalised = word.toLowerCase().trim()
  if (normalised.length === 0) return bank
  if (bank.some(w => w.word.toLowerCase() === normalised)) return bank

  const updated = [...bank, { word: normalised, hint: hint.trim() }]
  saveWordBank(updated)
  return updated
}

export function removeWord(word: string): readonly SpellingWord[] {
  const bank = getWordBank()
  const normalised = word.toLowerCase().trim()
  const updated = bank.filter(w => w.word.toLowerCase() !== normalised)
  saveWordBank(updated)
  return updated
}

export function resetWordBank(): readonly SpellingWord[] {
  try {
    localStorage.removeItem(WORD_BANK_KEY)
  } catch {
    // localStorage may be unavailable
  }
  return SPELLING_WORDS
}
