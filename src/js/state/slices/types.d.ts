export type Note = {
  id: string
}

export type PitchedNote = Note & {
  midiNumber: number
}

export type GameMode = 'free-play' | 'challenge'

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
  challengeNotesPlayed: Note[]
  challengeNotesSounding: Note[]
}

export type GameState = {
  currentMode: GameMode
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
  soundingNotes: PitchedNote[]
}

export type EnharmonicPresentation = 'sharp' | 'flat'

export type NoteDisplay = {
  label: string
  enharmonicLabels?: Record<EnharmonicPresentation, string>
}

export type NoteBadgeInfo = {
  noteId: string
  midiNote: number
  highlighted: boolean
  noteRevealed: boolean
  hidden: boolean
}

export type TuningState = {
  noteIds: string[]
  midiNotes: Record<string, number>
  display: Record<string, NoteDisplay>
  angles: Record<string, number>
}

import type { ColorScaleName } from '../../common/types.d.ts'
export type SystemColorTheme = 'dark' | 'light' | 'auto'
export type PreferencesState = {
  theme: SystemColorTheme
  colorScale: ColorScaleName
  enharmonicPresentation: EnharmonicPresentation
}
