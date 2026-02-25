import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useGameState } from '../hooks/useGameState'

type GameContextValue = ReturnType<typeof useGameState>

const GameContext = createContext<GameContextValue | null>(null)

interface GameProviderProps {
  readonly children: ReactNode
}

export function GameProvider({ children }: GameProviderProps) {
  const gameState = useGameState()

  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
