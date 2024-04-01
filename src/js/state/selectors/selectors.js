import { createSelector } from '@reduxjs/toolkit'
import {
  intervalDisplayName,
  midiNoteInterval,
} from '../../common/intervals.js'
import { colorForAngle, getContrastingTextColor } from '../../common/color.js'
import { isCompleted } from '../slices/game-slice.js'
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

/** @param {RootState} state */
export const selectAudioState = (state) => state.audio

export const selectAudioLoadingState = createSelector(
  [selectAudioState],
  (audio) => audio.samplerLoading,
)

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

export const selectIsChallengePlaying = createSelector(
  [selectCurrentRound],
  (currentRound) => {
    return currentRound?.challengePlaying ?? false
  },
)

export const selectProgressNoteBadgeInfo = createSelector(
  [selectCurrentRound, selectTuningState, selectAudioState],
  (currentRound, tuning, audio) => {
    /** @type {import('../slices/types.js').NoteBadgeInfo[]} */
    const badges = []

    if (!currentRound) {
      return badges
    }
    const { tonic, targets } = currentRound.rules
    const notes = [tonic, ...targets]

    for (const note of notes) {
      const noteId = note.id
      const midiNote = tuning.midiNotes[note.id]

      const played = currentRound.challengeNotesPlayed.some(
        (n) => n.id === noteId,
      )
      const hidden = !played
      const noteRevealed =
        noteId === tonic.id ||
        currentRound.progress.guesses.some(
          (g) => g.isCorrect && g.note.id === noteId,
        )
      const highlighted = audio.soundingNotes.some((n) => n.id === noteId)
      badges.push({ noteId, noteRevealed, hidden, highlighted, midiNote })
    }

    return badges
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

export const selectStatusMessage = createSelector(
  [selectGameState, selectAudioLoadingState],
  (game, loading) => {
    if (loading === 'loading') {
      return 'Loading...'
    }
    if (game.scaleControlsActive) {
      return 'Choose a scale'
    }
    if (game.currentMode === 'free-play') {
      return 'Tap the wheel to make music'
    }
    const { currentRound } = game
    if (!currentRound) {
      return 'Press play'
    }
    if (isGameCompleted.resultFunc(currentRound)) {
      return 'Great job!'
    }
    if (currentRound.challengePlaying) {
      return 'Listen to the notes…'
    }
    return 'Tap the hidden note'
  },
)

export const selectSecondaryStatusMessage = createSelector(
  [selectTuningState, selectGameState, selectPreferencesState],
  (tuning, game, preferences) => {
    if (game.scaleControlsActive) {
      return selectCurrentScaleLabel.resultFunc(tuning, preferences)
    }
    const { currentRound } = game
    if (!currentRound) {
      return undefined
    }

    if (!isCompleted(game)) {
      return undefined
    }

    const { tonic, targets } = currentRound.rules
    const tonicMidi = tuning.midiNotes[tonic.id]
    if (targets.length !== 1) {
      console.warn('more than one target not yet implemented')
      return undefined
    }
    const targetMidi = tuning.midiNotes[targets[0].id]
    const interval = midiNoteInterval(tonicMidi, targetMidi)
    return intervalDisplayName(interval)
  },
)

export const selectColorScale = createSelector(
  [selectPreferencesState],
  (prefs) => prefs.colorScale,
)

export const selectColorTheme = createSelector(
  [selectPreferencesState],
  (prefs) => prefs.theme,
)

export const selectShowTouchHighlights = createSelector(
  [selectPreferencesState],
  (prefs) => prefs.showTouchHighlights ?? false,
)

export const selectTuningNoteIds = createSelector(
  [selectTuningState],
  (tuning) => tuning.noteIds,
)

export const selectScaleNoteIds = createSelector(
  [selectTuningState],
  (tuning) => tuning.scaleNotes,
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

export const selectCurrentScaleLabel = createSelector(
  [selectTuningState, selectPreferencesState],
  (tuning, preferences) => {
    const { tonicNote } = tuning
    const noteLabel = selectNoteLabel.resultFunc(tuning, preferences, tonicNote)
    return `${noteLabel} ${tuning.scaleQuality}`
  },
)

export const selectNoteAriaLabel = createSelector(
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
    const label = selectNoteLabel.resultFunc(tuning, preferences, noteId)
    return label.replace('♯', ' sharp').replace('♭', ' flat')
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

export const selectTonicNoteAngle = createSelector(
  [selectTuningState],
  (tuning) => {
    return tuning.angles[tuning.tonicNote]
  },
)

export const selectNoteColor = createSelector(
  [
    selectTuningState,
    selectColorScale,
    /**
     * @param {RootState} _state
     * @param {string} noteId
     */
    (_state, noteId) => noteId,
  ],
  (tuning, colorScale, noteId) => {
    const angle = tuning.angles[noteId]
    if (angle == null) {
      return undefined
    }
    return colorForAngle(angle, colorScale)
  },
)

export const selectNoteLabelColor = createSelector(
  [
    selectTuningState,
    selectColorScale,
    /**
     * @param {RootState} _state
     * @param {string} noteId
     */
    (_state, noteId) => noteId,
  ],
  (tuning, colorScale, noteId) => {
    const noteColor = selectNoteColor.resultFunc(tuning, colorScale, noteId)
    return getContrastingTextColor(noteColor)
  },
)

export const selectGradientColors = createSelector(
  [selectTuningState, selectColorScale],
  (tuning, colorScale) => {
    const { noteIds, angles } = tuning
    const colors = [...noteIds, noteIds[0]].map((noteId) => {
      const angle = angles[noteId]
      return colorForAngle(angle, colorScale)
    })
    return colors
  },
)

export const selectAppBackgroundCss = createSelector(
  [
    selectGradientColors,
    selectColorScale,
    selectTonicNoteAngle,
    selectColorTheme,
  ],
  (colors, colorScale, tonicAngle, _theme) => {
    let background = 'var(--color-background)'
    let themeColor = background
    if (colorScale.startsWith('oklch')) {
      const rotation = `-${tonicAngle}deg`
      background = `conic-gradient(from ${rotation}, ${colors.join(', ')})`
      themeColor = colorForAngle(345 + tonicAngle, colorScale)
    }
    return { background, themeColor }
  },
)

export const selectScaleControlsActive = createSelector(
  [selectGameState],
  (game) => game.scaleControlsActive,
)
