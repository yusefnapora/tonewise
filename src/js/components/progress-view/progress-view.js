import { LitElement, css, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  isGameStarted,
  selectCurrentRound,
  selectNoteLabel,
} from '../../state/selectors/selectors.js'
import { playChallengeSequence, start } from '../../state/slices/game-slice.js'
import { resetInstrumentState } from '../../state/slices/instrument-slice.js'
import { restartGame, startNewGame } from '../../state/sequences/game-sequences.js'

export class ProgressViewElement extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
    }

    sl-card {
      width: 100%;
      height: 100%;
    }

    sl-card::part(body) {
      height: 100%;
    }

    .content {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 100%;
    }

    .content.not-playing {
      /* todo: remove instead of hiding, once we're done playing around */
      display: none; 
      justify-content: center;
      font-size: 48px; 
    }

    .badges {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      width: 100%;
    }

    .badges note-badge {
      width: 64px;
      height: 64px;
      margin: 8px;
    }

    .buttons {
      display: flex;
      align-items: center;
      justify-self: flex-end;
      font-size: 48px;
    }

    @media (orientation: landscape) {
      .content {
        flex-direction: column;
        
      }
      .badges {
        flex-direction: column;
      }
    }
  `

  #stateController = new StateController(this)

  stateChanged() {
    // TODO: figure out why selector update logic in state controller
    // isn't working for this component
    this.requestUpdate()
  }

  render() {
    const currentRound = this.#stateController.select(selectCurrentRound)
    if (!currentRound) {
      return html`
        <div class="content not-playing">
            <sl-icon-button
              name="play-fill"
              label="New game"
              @click=${() => startNewGame(this.#stateController.state, this.#stateController.dispatch)}
            >
            </sl-icon-button>
        </div>`
    }
    const tonic = currentRound.rules.tonic
    const challengePlaying = currentRound.challengePlaying ?? false

    const targetNoteBadges = currentRound.rules.targets.map((note) => {
      const reveal = currentRound.progress.guesses.some(
        (guess) => guess.isCorrect && guess.note.id === note.id,
      )
      const label = this.#stateController.select(selectNoteLabel, note.id)
      return html`
        <note-badge
          note-id=${note.id}
          label=${label}
          reveal=${reveal ? 'true' : nothing}
        ></note-badge>
      `
    })

    const tonicLabel = this.#stateController.select(selectNoteLabel, tonic.id)
    const statusView = html`
      <div class="badges">
        <note-badge
          note-id=${tonic.id}
          label=${tonicLabel}
          reveal
        ></note-badge>
        ${targetNoteBadges}
      </div>
    `


    const replayButton = !challengePlaying
      ? html`
        <sl-icon-button 
          name="arrow-counterclockwise" 
          @click=${() => restartGame(this.#stateController.state, this.#stateController.dispatch)}>
        </sl-icon-button>
        `
      : undefined

    const buttons = html`
      <div class="buttons">
        ${replayButton}
      </div>
    `

    return html`
      <div class="content">
        ${statusView}
        ${buttons}
      </div>
    `
  }
}

registerElement('progress-view', ProgressViewElement)
