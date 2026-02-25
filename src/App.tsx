import { Routes, Route, Navigate } from 'react-router-dom'
import { WelcomeScreen } from './components/screens/WelcomeScreen'
import { TableSelectScreen } from './components/screens/TableSelectScreen'
import { GameScreen } from './components/screens/GameScreen'
import { ResultsScreen } from './components/screens/ResultsScreen'
import { StatsScreen } from './components/screens/StatsScreen'
import { GameProvider, useGame } from './contexts/GameContext'

function GameRoute() {
  const { state } = useGame()
  if (!state.session) return <Navigate to="/" replace />
  return <GameScreen />
}

function ResultsRoute() {
  const { state } = useGame()
  const isFinished = state.session &&
    state.session.answers.length >= state.session.questions.length
  if (!isFinished) return <Navigate to="/" replace />
  return <ResultsScreen />
}

export function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/select" element={<TableSelectScreen />} />
        <Route path="/play" element={<GameRoute />} />
        <Route path="/results" element={<ResultsRoute />} />
        <Route path="/stats" element={<StatsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GameProvider>
  )
}
