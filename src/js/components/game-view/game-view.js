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
  selectActiveNoteIds,
  selectColorScale,
  selectMidiNote,
  selectNoteLabel,
  selectWheelNotes,
  selectTuningNoteIds,
} from '../../state/selectors/selectors.js'
import { cardStyleBase } from '../../styles.js'
export class GameViewElement extends LitElement {
  static styles = css`
    :root {
      --panel-size: 72px;
      --grid-panel-gap: 10px;
    }

    .contents {
      display: grid;
      flex: 1;

      column-gap: 10px;
      row-gap: 10px;
      padding: 20px;

      grid-template-areas:
        'toolbar'
        'wheel'
        'progress';
      place-items: center;
    }

    sl-card.toolbar {
      grid-area: toolbar;
    }

    sl-card.wheel {
      grid-area: wheel;
    }

    sl-card.progress {
      grid-area: progress;
    }

    @media (orientation: landscape) {
      /* :host {
        flex-direction: row;
      } */
      .contents {
        display: grid;
        flex: 1;

        grid-template-columns: 
         /* info     */
          0
          /* toolbar  */ minmax(128px, 1fr)
          /* wheel    */ min(800px, calc(100vw - 40px), 90vh, 90dvh)
          /* progress */ minmax(128px, 1fr)
          /* .        */ 0;
        grid-template-areas:
          'info toolbar wheel progress . '
          'info toolbar wheel progress . '
          'info toolbar wheel progress . ';
      }

      sl-card.toolbar {
        place-self: stretch;
      }
      sl-card.toolbar::part(base) {
        height: 100%;
        /* width: 100%; */
      }
      sl-card.progress {
        place-self: stretch;
      }
      sl-card.progress::part(base) {
        height: 100%;
        /* width: 100%; */
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
        <sl-card class="toolbar">
          <game-view-toolbar></game-view-toolbar>
        </sl-card>
        <sl-card class="wheel">
          <tone-wheel
            color-scale=${colorScale}
            @note:holdBegan=${this.#pitchSelected}
            @note:holdEnded=${this.#pitchDeselected}
          >
            ${pitchClasses}
          </tone-wheel>
        </sl-card>
        <sl-card class="progress">
          <progress-view></progress-view>
        </sl-card>
      </div>
    `
  }
}

registerElement('game-view', GameViewElement)
