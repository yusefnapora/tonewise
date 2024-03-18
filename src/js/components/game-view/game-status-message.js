import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  isGameCompleted,
  isGameStarted,
  selectStatusMessage,
  selectTargetName,
} from '../../state/selectors/selectors.js'
import { landscapeMediaQuery } from '../../styles.js'
import { intervalDisplayName, midiNoteInterval } from '../../common/intervals.js'

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
      display: flex;
      flex-direction: column;
      justify-content: space-between;
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
    const isCompleted = this.#stateController.select(isGameCompleted)
    const message = this.#stateController.select(selectStatusMessage)
    const intervalName = this.#stateController.select(selectTargetName)

    const intervalDisplay = isCompleted
      ? html`<p>${intervalName}</p>`
      : undefined

    console.log('status message', message)
    return html`
      <div class="message">
        ${message}
        ${intervalDisplay}
      </div>
    `
  }
}

registerElement('game-status-message', GameStatusMessageElement)
