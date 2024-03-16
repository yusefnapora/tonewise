import { LitElement, css, html, nothing } from 'lit'
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
import { cardStyleBase } from '../../styles.js'

const TOOLBAR_SIZE = css`48px`
const PANEL_SIZE_PX = css`128px`
const PANEL_SIZE = css`minmax(${PANEL_SIZE_PX}, 1fr)`
const STATUS_MSG_SIZE = css`min-content`
const WHEEL_SIZE_PORTRAIT = css`min(800px, calc(85dvh - 200px), 85dvw)`
const WHEEL_SIZE_LANDSCAPE = css`min(800px, calc(85dvw - 248px), 85dvh)`

export class GameViewElement extends LitElement {
  static styles = css`

    .contents {
      display: grid;
      flex: 1;

      column-gap: 10px;
      row-gap: 10px;

      grid-template-rows: ${TOOLBAR_SIZE} ${STATUS_MSG_SIZE} ${WHEEL_SIZE_PORTRAIT} ${PANEL_SIZE} 0;
      grid-template-columns: ${WHEEL_SIZE_PORTRAIT};

      grid-template-areas:
        'toolbar'
        'status'
        'wheel'
        'progress'
        '.';
      place-items: center;
    }

    .toolbar {
      grid-area: toolbar;
      width: 100%;
    }

    .status {
      grid-area: status;
      width: 100%;
    }

    .wheel {
      grid-area: wheel;
    }

    .progress {
      grid-area: progress;
      width: 100%;
    }

    @media (orientation: landscape) {
      /* :host {
        flex-direction: row;
      } */
      .contents {
        display: grid;
        flex: 1;

        grid-template-rows: ${WHEEL_SIZE_LANDSCAPE};
        grid-template-columns: 
          /* toolbar  */ ${TOOLBAR_SIZE}
          /* status   */ ${PANEL_SIZE}
          /* wheel    */ ${WHEEL_SIZE_LANDSCAPE}
          /* progress */ ${PANEL_SIZE}
          /* .        */ 0;
        grid-template-areas:
          'toolbar status wheel progress . ';
      }

      .toolbar {
        place-self: stretch;
        height: 100%;
      }
      .status {
        place-self: stretch;
        height: 100%;
        max-width: ${PANEL_SIZE_PX};
      }
      .progress {
        place-self: stretch;
      }
    }

    sl-card {
      width: 100%;
      /* max-width: min(500px, calc(100vw - 40px), 90vh, 90dvh); */
      /* max-height: min(500px, calc(100vw - 40px), 90vh, 90dvh); */
      /* margin: 5px auto; */
      margin: 0;
    }

    ${cardStyleBase}
  `

  #stateController = new StateController(this)

  connectedCallback() {
    super.connectedCallback()
    // const { state, dispatch } = this.#stateController
    // startNewGame(state, dispatch)
  }

  // stateChanged() {
  //   this.requestUpdate()
  // }

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
    const midiNote = this.#stateController.select(selectMidiNote, noteId)
    if (!midiNote) {
      return
    }
    this.#stateController.dispatch(triggerNoteStart({ midiNote }))
  }

  /**
   * @param {string} noteId
   */
  #endNotePlayback(noteId) {
    const midiNote = this.#stateController.select(selectMidiNote, noteId)
    if (!midiNote) {
      return
    }
    this.#stateController.dispatch(triggerNoteStop({ midiNote }))
  }

  render() {
    const colorScale = this.#stateController.select(selectColorScale)
    const wheelNotes = this.#stateController.select(selectWheelNotes)

    const pitchClasses = wheelNotes.map(
      ({ noteId, midiNote, label, active }) => html`
        <pitch-class
          id=${noteId}
          midi-note=${midiNote}
          active=${active || nothing}
        >
          ${label}
        </pitch-class>
      `,
    )

    // TODO: make tone-wheel update itself when active pitch classes change
    this.#wheel?.requestUpdate()

    return html`
      <div class="contents">
        <div class="toolbar">
          <game-view-toolbar></game-view-toolbar>
        </div>
        <div class="status">
          <game-status-message></game-status-message>
        </div>
        <sl-card class="wheel">
          <tone-wheel
            color-scale=${colorScale}
            @note:holdBegan=${this.#pitchSelected}
            @note:holdEnded=${this.#pitchDeselected}
          >
            ${pitchClasses}
          </tone-wheel>
        </sl-card>
        <glass-panel class="progress">
          <progress-view></progress-view>
        </glass-panel>
      </div>
    `
  }
}

registerElement('game-view', GameViewElement)
