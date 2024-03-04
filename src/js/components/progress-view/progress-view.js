import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  isGameCompleted,
  isGameStarted,
} from '../../state/selectors/selectors.js'
import { NoteIds } from '../../audio/notes.js'
import { playChallengeSequence, reset, start } from '../../state/slices/game-slice.js'
import { resetInstrumentState } from '../../state/slices/instrument-slice.js'

export class ProgressViewElement extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    sl-card {
      width: 100%;
      max-width: min(500px, calc(100vw - 40px));
    }
    .content {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }

    .in-progress {
      justify-content: space-between;
    }
  `

  #stateController = new StateController(this)

  /**
   *
   * @param {import('../../state/slices/types.js').GameRules|undefined} [rules]
   */
  #startGame(rules) {
    if (!rules) {
      const tonic = this.#getRandomNote()
      let target = this.#getRandomNote()
      while (target.id === tonic.id) {
        target = this.#getRandomNote()
      }
      rules = { tonic, targets: [target] }
    }
    const progress = { guesses: [] }

    this.#stateController.dispatch(start({ rules, progress }))
    this.#stateController.dispatch(resetInstrumentState())
    this.#stateController.dispatch(playChallengeSequence())
  }

  #leaveGame() {
    this.#stateController.dispatch(reset())
    this.#stateController.dispatch(resetInstrumentState())
  }

  #getRandomNote() {
    const id = NoteIds[Math.floor(Math.random() * NoteIds.length)]
    return { id }
  }

  render() {
    const { state } = this.#stateController
    const { currentRound } = state.game
    const tonic = currentRound?.rules?.tonic
    const started = isGameStarted(state)
    const completed = isGameCompleted(state)

    const actionButton =
      started && !completed
        ? html`
          <sl-tooltip content="Leave game">
            <sl-icon-button 
              name="x-octagon-fill" label="Leave game" 
              @click=${() => this.#leaveGame()}>
            </sl-icon-button>
          </sl-tooltip>
          `
        : html`
          <sl-tooltip content="New game">
            <sl-icon-button
              name="play-fill" label="New game" 
              @click=${() => this.#startGame()}>
            </sl-icon-button>
          </sl-tooltip>
        `

    const replayButton = currentRound?.rules
      ? html`
        <sl-tooltip content="Replay">
          <sl-icon-button
            name="arrow-counterclockwise"
            @click=${() => this.#startGame(currentRound.rules)}
            >
          </sl-icon-button>
        </sl-tooltip>
          `
      : undefined
    const tonicLabel = tonic ? `Tonic: ${tonic.id}` : ''

    const statusView = started 
      ? html`
        <div>
          ${completed ? 'Correct!' : tonicLabel}
        </div>`
      : undefined

    const contentClass = `content ${started ? 'in-progress' : ''}`
    return html`
      <sl-card>
        <div class=${contentClass}>
          ${statusView}
          <div>
            ${actionButton} ${replayButton}
          </div>
        </div>
      </sl-card>
    `
  }
}

registerElement('progress-view', ProgressViewElement)
