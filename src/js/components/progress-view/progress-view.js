import { LitElement, css, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  selectCurrentRound,
  selectNoteLabel,
} from '../../state/selectors/selectors.js'
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
      /* margin: 10px; */
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
      justify-content: center;
      font-size: 48px; 
    }

    .badges {
      display: flex;
      flex-direction: row;
      align-items: center;
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
      margin-right: 10px;
    }

    @media (orientation: landscape) {
      .content {
        flex-direction: column;
        height: 100%;
      }
      .content.not-playing {
        height: 100%;
      }
      .badges {
        flex-direction: column;
      }
      .buttons {
        margin-right: 0;
        margin-bottom: 10px;
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


    const replayButton = html`
        <sl-icon-button 
          name="arrow-counterclockwise" 
          @click=${() => restartGame(this.#stateController.state, this.#stateController.dispatch)}>
        </sl-icon-button>
        `
    
    const nextRoundButton = html`
    <sl-icon-button 
      name="chevron-double-right" 
      @click=${() => startNewGame(this.#stateController.state, this.#stateController.dispatch)}>
    </sl-icon-button>
    `

    const showReplayButton = !challengePlaying && !currentRound.progress.isCompleted 
    const showNextRound = currentRound.progress.isCompleted === true

    const buttons = html`
      <div class="buttons">
        ${showReplayButton ? replayButton : undefined}
        ${showNextRound ? nextRoundButton : undefined}
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
