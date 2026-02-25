import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useSpellingState } from '../hooks/useSpellingState'

type SpellingContextValue = ReturnType<typeof useSpellingState>

const SpellingContext = createContext<SpellingContextValue | null>(null)

interface SpellingProviderProps {
  readonly children: ReactNode
}

export function SpellingProvider({ children }: SpellingProviderProps) {
  const spellingState = useSpellingState()

  return (
    <SpellingContext.Provider value={spellingState}>
      {children}
    </SpellingContext.Provider>
  )
}

export function useSpelling(): SpellingContextValue {
  const context = useContext(SpellingContext)
  if (!context) {
    throw new Error('useSpelling must be used within a SpellingProvider')
  }
  return context
}
