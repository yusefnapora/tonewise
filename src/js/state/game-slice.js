
/**
 * @typedef {string} Note
 * 
 * @typedef {'sequential' | 'chord'} ChallengeMode
 * 
 * @typedef {object} GameRules
 * @property {Note} tonic the root note of the interval
 * @property {Note[]} targets the "hidden" notes that the player is trying to guess
 * @property {ChallengeMode} [challengeMode] whether the notes should play in sequence or at the same time when presenting the challenge
 * 
 * 
 * @typedef {object} GameProgress
 * @property {Note[]} guesses
 * 
 * @typedef {object} GameRound
 * @property {GameRules} rules
 * @property {GameProgress} progress
 * 
 * @typedef {object} GameState
 * @property {GameRound|null} currentRound
 * 
 */

/** @typedef {import('@reduxjs/toolkit').PayloadAction<GameRound>} GameRoundAction */
/** @typedef {import('@reduxjs/toolkit').PayloadAction<Note>} NoteAction */

import { createSlice } from "@reduxjs/toolkit"


/** @type {GameState} */
const initialState = {
  currentRound: null,
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
      if (!state.currentRound) {
        return
      }

      state.currentRound.progress.guesses.push(action.payload)
    },
  }
})

const { actions, reducer } = gameSlice
export const { start, reset, guess } = actions
export { reducer }
