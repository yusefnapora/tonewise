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

const TOOLBAR_ICON_SIZE = css`calc(48px + var(--toolbar-padding))`
const PANEL_SIZE_PX = css`128px`
const PANEL_SIZE = css`minmax(${PANEL_SIZE_PX}, 1fr)`
const STATUS_MSG_SIZE = css`min-content`
const WHEEL_SIZE_PORTRAIT = css`min(800px, calc(85dvh - 200px), 85dvw)`
const WHEEL_SIZE_LANDSCAPE = css`min(800px, calc(85dvw - 248px), 85dvh)`

export class GameViewElement extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      /* display: grid;
      place-items: center;  */
    }

    .contents {
      display: grid;
      flex: 1;
      width: 100%;
      height: 100%;

      column-gap: 10px;
      row-gap: 10px;

      grid-template-rows: 1fr ${STATUS_MSG_SIZE} ${WHEEL_SIZE_PORTRAIT} ${PANEL_SIZE} 1fr;
      grid-template-columns: 1fr ${WHEEL_SIZE_PORTRAIT} 1fr;

      grid-template-areas:
        '. . .'
        '. status .'
        '. wheel .'
        '. progress .'
        '. . .';
      place-items: center;
    }

    .toolbar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      min-height: ${TOOLBAR_ICON_SIZE};
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
      /* height: 100%; */
    }

    @media (orientation: landscape) {
      .contents {
        display: grid;
        flex: 1;
        row-gap: 0px;

        grid-template-rows: 1fr; 
        grid-template-columns: 
          /* .        */ ${TOOLBAR_ICON_SIZE}
          /* status   */ ${PANEL_SIZE}
          /* wheel    */ ${WHEEL_SIZE_LANDSCAPE}
          /* progress */ ${PANEL_SIZE}
          /* .        */ max(${TOOLBAR_ICON_SIZE}, 0px);

          /* note: useless max() above is to trick the vscode lit plugin's invalid syntax checker,
          which breaks if the last element before a ';' char is a template string interpolation */
        grid-template-areas:
          '. status wheel progress . '
          ;
      }
      .progress {
        height: ${WHEEL_SIZE_LANDSCAPE};
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
      <div class="toolbar">
        <game-view-toolbar></game-view-toolbar>
      </div>
      <div class="contents">
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
