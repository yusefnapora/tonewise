
/**
 * @typedef {import('../store.js').RootState} RootState
 * @typedef {import('../store.js').AppDispatch} AppDispatch
 */

import { playChallengeSequence, reset, start } from '../slices/game-slice.js'
import { resetInstrumentState } from '../slices/instrument-slice.js'

/**
 * @param {RootState} state 
 * @param {AppDispatch} dispatch 
 */
export function startNewGame(state, dispatch) {
  const tonic = getRandomNoteId(state)
  let target = getRandomNoteId(state)
  while (target.id === tonic.id) {
    target = getRandomNoteId(state)
  }
  const rules = { tonic, targets: [target] }
  const progress = { guesses: [] }

  dispatch(start({ rules, progress }))
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
  const progress = { guesses: [] }
  dispatch(start({ rules, progress }))
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
export function getRandomNoteId(state) {
  const { noteIds } = state.tuning
  const id = noteIds[Math.floor(Math.random() * noteIds.length)]
  return { id }
}