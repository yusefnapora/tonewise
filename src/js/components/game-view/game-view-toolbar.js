import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  isGameCompleted,
  isGameStarted,
  selectCurrentRound,
} from '../../state/selectors/selectors.js'
import { NoteIds } from '../../audio/notes.js'
import {
  playChallengeSequence,
  reset,
  start,
} from '../../state/slices/game-slice.js'
import { resetInstrumentState } from '../../state/slices/instrument-slice.js'
import { endGame, startNewGame } from '../../state/sequences/game-sequences.js'

export class GameViewToolbarElement extends LitElement {
  static styles = css`
    :host {
      font-size: 2rem;
    }

    .buttons {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    @media (orientation: landscape) {
      :host {
        flex-direction: column;
      }
      .buttons {
        flex-direction: column;
      }
    }
  `
  #stateController = new StateController(this)


  render() {
    const started = this.#stateController.select(isGameStarted)
    const completed = this.#stateController.select(isGameCompleted)
    const actionButton =
      started && !completed
        ? html`
            <sl-icon-button
              name="x-octagon-fill"
              label="Leave game"
              @click=${() => endGame(this.#stateController.dispatch)}
            >
            </sl-icon-button>
          `
        : html`
            <sl-icon-button
              name="play-fill"
              label="New game"
              @click=${() => startNewGame(this.#stateController.state, this.#stateController.dispatch)}
            >
            </sl-icon-button>
          `

    return html` <div class="buttons">${actionButton}</div> `
  }
}

registerElement('game-view-toolbar', GameViewToolbarElement)
