import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getWordBank, saveWordBank, addWord, removeWord, resetWordBank } from './spellingWordBank'
import { SPELLING_WORDS } from '../constants/spelling'

describe('spellingWordBank', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getWordBank', () => {
    it('returns default words when nothing stored', () => {
      expect(getWordBank()).toEqual(SPELLING_WORDS)
    })

    it('returns stored words', () => {
      const custom = [{ word: 'test', hint: 'A check' }]
      localStorage.setItem('kai-spelling-word-bank', JSON.stringify(custom))
      expect(getWordBank()).toEqual(custom)
    })

    it('returns defaults for invalid JSON', () => {
      localStorage.setItem('kai-spelling-word-bank', 'not-json')
      expect(getWordBank()).toEqual(SPELLING_WORDS)
    })

    it('returns defaults for non-array JSON', () => {
      localStorage.setItem('kai-spelling-word-bank', '{"a":1}')
      expect(getWordBank()).toEqual(SPELLING_WORDS)
    })

    it('filters out invalid entries', () => {
      const mixed = [
        { word: 'valid', hint: 'A good one' },
        { word: '', hint: 'empty word' },
        { hint: 'no word field' },
        'not an object',
      ]
      localStorage.setItem('kai-spelling-word-bank', JSON.stringify(mixed))
      expect(getWordBank()).toEqual([{ word: 'valid', hint: 'A good one' }])
    })

    it('returns defaults when all entries are invalid', () => {
      localStorage.setItem('kai-spelling-word-bank', JSON.stringify([{ bad: true }]))
      expect(getWordBank()).toEqual(SPELLING_WORDS)
    })

    it('returns defaults when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(getWordBank()).toEqual(SPELLING_WORDS)
      vi.restoreAllMocks()
    })
  })

  describe('addWord', () => {
    it('adds a new word to the bank', () => {
      const result = addWord('bicycle', 'Something you ride with two wheels')
      expect(result.some(w => w.word === 'bicycle')).toBe(true)
    })

    it('normalises word to lowercase', () => {
      const result = addWord('Bicycle', 'Two wheels')
      expect(result.some(w => w.word === 'bicycle')).toBe(true)
    })

    it('trims whitespace', () => {
      const result = addWord('  bicycle  ', '  Two wheels  ')
      const added = result.find(w => w.word === 'bicycle')
      expect(added).toBeDefined()
      expect(added!.hint).toBe('Two wheels')
    })

    it('does not add duplicate words', () => {
      const before = getWordBank()
      const result = addWord('autumn', 'Duplicate')
      expect(result.length).toBe(before.length)
    })

    it('does not add empty words', () => {
      const before = getWordBank()
      const result = addWord('', 'No word')
      expect(result.length).toBe(before.length)
    })

    it('does not add whitespace-only words', () => {
      const before = getWordBank()
      const result = addWord('   ', 'Just spaces')
      expect(result.length).toBe(before.length)
    })

    it('persists to localStorage', () => {
      addWord('bicycle', 'Two wheels')
      const bank = getWordBank()
      expect(bank.some(w => w.word === 'bicycle')).toBe(true)
    })
  })

  describe('removeWord', () => {
    it('removes a word from the bank', () => {
      const result = removeWord('autumn')
      expect(result.some(w => w.word === 'autumn')).toBe(false)
    })

    it('is case-insensitive', () => {
      const result = removeWord('AUTUMN')
      expect(result.some(w => w.word === 'autumn')).toBe(false)
    })

    it('persists to localStorage', () => {
      removeWord('autumn')
      const bank = getWordBank()
      expect(bank.some(w => w.word === 'autumn')).toBe(false)
    })

    it('does nothing for non-existent words', () => {
      const before = getWordBank()
      const result = removeWord('nonexistent')
      expect(result.length).toBe(before.length)
    })
  })

  describe('resetWordBank', () => {
    it('restores defaults after customisation', () => {
      addWord('bicycle', 'Two wheels')
      removeWord('autumn')
      const result = resetWordBank()
      expect(result).toEqual(SPELLING_WORDS)
    })

    it('persists reset to localStorage', () => {
      addWord('bicycle', 'Two wheels')
      resetWordBank()
      expect(getWordBank()).toEqual(SPELLING_WORDS)
    })
  })
})
