/**
 * @typedef {import('./types.js').Note} Note
 * @typedef {import('./types.js').ChallengeMode} ChallengeMode
 * @typedef {import('./types.js').GameRules} GameRules
 * @typedef {import('./types.js').PlayerGuess} PlayerGuess
 * @typedef {import('./types.js').GameProgress} GameProgress
 * @typedef {import('./types.js').GameRound} GameRound
 * @typedef {import('./types.js').GameState} GameState
 * 
 */

/** 
 * @typedef {import('@reduxjs/toolkit').PayloadAction<GameRound>} GameRoundAction
 * @typedef {import('@reduxjs/toolkit').PayloadAction<Note>} NoteAction
 */

import { createSlice, current } from "@reduxjs/toolkit"

/** @type {GameState} */
const initialState = {
  currentRound: null,
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
function isCompleted(state) {
  if (state.currentRound == null) {
    return false
  }
  if (state.currentRound.progress.isCompleted) {
    return true
  }

  const { rules, progress } = state.currentRound
  return rules.targets.every(note => 
    progress.guesses.find(guess => 
      guess.isCorrect && guess.note.id === note.id))
}

/**
 * 
 * @param {GameRules} rules 
 * @param {Note} note 
 */
function isCorrectGuess(rules, note) {
  return rules.targets.some(t => t.id === note.id)
}

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
  }
})

const { actions, reducer } = gameSlice
export const { start, reset, guess } = actions
export default reducer