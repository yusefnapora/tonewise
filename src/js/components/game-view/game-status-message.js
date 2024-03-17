import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  isGameCompleted,
  isGameStarted,
} from '../../state/selectors/selectors.js'
import { landscapeMediaQuery } from '../../styles.js'

export class GameStatusMessageElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;

      width: 100%;
      height: 100%;
    }

    .message {
      width: 100%;
      height: 100%;
      text-align: center;
      font-family: var(--status-message-font-family);
      font-size: 1.6rem;
    }
    ${landscapeMediaQuery} {
      :host {
        justify-content: flex-start;
      }
    }
  `
  #stateController = new StateController(this)


  render() {
    const started = this.#stateController.select(isGameStarted)
    const completed = this.#stateController.select(isGameCompleted)

    let message = 'Press play'
    if (started) {
      message = 'Tap the hidden note'
    }
    if (completed) {
      // todo: show interval name
      message = 'Great job!'
    }

    console.log('status message', message)
    return html`
      <div class="message">${message}</div>
    `
  }
}

registerElement('game-status-message', GameStatusMessageElement)
