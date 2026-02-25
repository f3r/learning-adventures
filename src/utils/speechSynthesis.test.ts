import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isSpeechSupported, speakWord } from './speechSynthesis'

class MockSpeechSynthesisUtterance {
  text: string
  lang = ''
  rate = 1
  constructor(text: string) {
    this.text = text
  }
}

describe('speechSynthesis', () => {
  let originalUtterance: typeof globalThis.SpeechSynthesisUtterance

  beforeEach(() => {
    originalUtterance = globalThis.SpeechSynthesisUtterance
    // @ts-expect-error - mock class for test
    globalThis.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.SpeechSynthesisUtterance = originalUtterance
  })

  describe('isSpeechSupported', () => {
    it('returns true when speechSynthesis is available', () => {
      Object.defineProperty(window, 'speechSynthesis', {
        value: { cancel: vi.fn(), speak: vi.fn() },
        writable: true,
        configurable: true,
      })
      expect(isSpeechSupported()).toBe(true)
    })

    it('returns false when speechSynthesis is not available', () => {
      const original = window.speechSynthesis
      // @ts-expect-error - removing for test
      delete window.speechSynthesis
      expect(isSpeechSupported()).toBe(false)
      Object.defineProperty(window, 'speechSynthesis', {
        value: original,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('speakWord', () => {
    it('cancels previous speech and speaks new word', () => {
      const cancel = vi.fn()
      const speak = vi.fn()
      Object.defineProperty(window, 'speechSynthesis', {
        value: { cancel, speak },
        writable: true,
        configurable: true,
      })

      speakWord('autumn')

      expect(cancel).toHaveBeenCalled()
      expect(speak).toHaveBeenCalledTimes(1)
    })

    it('sets correct utterance properties', () => {
      const speak = vi.fn()
      Object.defineProperty(window, 'speechSynthesis', {
        value: { cancel: vi.fn(), speak },
        writable: true,
        configurable: true,
      })

      speakWord('autumn')

      const utterance = speak.mock.calls[0][0] as MockSpeechSynthesisUtterance
      expect(utterance.text).toBe('autumn')
      expect(utterance.lang).toBe('en-AU')
      expect(utterance.rate).toBe(0.8)
    })
  })
})
