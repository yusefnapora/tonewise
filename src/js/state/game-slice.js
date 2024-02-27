
/**
 * @typedef {{ name: string, midiNote: number }} Note
 * 
 * @typedef {'sequential' | 'chord'} ChallengeMode
 * 
 * @typedef {object} GameRules
 * @property {Note} tonic the root note of the interval
 * @property {Note[]} targets the "hidden" notes that the player is trying to guess
 * @property {ChallengeMode} [challengeMode] whether the notes should play in sequence or at the same time when presenting the challenge
 * 
 * @typedef {object} PlayerGuess
 * @property {Note} note
 * @property {boolean} isCorrect
 * 
 * @typedef {object} GameProgress
 * @property {PlayerGuess[]} guesses
 * @property {boolean} [isCompleted]
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
      guess.isCorrect && guess.note.name === note.name))
}

/**
 * 
 * @param {GameRules} rules 
 * @param {Note} note 
 */
function isCorrectGuess(rules, note) {
  return rules.targets.some(t => t.name === note.name)
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
export { reducer }
