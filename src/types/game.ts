export interface PairPerformance {
  readonly correct: number
  readonly incorrect: number
  readonly lastSeen: number
}

export type PerformanceMap = Record<string, PairPerformance>

export type Operation = 'multiply' | 'divide'

export interface Question {
  readonly factorA: number
  readonly factorB: number
  readonly answer: number
  readonly operation: Operation
}

export interface AnsweredQuestion {
  readonly question: Question
  readonly userAnswer: number | null
  readonly isCorrect: boolean
  readonly timeSpent: number
  readonly pointsEarned: number
}

export interface GameSession {
  readonly selectedTables: readonly number[]
  readonly questions: readonly Question[]
  readonly currentQuestionIndex: number
  readonly answers: readonly AnsweredQuestion[]
  readonly score: number
  readonly streak: number
  readonly questionStartTime: number
}

export interface GameState {
  readonly session: GameSession | null
  readonly highScore: number
}

export type GameAction =
  | { readonly type: 'SELECT_TABLES'; readonly tables: readonly number[] }
  | { readonly type: 'START_GAME'; readonly questions: readonly Question[]; readonly startTime: number; readonly selectedTables?: readonly number[] }
  | { readonly type: 'SUBMIT_ANSWER'; readonly userAnswer: number | null; readonly timestamp: number }
  | { readonly type: 'NEXT_QUESTION'; readonly timestamp: number }
  | { readonly type: 'FINISH_SESSION' }
  | { readonly type: 'RESET' }
