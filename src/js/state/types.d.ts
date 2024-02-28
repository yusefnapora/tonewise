export type Note = {
  id: string
}

export type ChallengeMode = 'sequential' | 'chord'

export type GameRules = {
  tonic: Note
  targets: Note[]
  challengeMode?: ChallengeMode
}

export type PlayerGuess = {
  note: Note
  isCorrect: boolean // todo: derive in selector
}

export type GameProgress = {
  guesses: PlayerGuess[]
  isCompleted?: boolean // todo: derive in selector
}

export type GameRound = {
  rules: GameRules
  progress: GameProgress
}

export type GameState = {
  currentRound: GameRound | null
}
