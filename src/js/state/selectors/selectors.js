import { createSelector } from '@reduxjs/toolkit'
/** 
 * @typedef {import('../store.js').RootState} RootState 
 * @typedef {import('../store.js').AppDispatch} AppDispatch
 */

/**
 * @param {RootState} state 
 */
const selectGameState = state => state.game

/**
 * @param {RootState} state 
 */
const selectInstrumentState = state => state.instrument


export const isGameStarted = createSelector(
  [selectGameState],
  game => {
    return game.currentRound != null
  }
)

export const isGameCompleted = createSelector(
  [selectGameState],
  game => {
    if (game.currentRound == null) {
      return false
    }
  
    const { rules, progress } = game.currentRound
    return rules.targets.every(note => 
      progress.guesses.find(guess => 
        guess.isCorrect && guess.note.id === note.id))
  }
)

export const selectActiveNoteIds = createSelector(
  [selectGameState, selectInstrumentState],
  (game, instrument) => {
    const allActive = new Set([
      ...instrument.heldNotes, 
      ...instrument.highlightedNotes
    ].map(n => n.id))

    // highlight correct guesses
    const { currentRound } = game
    currentRound?.rules.targets.forEach(targetNote => {
      if (currentRound?.progress.guesses.some(guess => guess.isCorrect && guess.note.id === targetNote.id)) {
        allActive.add(targetNote.id)
      }
    })
   
    return allActive
  }
)