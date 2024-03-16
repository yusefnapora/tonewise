import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  isGameCompleted,
  isGameStarted,
} from '../../state/selectors/selectors.js'
import { endGame, startNewGame } from '../../state/sequences/game-sequences.js'
import { navigate } from '../../route-controller.js'

export class GameViewToolbarElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: space-between;

      width: 100%;
      height: 100%;
    }


    .buttons {
      font-size: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .message {
      width: 100%;
      text-align: center;
      font-size: 1.6rem;
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

    let message = 'Press play'
    if (started) {
      message = 'Find the hidden note'
    }
    if (completed) {
      // todo: show interval name
      message = 'Great job!'
    }

    const backButton = html`
        <sl-icon-button
          name="arrow-left-circle"
          label="Leave game"
          @click=${() => endGame(this.#stateController.dispatch)}
        >
        </sl-icon-button>
    ` 

    const settingsButton = html`
      <sl-icon-button
        name="gear-wide"
        label="settings"
        @click=${() => navigate('/settings')}
      ></sl-icon-button>
    `

    return html`
      <div class="buttons">${backButton} ${settingsButton}</div>
      <div class="message">${message}</div>
    `
  }
}

registerElement('game-view-toolbar', GameViewToolbarElement)
