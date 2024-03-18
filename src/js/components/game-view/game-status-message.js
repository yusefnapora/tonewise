import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  isGameCompleted,
  isGameStarted,
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
    const started = this.#stateController.select(isGameStarted)
    const completed = this.#stateController.select(isGameCompleted)

    let message = 'Press play'
    let intervalName = ''
    if (started) {
      message = 'Tap the hidden note'
    }
    if (completed) {
      // todo: show interval name
      message = 'Great job!'

      const { tuning, game } = this.#stateController.state
      const { tonic, targets } = game.currentRound.rules
      const tonicMidi = tuning.midiNotes[tonic.id]
      if (targets.length === 1) {
        const targetMidi = tuning.midiNotes[targets[0].id]
        const interval = midiNoteInterval(tonicMidi, targetMidi)
        intervalName = intervalDisplayName(interval)
      }
    }

    const intervalDisplay = intervalName === '' ? undefined : html`<p>${intervalName}</p>`

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
