import { createSlice } from '@reduxjs/toolkit'
import { Scale } from 'tonal'

/**
 * @typedef {import('./types.js').TuningState} TuningState
 */

export const DefaultNoteIds = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]

const startMidiNote = 60
const NoteIdMidiMap = Object.fromEntries(
  DefaultNoteIds.map((n, i) => [n, startMidiNote + i]),
)

/** @type {Record<string, import("./types.js").NoteDisplay>} */
const DefaultDisplay = {
  C: { label: 'C' },
  'Db': {
    label: 'C♯',
    enharmonicLabels: {
      sharp: 'C♯',
      flat: 'D♭',
    },
  },
  D: { label: 'D' },
  'Eb': {
    label: 'D♯',
    enharmonicLabels: {
      sharp: 'D♯',
      flat: 'E♭',
    },
  },
  E: { label: 'E' },
  F: { label: 'F' },
  'Gb': {
    label: 'F♯',
    enharmonicLabels: {
      sharp: 'F♯',
      flat: 'G♭',
    },
  },
  G: { label: 'G' },
  'Ab': {
    label: 'G♯',
    enharmonicLabels: {
      sharp: 'G♯',
      flat: 'A♭',
    },
  },
  A: { label: 'A' },
  'Bb': {
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
  scaleQuality: 'chromatic',
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
    },

    /**
     * @param {TuningState} state 
     * @param {import('@reduxjs/toolkit').PayloadAction<string>} action 
     */ 
    setScaleQuality(state, action) {
      const quality = action.payload
      const scaleName = [state.tonicNote, quality].join(' ')
      const scale = Scale.get(scaleName)
      if (scale) {
        console.log('scale', { scaleName, scale })
        state.scaleQuality = quality
        state.scaleNotes = [...scale.notes]
      }
    }
  },
})

const { reducer, actions } = tuningSlice
export const { setScaleNotes, setTonicNote, setScaleQuality } = actions
export default reducer
