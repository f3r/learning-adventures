import { Routes, Route, Navigate } from 'react-router-dom'
import { WelcomeScreen } from './components/screens/WelcomeScreen'
import { TableSelectScreen } from './components/screens/TableSelectScreen'
import { GameScreen } from './components/screens/GameScreen'
import { ResultsScreen } from './components/screens/ResultsScreen'
import { StatsScreen } from './components/screens/StatsScreen'
import { SpellingGameScreen } from './components/screens/SpellingGameScreen'
import { SpellingResultsScreen } from './components/screens/SpellingResultsScreen'
import { SpellingStatsScreen } from './components/screens/SpellingStatsScreen'
import { WordBankScreen } from './components/screens/WordBankScreen'
import { MixedSelectScreen } from './components/screens/MixedSelectScreen'
import { MixedGameScreen } from './components/screens/MixedGameScreen'
import { GameProvider, useGame } from './contexts/GameContext'
import { SpellingProvider, useSpelling } from './contexts/SpellingContext'

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

function SpellingGameRoute() {
  const { state } = useSpelling()
  if (!state.session) return <Navigate to="/" replace />
  return <SpellingGameScreen />
}

function SpellingResultsRoute() {
  const { state } = useSpelling()
  const isFinished = state.session &&
    state.session.answers.length >= state.session.questions.length
  if (!isFinished) return <Navigate to="/" replace />
  return <SpellingResultsScreen />
}

export function App() {
  return (
    <GameProvider>
      <SpellingProvider>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/select" element={<TableSelectScreen />} />
          <Route path="/play" element={<GameRoute />} />
          <Route path="/results" element={<ResultsRoute />} />
          <Route path="/stats" element={<StatsScreen />} />
          <Route path="/spelling" element={<SpellingGameRoute />} />
          <Route path="/spelling-results" element={<SpellingResultsRoute />} />
          <Route path="/spelling-stats" element={<SpellingStatsScreen />} />
          <Route path="/word-bank" element={<WordBankScreen />} />
          <Route path="/mixed-select" element={<MixedSelectScreen />} />
          <Route path="/mixed" element={<MixedGameScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SpellingProvider>
    </GameProvider>
  )
}
