import { LitElement, html } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  isGameCompleted,
  isGameStarted,
} from '../../state/selectors/selectors.js'
import { NoteIds } from '../../audio/notes.js'
import { playChallengeSequence, start } from '../../state/slices/game-slice.js'
import { resetInstrumentState } from '../../state/slices/instrument-slice.js'

export class ProgressViewElement extends LitElement {
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
        ? html`<sl-button variant="danger" @click=${() => this.#startGame()}
            >Give up</sl-button
          >`
        : html`<sl-button variant="primary" @click=${() => this.#startGame()}
            >New game</sl-button
          >`

    const replayButton = currentRound?.rules
      ? html`<sl-button
          variant="neutral"
          @click=${() => this.#startGame(currentRound.rules)}
          >Replay</sl-button
        >`
      : undefined
    const tonicLabel = tonic ? `Tonic: ${tonic.id}` : ''

    return html`
      <sl-card>
        <div>
          ${actionButton} ${replayButton}
          <div>${completed ? 'Correct!' : tonicLabel}</div>
        </div>
      </sl-card>
    `
  }
}

registerElement('progress-view', ProgressViewElement)
