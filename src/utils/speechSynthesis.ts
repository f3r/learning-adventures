export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakWord(word: string): void {
  if (!isSpeechSupported()) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-AU'
  utterance.rate = 0.8

  window.speechSynthesis.speak(utterance)
}
