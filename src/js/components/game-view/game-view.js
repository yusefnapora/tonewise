import { LitElement, css, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import { guess } from '../../state/slices/game-slice.js'
import { PitchClassElement } from '../tone-wheel/pitch-class.js'
import {
  endPlayerNote,
  startPlayerNote,
} from '../../state/slices/instrument-slice.js'
import {
  resumeAudio,
  triggerNoteStart,
  triggerNoteStop,
} from '../../state/slices/audio-slice.js'
import { NoteIdMidiMap, NoteIds } from '../../audio/notes.js'
import { selectActiveNoteIds } from '../../state/selectors/selectors.js'

export class GameViewElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    tone-wheel {
      width: 100%;
      max-width: min(500px, calc(100vw - 40px));
      margin: 30px auto;
    }
  `

  #stateController = new StateController(this)

  connectedCallback() {
    super.connectedCallback()
  }

  stateChanged() {
    this.requestUpdate()
  }

  /** @type {import('../tone-wheel/tone-wheel.js').ToneWheel} */
  get #wheel() {
    return this.renderRoot.querySelector('tone-wheel')
  }

  /** @param {string} id  */
  #pitchClass(id) {
    return /** @type {PitchClassElement | undefined} */ (
      this.renderRoot.querySelector(`pitch-class#${id}`)
    )
  }

  /**
   * @param {import('../tone-wheel/events.js').NoteHoldBeganEvent} e
   */
  #pitchSelected(e) {
    const note = e.detail
    resumeAudio()
    this.#stateController.dispatch(startPlayerNote(note))

    const pc = this.#pitchClass(note.id)
    this.#triggerNote(pc)
    this.#stateController.dispatch(guess(note))
  }

  /**
   * @param {import('../tone-wheel/events.js').NoteHoldEndedEvent} e
   */
  #pitchDeselected(e) {
    const note = e.detail
    this.#stateController.dispatch(endPlayerNote(note))
    this.#endNotePlayback(this.#pitchClass(note.id))
  }

  /**
   *
   * @param {PitchClassElement} pitchClass
   */
  #triggerNote(pitchClass) {
    const midiNote = pitchClass.midiNote
    if (!midiNote) {
      return
    }
    this.#stateController.dispatch(triggerNoteStart({ midiNote }))
  }

  #endNotePlayback(pitchClass) {
    const midiNote = pitchClass.midiNote
    if (!midiNote) {
      return
    }
    this.#stateController.dispatch(triggerNoteStop({ midiNote }))
  }

  render() {
    const { state } = this.#stateController
    const allActive = selectActiveNoteIds(state)

    const pitchClasses = NoteIds.map((id) => {
      const midiNote = NoteIdMidiMap[id]
      const active = allActive.has(id)
      return html`
        <pitch-class id=${id} midi-note=${midiNote} active=${active || nothing}
          >${id}</pitch-class
        >
      `
    })

    // TODO: make tone-wheel update itself when active pitch classes change
    this.#wheel?.requestUpdate()

    return html`
      <tone-wheel
        @note:holdBegan=${this.#pitchSelected}
        @note:holdEnded=${this.#pitchDeselected}
      >
        ${pitchClasses}
      </tone-wheel>

      <progress-view></progress-view>
    `
  }
}

registerElement('game-view', GameViewElement)
