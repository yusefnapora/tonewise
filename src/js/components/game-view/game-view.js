import { LitElement, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'
import { dispatch } from '../../state/store.js'
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
  selectScaleNoteIds,
  selectWheelNotes,
} from '../../state/selectors/selectors.js'
import gameViewStyles from './styles.js'

export class GameViewElement extends LitElement {
  static properties = {
    freePlayMode: { type: Boolean, attribute: 'free-play' }
  }

  static styles = gameViewStyles
  #state = new StateController(this)

  constructor() {
    super()
    this.freePlayMode = false
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

    const progressView = this.freePlayMode ? undefined : html`
      <glass-panel class="progress">
        <progress-view></progress-view>
      </glass-panel>
    `

    // TODO: make tone-wheel update itself when active pitch classes change
    this.#wheel?.requestUpdate()

    const isChromatic = scaleNotes.length === wheelNotes.length
    const scaleLabel = isChromatic ? 'scale' : 'major' // todo: name of current scale (derive from state)
    const tonic = isChromatic ? '' : 'C' // todo: pull current tonic from state
    const scaleBadgeClicked = () => {
      console.log('scale badge clicked')
    }
    const scaleBadge = html`
      <scale-badge @click=${scaleBadgeClicked} tonic=${tonic} label=${scaleLabel} note-ids=${JSON.stringify(scaleNotes)}></scale-badge>
    `

    return html`
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
        <div class="scale">
          ${scaleBadge}
        </div>
        ${progressView}
      </div>
    `
  }
}

registerElement('game-view', GameViewElement)
