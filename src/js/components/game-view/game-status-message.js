import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  isGameCompleted,
  selectStatusMessage,
  selectTargetName,
} from '../../state/selectors/selectors.js'
import { landscapeMediaQuery } from '../../styles.js'

export class GameStatusMessageElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;

      max-width: calc(100dvw - 128px);
      width: 100%;
      margin: auto;
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

      /* padding-left: 12px;
      margin-right: 48px; */
    }
    ${landscapeMediaQuery} {
      :host {
        justify-content: flex-start;
        max-width: 100%;
      }
    }
  `
  #state = new StateController(this)

  render() {
    const isCompleted = this.#state.select(isGameCompleted)
    const message = this.#state.select(selectStatusMessage)
    const intervalName = this.#state.select(selectTargetName)

    const intervalDisplay = isCompleted
      ? html`<p>${intervalName}</p>`
      : undefined

    console.log('status message', message)
    return html` <div class="message">${message} ${intervalDisplay}</div> `
  }
}

registerElement('game-status-message', GameStatusMessageElement)
