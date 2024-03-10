import { createSelector } from '@reduxjs/toolkit'
/**
 * @typedef {import('../store.js').RootState} RootState
 * @typedef {import('../store.js').AppDispatch} AppDispatch
 */

/**
 * @param {RootState} state
 */
const selectGameState = (state) => state.game

/**
 * @param {RootState} state
 */
const selectInstrumentState = (state) => state.instrument

/**
 * @param {RootState} state 
 */
const selectTuningState = (state) => state.tuning

/**
 * @param {RootState} state 
 */
const selectPreferencesState = (state) => state.preferences

export const isGameStarted = createSelector([selectGameState], (game) => {
  return game.currentRound != null
})

export const isGameCompleted = createSelector([selectGameState], (game) => {
  if (game.currentRound == null) {
    return false
  }

  const { rules, progress } = game.currentRound
  return rules.targets.every((note) =>
    progress.guesses.find(
      (guess) => guess.isCorrect && guess.note.id === note.id,
    ),
  )
})

export const selectActiveNoteIds = createSelector(
  [selectGameState, selectInstrumentState],
  (game, instrument) => {
    const allActive = new Set(
      [...instrument.heldNotes, ...instrument.highlightedNotes].map(
        (n) => n.id,
      ),
    )

    // highlight correct guesses
    const { currentRound } = game
    currentRound?.rules.targets.forEach((targetNote) => {
      if (
        currentRound?.progress.guesses.some(
          (guess) => guess.isCorrect && guess.note.id === targetNote.id,
        )
      ) {
        allActive.add(targetNote.id)
      }
    })

    return allActive
  },
)

export const selectColorScale = createSelector(
  [selectPreferencesState],
  (prefs) => prefs.colorScale
)

export const selectTuningNoteIds = createSelector(
  [selectTuningState],
  (tuning) => tuning.noteIds
)

export const selectMidiNote = createSelector(
  [
    selectTuningState, 
    /**
     * @param {RootState} _state 
     * @param {string} noteId 
     */
    (_state, noteId) => noteId
  ],

  (tuning, noteId) => {
    return tuning.midiNotes[noteId]
  }
)

export const selectNoteLabel = createSelector(
  [
    selectTuningState,
    selectPreferencesState,
    /**
     * @param {RootState} _state 
     * @param {string} noteId 
     */
    (_state, noteId) => noteId
  ],
  (tuning, preferences, noteId) => {
    const display = tuning.display[noteId]
    if (!display) {
      return undefined
    }

    if (!display.enharmonicLabels) {
      return display.label
    }

    return display.enharmonicLabels[preferences.enharmonicPresentation]
  }
)