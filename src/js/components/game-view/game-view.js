import { LitElement, html, nothing } from 'lit'
import {
  keyboardActivationEventListener,
  registerElement,
} from '../../common/dom.js'
import { dispatch } from '../../state/store.js'
import { StateController } from '../../state/controller.js'
import { guess, setScaleControlsActive } from '../../state/slices/game-slice.js'
import {
  endPlayerNote,
  startPlayerNote,
} from '../../state/slices/instrument-slice.js'
import {
  resumeAudio,
  triggerNoteStart,
  triggerNoteStop,
} from '../../state/slices/audio-slice.js'
import {
  selectColorScale,
  selectIsChallengePlaying,
  selectMidiNote,
  selectNoteAriaLabel,
  selectNoteLabel,
  selectScaleControlsActive,
  selectScaleNoteIds,
  selectTonicNoteAngle,
  selectWheelNotes,
} from '../../state/selectors/selectors.js'
import gameViewStyles from './styles.js'

export class GameViewElement extends LitElement {
  static properties = {
    freePlayMode: { type: Boolean, attribute: 'free-play' },
  }

  static styles = gameViewStyles
  #state = new StateController(this)

  constructor() {
    super()
    this.freePlayMode = false
    this.ariaLabel = 'Game screen'
  }

  /** @type {import('../tone-wheel/tone-wheel.js').ToneWheel} */
  get #wheel() {
    return this.renderRoot.querySelector('tone-wheel')
  }

  /**
   * @param {import('../tone-wheel/events.js').NoteHoldBeganEvent} e
   */
  #pitchSelected(e) {
    const note = e.detail

    const { scaleNotes } = this.#state.state.tuning
    if (!scaleNotes.includes(note.id)) {
      return
    }

    resumeAudio()
    dispatch(startPlayerNote(note))

    this.#triggerNote(note.id)
    if (!this.freePlayMode) {
      dispatch(guess(note))
    }
  }

  /**
   * @param {import('../tone-wheel/events.js').NoteHoldEndedEvent} e
   */
  #pitchDeselected(e) {
    const note = e.detail
    dispatch(endPlayerNote(note))
    this.#endNotePlayback(note.id)
  }

  /**
   * @param {string} noteId
   */
  #triggerNote(noteId) {
    const midiNumber = this.#state.select(selectMidiNote, noteId)
    if (!midiNumber) {
      return
    }
    dispatch(triggerNoteStart({ id: noteId, midiNumber }))
  }

  /**
   * @param {string} noteId
   */
  #endNotePlayback(noteId) {
    const midiNumber = this.#state.select(selectMidiNote, noteId)
    if (!midiNumber) {
      return
    }
    dispatch(triggerNoteStop({ id: noteId, midiNumber }))
  }

  render() {
    const colorScale = this.#state.select(selectColorScale)
    const wheelNotes = this.#state.select(selectWheelNotes)
    const scaleNotes = this.#state.select(selectScaleNoteIds)
    const scaleControlsActive = this.#state.select(selectScaleControlsActive)
    const isChallengePlaying = this.#state.select(selectIsChallengePlaying)

    const pitchClasses = wheelNotes.map(
      ({ noteId, midiNote, label, active }) => html`
        <pitch-class
          id=${noteId}
          aria-label=${selectNoteAriaLabel(this.#state.state, noteId)}
          midi-note=${midiNote}
          active=${active || nothing}
          disabled=${scaleNotes.includes(noteId) ? nothing : true}>
          ${label}
        </pitch-class>
      `,
    )

    const showProgress = !this.freePlayMode && !scaleControlsActive

    const progressView = !showProgress
      ? undefined
      : html`
          <glass-panel class="controls">
            <progress-view></progress-view>
          </glass-panel>
        `

    // TODO: make tone-wheel update itself when active pitch classes change
    setTimeout(() => this.#wheel?.requestUpdate())

    const tonicAngle = selectTonicNoteAngle(this.#state.state)
    const {
      tuning: { tonicNote, scaleQuality },
    } = this.#state.state
    const scaleLabel = scaleQuality
    const tonicLabel = selectNoteLabel(this.#state.state, tonicNote)
    const toggleScaleControls = () => {
      dispatch(setScaleControlsActive(!scaleControlsActive))
    }

    const closeIcon = html`
      <sl-icon-button
        aria-controls="scale-control-panel"
        aria-expanded="true"
        label="close scale control panel"
        @click=${toggleScaleControls}
        name="x-circle">
      </sl-icon-button>
    `

    const scaleBadge = scaleControlsActive
      ? closeIcon
      : html`
          <scale-badge
            tabindex="0"
            role="button"
            aria-controls="scale-control-panel"
            aria-expanded="false"
            aria-label="show scale controls"
            @click=${toggleScaleControls}
            @keyup=${keyboardActivationEventListener(toggleScaleControls)}
            tonic=${tonicLabel}
            label=${scaleLabel}
            note-ids=${JSON.stringify(scaleNotes)}>
          </scale-badge>
        `

    const scaleToggle = html`
      <div class="scale-toggle-icon">${scaleBadge}</div>
    `

    const scaleControls = !scaleControlsActive
      ? undefined
      : html`
          <section
            id="scale-control-panel"
            class="scale-controls"
            aria-labelledby="scale-control-header">
            <sl-visually-hidden>
              <header id="scale-control-header">Scale control panel</header>
            </sl-visually-hidden>
            <scale-controls></scale-controls>
          </section>
        `

    const nonInteractive = isChallengePlaying && !this.freePlayMode
    const wheelRotation = 360 - tonicAngle

    return html`
      <div class="contents">
        <div class="status">
          <game-status-message></game-status-message>
        </div>
        <div class="wheel">
          <staff-view></staff-view>
          <tone-wheel
            non-interactive=${nonInteractive || nothing}
            rotation=${wheelRotation}
            color-scale=${colorScale}
            @note:holdBegan=${this.#pitchSelected}
            @note:holdEnded=${this.#pitchDeselected}>
            ${pitchClasses}
          </tone-wheel>
          ${scaleToggle}
        </div>
        ${scaleControls} ${progressView}
      </div>
    `
  }
}

registerElement('game-view', GameViewElement)
