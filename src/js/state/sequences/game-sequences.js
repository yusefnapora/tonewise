/**
 * @typedef {import('../store.js').RootState} RootState
 * @typedef {import('../store.js').AppDispatch} AppDispatch
 */

import { playChallengeSequence, reset, start } from '../slices/game-slice.js'
import { resetInstrumentState } from '../slices/instrument-slice.js'

/**
 * @param {import('../slices/types.js').GameRules} rules
 * @returns {import('../slices/types.js').GameRound}
 */
export function newRound(rules) {
  return {
    rules,
    progress: { guesses: [] },
    challengeNotesPlayed: [],
    challengeNotesSounding: [],
    challengePlaying: false,
  }
}

/**
 * @param {RootState} state
 * @param {AppDispatch} dispatch
 */
export function startNewGame(state, dispatch) {
  const tonic = getRandomNote(state)
  let target = getRandomNote(state)
  while (target.id === tonic.id) {
    target = getRandomNote(state)
  }
  const rules = { tonic, targets: [target] }
  const round = newRound(rules)
  
  // prevent having the same round twice in a row
  const { currentRound } = state.game
  if (currentRound){
    const current = [currentRound.rules.tonic, ...currentRound.rules.targets]
    const next = [tonic, ...rules.targets]
    if (current.every((note, i) => next[i]?.id === note.id)) {
      startNewGame(state, dispatch)
      return
    }
  }

  dispatch(start(round))
  dispatch(resetInstrumentState())
  dispatch(playChallengeSequence())
}

/**
 * @param {RootState} state
 * @param {AppDispatch} dispatch
 */
export function restartGame(state, dispatch) {
  if (!state.game.currentRound) {
    return
  }
  const { rules } = state.game.currentRound
  const round = newRound(rules)
  dispatch(start(round))
  dispatch(resetInstrumentState())
  dispatch(playChallengeSequence())
}

/**
 * @param {AppDispatch} dispatch
 */
export function endGame(dispatch) {
  dispatch(reset())
  dispatch(resetInstrumentState())
}

/**
 * @param {RootState} state
 * @returns {{ id: string }}
 */
export function getRandomNote(state) {
  const { scaleNotes } = state.tuning
  const id = scaleNotes[Math.floor(Math.random() * scaleNotes.length)]
  return { id }
}
