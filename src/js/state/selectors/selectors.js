import { createSelector } from '@reduxjs/toolkit'
/**
 * @typedef {import('../store.js').RootState} RootState
 * @typedef {import('../store.js').AppDispatch} AppDispatch
 */

/**
 * @param {RootState} state
 */
export const selectGameState = (state) => state.game

/**
 * @param {RootState} state
 */
export const selectInstrumentState = (state) => state.instrument

/**
 * @param {RootState} state
 */
export const selectTuningState = (state) => state.tuning

/**
 * @param {RootState} state
 */
export const selectPreferencesState = (state) => state.preferences

export const selectCurrentRound = createSelector(
  [selectGameState],
  (game) => game.currentRound,
)

export const isGameStarted = createSelector(
  [selectCurrentRound],
  (currentRound) => {
    return currentRound != null
  },
)

export const isGameCompleted = createSelector(
  [selectCurrentRound],
  (currentRound) => {
    if (currentRound == null) {
      return false
    }

    const { rules, progress } = currentRound
    return rules.targets.every((note) =>
      progress.guesses.find(
        (guess) => guess.isCorrect && guess.note.id === note.id,
      ),
    )
  },
)

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
    if (currentRound) {
      currentRound.rules.targets.forEach((targetNote) => {
        if (
          currentRound.progress.guesses.some(
            (guess) => guess.isCorrect && guess.note.id === targetNote.id,
          )
        ) {
          allActive.add(targetNote.id)
        }
      })
  }

    return allActive
  },
)

export const selectColorScale = createSelector(
  [selectPreferencesState],
  (prefs) => prefs.colorScale,
)

export const selectColorTheme = createSelector(
  [selectPreferencesState],
  (prefs) => prefs.theme
)

export const selectTuningNoteIds = createSelector(
  [selectTuningState],
  (tuning) => tuning.noteIds,
)

export const selectMidiNote = createSelector(
  [
    selectTuningState,
    /**
     * @param {RootState} _state
     * @param {string} noteId
     */
    (_state, noteId) => noteId,
  ],

  (tuning, noteId) => {
    return tuning.midiNotes[noteId]
  },
)

export const selectNoteAngle = createSelector(
  [
    selectTuningState,
    /**
     * @param {RootState} _state
     * @param {string} noteId
     */
    (_state, noteId) => noteId,
  ],
  (tuning, noteId) => tuning.angles[noteId],
)

export const selectNoteLabel = createSelector(
  [
    selectTuningState,
    selectPreferencesState,
    /**
     * @param {RootState} _state
     * @param {string} noteId
     */
    (_state, noteId) => noteId,
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
  },
)

export const selectEnharmonicPresentation = createSelector(
  [selectPreferencesState],
  (prefs) => prefs.enharmonicPresentation,
)

export const selectWheelNotes = createSelector(
  [selectTuningState, selectPreferencesState, selectActiveNoteIds],
  (tuning, preferences, activeNoteIds) => {
    return tuning.noteIds.map((id) => {
      const midiNote = tuning.midiNotes[id]
      const label = selectNoteLabel.resultFunc(tuning, preferences, id)
      const active = activeNoteIds.has(id)

      return { noteId: id, midiNote, label, active }
    })
  },
)
