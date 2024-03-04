import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

/**
 * @typedef {import('./types.js').InstrumentState} InstrumentState
 * @typedef {import('./types.js').Note} Note
 * @typedef {import('@reduxjs/toolkit').PayloadAction<Note>} NoteAction
 */

/** @type {InstrumentState} */
const initialState = {
  highlightedNotes: [],
  heldNotes: [],
}

const instrumentSlice = createSlice({
  name: 'instrument',
  initialState,
  reducers: {
    reset(_state) {
      return initialState
    },

    /**
     * @param {InstrumentState} state
     * @param {NoteAction} action
     */
    startPlayerNote(state, action) {
      state.heldNotes.push(action.payload)
    },

    /**
     *
     * @param {InstrumentState} state
     * @param {NoteAction} action
     */
    endPlayerNote(state, action) {
      state.heldNotes = [
        ...state.heldNotes.filter((n) => n.id !== action.payload.id),
      ]
    },

    /**
     * @param {InstrumentState} state
     * @param {NoteAction} action
     */
    highlightNote(state, action) {
      state.highlightedNotes.push(action.payload)
    },

    /**
     * @param {InstrumentState} state
     * @param {NoteAction} action
     */
    clearNoteHighlight(state, action) {
      state.highlightedNotes = [
        ...state.highlightedNotes.filter((n) => n.id !== action.payload.id),
      ]
    },
  },
})

const { actions, reducer } = instrumentSlice
export const {
  startPlayerNote,
  endPlayerNote,
  highlightNote,
  clearNoteHighlight,
  reset: resetInstrumentState,
} = actions
export default reducer
