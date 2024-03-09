import { createSlice } from '@reduxjs/toolkit'

/**
 * @typedef {import('./types.js').TuningState} TuningState
 */

export const DefaultNoteIds = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B',
]

const startMidiNote = 60
const NoteIdMidiMap = Object.fromEntries(
  DefaultNoteIds.map((n, i) => [n, startMidiNote + i]),
)

/** @type {Record<string, import("./types.js").NoteDisplay>} */
const DefaultDisplay = {
  C: { label: 'C' },
  'C♯': {
    label: 'C♯',
    enharmonicLabels: {
      sharp: 'C♯',
      flat: 'D♭',
    },
  },
  D: { label: 'D' },
  'D♯': {
    label: 'D♯',
    enharmonicLabels: {
      sharp: 'D♯',
      flat: 'E♭',
    },
  },
  E: { label: 'E' },
  F: { label: 'F' },
  'F♯': {
    label: 'F♯',
    enharmonicLabels: {
      sharp: 'F♯',
      flat: 'G♭',
    },
  },
  G: { label: 'G' },
  'G♯': {
    label: 'G♯',
    enharmonicLabels: {
      sharp: 'G♯',
      flat: 'A♭',
    },
  },
  A: { label: 'A' },
  'A♯': {
    label: 'A♯',
    enharmonicLabels: {
      sharp: 'A♯',
      flat: 'B♭',
    },
  },
  B: { label: 'B' },
}

/** @type {TuningState} */
const initialState = {
  noteIds: [...DefaultNoteIds],
  midiNotes: { ...NoteIdMidiMap },
  display: { ...DefaultDisplay },
}

const tuningSlice = createSlice({
  name: 'tuning',
  initialState,
  reducers: {
    // todo: actions to change tuning & presentation preferences
  },
})

const { reducer } = tuningSlice
export default reducer
