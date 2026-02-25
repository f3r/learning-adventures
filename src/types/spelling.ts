export interface SpellingWord {
  readonly word: string
  readonly hint: string
}

export interface SpellingQuestion {
  readonly type: 'spelling'
  readonly word: SpellingWord
  readonly answer: string
}

export interface AnsweredSpellingQuestion {
  readonly question: SpellingQuestion
  readonly userAnswer: string
  readonly isCorrect: boolean
  readonly timeSpent: number
  readonly pointsEarned: number
}

export interface SpellingSession {
  readonly questions: readonly SpellingQuestion[]
  readonly currentQuestionIndex: number
  readonly answers: readonly AnsweredSpellingQuestion[]
  readonly score: number
  readonly streak: number
  readonly questionStartTime: number
}

export interface SpellingState {
  readonly session: SpellingSession | null
  readonly highScore: number
}

export type SpellingAction =
  | { readonly type: 'START_GAME'; readonly questions: readonly SpellingQuestion[]; readonly startTime: number }
  | { readonly type: 'SUBMIT_ANSWER'; readonly userAnswer: string; readonly timestamp: number }
  | { readonly type: 'NEXT_QUESTION'; readonly timestamp: number }
  | { readonly type: 'FINISH_SESSION' }
  | { readonly type: 'RESET' }

export type SpellingPerformanceMap = Record<string, SpellingWordPerformance>

export interface SpellingWordPerformance {
  readonly correct: number
  readonly incorrect: number
  readonly lastSeen: number
}
