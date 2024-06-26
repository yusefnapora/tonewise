/**
 * @typedef {import('./types.js').Note} Note
 * @typedef {import('./types.js').ChallengeMode} ChallengeMode
 * @typedef {import('./types.js').GameRules} GameRules
 * @typedef {import('./types.js').PlayerGuess} PlayerGuess
 * @typedef {import('./types.js').GameProgress} GameProgress
 * @typedef {import('./types.js').GameRound} GameRound
 * @typedef {import('./types.js').GameState} GameState
 * @typedef {import('./types.js').TuningState} TuningState
 *
 */

/**
 * @typedef {import('@reduxjs/toolkit').Dispatch} Dispatch
 * @typedef {import('@reduxjs/toolkit').PayloadAction<GameRound>} GameRoundAction
 * @typedef {import('@reduxjs/toolkit').PayloadAction<Note>} NoteAction
 */

import { createSlice, current, createAsyncThunk } from '@reduxjs/toolkit'
import { triggerNoteStart, triggerNoteStop } from './audio-slice.js'
import { clearNoteHighlight, highlightNote } from './instrument-slice.js'

/** @type {GameState} */
const initialState = {
  currentMode: 'free-play',
  currentRound: null,
  scaleControlsActive: false,
}

/**
 * @param {GameState} state
 */
export function isStarted(state) {
  return state.currentRound != null
}

/**
 * @param {GameState} state
 */
export function isCompleted(state) {
  if (state.currentRound == null) {
    return false
  }
  if (state.currentRound.progress.isCompleted) {
    return true
  }

  const { rules, progress } = state.currentRound
  return rules.targets.every((note) =>
    progress.guesses.find(
      (guess) => guess.isCorrect && guess.note.id === note.id,
    ),
  )
}

/**
 *
 * @param {GameRules} rules
 * @param {Note} note
 */
function isCorrectGuess(rules, note) {
  return rules.targets.some((t) => t.id === note.id)
}

/** @type {import('@reduxjs/toolkit').AsyncThunk<unknown, unknown, { state: { game: GameState, tuning: TuningState }}>} */
export const playChallengeSequence = createAsyncThunk(
  'game/playChallengeSequence',
  /**
   *
   * @param {unknown} _
   * @param {{ getState: () => { game: GameState, tuning: TuningState }, dispatch: Function }} thunkAPI
   */
  async (_, { getState, dispatch }) => {
    const { game, tuning } = getState()
    if (!game.currentRound) {
      return
    }

    const duration = 1000
    const sleep = (t) => new Promise((resolve) => setTimeout(resolve, t))
    const { tonic, targets } = game.currentRound.rules
    const notes = [tonic, ...targets, tonic]
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]
      const highlight = i === 0 || i === notes.length - 1
      const midiNumber = tuning.midiNotes[note.id]
      // play and highlight tonic note
      dispatch(triggerNoteStart({ ...note, midiNumber }))
      highlight && dispatch(highlightNote(note))

      await sleep(duration)
      dispatch(triggerNoteStop({ ...note, midiNumber }))
      if (i === 0) {
        dispatch(clearNoteHighlight(note))
      }
    }
  },
)

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    /**
     * Resets to initial state.
     * @param {GameState} _state
     * @returns {GameState}
     */
    reset(_state) {
      return initialState
    },

    /**
     * Starts a new game, replacing any existing value for `state.currentRound`
     * @param {GameState} state
     * @param {GameRoundAction} action
     */
    start(state, action) {
      state.currentMode = 'challenge'
      state.currentRound = action.payload
    },

    /**
     * Submits a new guess from the player
     * @param {GameState} state
     * @param {NoteAction} action
     */
    guess(state, action) {
      if (!state.currentRound || state.currentRound.progress.isCompleted) {
        return
      }
      const note = action.payload
      const isCorrect = isCorrectGuess(state.currentRound.rules, note)
      state.currentRound.progress.guesses.push({ note, isCorrect })

      if (isCompleted(current(state))) {
        state.currentRound.progress.isCompleted = true
      }
    },

    /**
     * @param {GameState} state
     * @param {import('@reduxjs/toolkit').PayloadAction<import('./types.js').GameMode>} action
     */
    setGameMode(state, action) {
      state.currentMode = action.payload
    },

    /**
     *
     * @param {GameState} state
     * @param {import('@reduxjs/toolkit').PayloadAction<boolean>} action
     */
    setScaleControlsActive(state, action) {
      state.scaleControlsActive = action.payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(playChallengeSequence.pending, (state) => {
        if (state.currentRound) {
          state.currentRound.challengePlaying = true
          state.currentRound.challengeNotesPlayed = []
        }
      })
      .addCase(playChallengeSequence.fulfilled, (state) => {
        if (state.currentRound) {
          state.currentRound.challengePlaying = false
          state.currentRound.challengeNotesSounding = []
        }
      })
      .addCase(triggerNoteStart.fulfilled, (state, action) => {
        const { currentRound } = state
        if (!currentRound || !currentRound.challengePlaying) {
          return
        }
        const noteId = action.payload.id
        const challengeNoteIds = [
          currentRound.rules.tonic.id,
          ...currentRound.rules.targets.map((n) => n.id),
        ]

        if (challengeNoteIds.includes(noteId)) {
          state.currentRound.challengeNotesSounding.push({ id: noteId })
          state.currentRound.challengeNotesPlayed.push({ id: noteId })
        }
      })
      .addCase(triggerNoteStop.pending, (state, action) => {
        const { currentRound } = state
        if (
          !currentRound ||
          !currentRound.challengePlaying ||
          !currentRound.challengeNotesSounding
        ) {
          return
        }
        currentRound.challengeNotesSounding =
          currentRound.challengeNotesSounding.filter(
            (n) => n.id !== action.meta.arg.id,
          )
      })
  },
})

const { actions, reducer } = gameSlice
export const { start, reset, guess, setGameMode, setScaleControlsActive } =
  actions
export default reducer
