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
  challengePlaying?: boolean
}

export type GameState = {
  currentRound: GameRound | null
}

export type InstrumentState = {
  /** Notes that have been highlighted by the game (E.g. when playing a challenge sequence)
   * Does not include user-held notes
   */
  highlightedNotes: Note[]

  /** The notes (if any) that are currently being held down by the player */
  heldNotes: Note[]
}

export type SamplerLoadingState = 'idle' | 'loading' | 'loaded'

export type AudioState = {
  samplerLoading: SamplerLoadingState
  soundingMidiNotes: number[]
}

export type EnharmonicPresentation = 'sharp' | 'flat'

export type NoteDisplay = {
  label: string
  enharmonicLabels?: Record<EnharmonicPresentation, string>
}

export type TuningState = {
  noteIds: string[]
  midiNotes: Record<string, number>
  display: Record<string, NoteDisplay>
  angles: Record<string, number>
}


import type { ColorScaleName } from "../../common/types.d.ts"
export type PreferencesState = {
  colorScale: ColorScaleName
  enharmonicPresentation: EnharmonicPresentation
}
