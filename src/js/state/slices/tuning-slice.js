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

/**
 * @param {string[]} noteIds
 */
const EDOAngles = (noteIds) =>
  Object.fromEntries(noteIds.map((n, i) => [n, (360 / noteIds.length) * i]))

/** @type {TuningState} */
const initialState = {
  noteIds: [...DefaultNoteIds],
  midiNotes: { ...NoteIdMidiMap },
  display: { ...DefaultDisplay },
  angles: EDOAngles(DefaultNoteIds),
  scaleNotes: [...DefaultNoteIds],
  tonicNote: 'C',
}

const tuningSlice = createSlice({
  name: 'tuning',
  initialState,
  reducers: {
    /**
     * @param {TuningState} state 
     * @param {import('@reduxjs/toolkit').PayloadAction<string[]>} action 
     */
    setScaleNotes(state, action) {
      state.scaleNotes = action.payload.filter(noteId => state.noteIds.includes(noteId))
    },

    /**
     * @param {TuningState} state 
     * @param {import('@reduxjs/toolkit').PayloadAction<string>} action 
     */
    setTonicNote(state, action) {
      if (state.noteIds.includes(action.payload)) {
        state.tonicNote = action.payload
      }
    }
  },
})

const { reducer, actions } = tuningSlice
export const { setScaleNotes, setTonicNote } = actions
export default reducer
