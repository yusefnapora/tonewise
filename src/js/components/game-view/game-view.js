import { LitElement, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import { guess } from '../../state/slices/game-slice.js'
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
  selectMidiNote,
  selectWheelNotes,
} from '../../state/selectors/selectors.js'
import { sharedRouter } from '../../route-controller.js'
import gameViewStyles from './styles.js'

export class GameViewElement extends LitElement {
  static styles = gameViewStyles

  #stateController = new StateController(this)

  /** @type {import('../tone-wheel/tone-wheel.js').ToneWheel} */
  get #wheel() {
    return this.renderRoot.querySelector('tone-wheel')
  }

  /**
   * @param {import('../tone-wheel/events.js').NoteHoldBeganEvent} e
   */
  #pitchSelected(e) {
    const note = e.detail
    resumeAudio()
    this.#stateController.dispatch(startPlayerNote(note))

    this.#triggerNote(note.id)
    this.#stateController.dispatch(guess(note))
  }

  /**
   * @param {import('../tone-wheel/events.js').NoteHoldEndedEvent} e
   */
  #pitchDeselected(e) {
    const note = e.detail
    this.#stateController.dispatch(endPlayerNote(note))
    this.#endNotePlayback(note.id)
  }

  /**
   * @param {string} noteId
   */
  #triggerNote(noteId) {
    const midiNumber = this.#stateController.select(selectMidiNote, noteId)
    if (!midiNumber) {
      return
    }
    this.#stateController.dispatch(triggerNoteStart({ id: noteId, midiNumber }))
  }

  /**
   * @param {string} noteId
   */
  #endNotePlayback(noteId) {
    const midiNumber = this.#stateController.select(selectMidiNote, noteId)
    if (!midiNumber) {
      return
    }
    this.#stateController.dispatch(triggerNoteStop({ id: noteId, midiNumber }))
  }

  render() {
    const colorScale = this.#stateController.select(selectColorScale)
    const wheelNotes = this.#stateController.select(selectWheelNotes)

    const pitchClasses = wheelNotes.map(
      ({ noteId, midiNote, label, active }) => html`
        <pitch-class
          id=${noteId}
          midi-note=${midiNote}
          active=${active || nothing}>
          ${label}
        </pitch-class>
      `,
    )

    // TODO: make tone-wheel update itself when active pitch classes change
    this.#wheel?.requestUpdate()

    return html`
      <div class="toolbar">
        <nav-icon-bar></nav-icon-bar>
      </div>
      <div class="contents">
        <div class="status">
          <game-status-message></game-status-message>
        </div>
        <div class="wheel">
          <tone-wheel
            color-scale=${colorScale}
            @note:holdBegan=${this.#pitchSelected}
            @note:holdEnded=${this.#pitchDeselected}>
            ${pitchClasses}
          </tone-wheel>
        </div>
        <glass-panel class="progress">
          <progress-view></progress-view>
        </glass-panel>
      </div>
    `
  }
}

registerElement('game-view', GameViewElement)
