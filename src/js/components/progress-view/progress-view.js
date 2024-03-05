import { LitElement, css, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  isGameCompleted,
  isGameStarted,
} from '../../state/selectors/selectors.js'

export class ProgressViewElement extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 64px;
    }

    @media (orientation: landscape) {
      :host {
        flex-direction: column;
      }
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

    .badges {
      display: flex;
      flex-direction: row;
    }

    .badges note-badge {
      width: 48px;
      height: 48px;
      margin-left: 12px;
      margin-right: 12px;
    }
  `

  #stateController = new StateController(this)

  render() {
    const { state } = this.#stateController
    const { currentRound } = state.game
    const tonic = currentRound?.rules?.tonic
    const started = isGameStarted(state)
    const completed = isGameCompleted(state)

    
    const tonicLabel = tonic ? `Tonic: ${tonic.id}` : ''


    const targetNoteBadges = currentRound?.rules.targets.map(note => {
      const reveal = currentRound?.progress.guesses
        .some(guess => guess.isCorrect && guess.note.id === note.id)
      return html`
        <note-badge note-id=${note.id} reveal=${reveal ? 'true' : nothing}></note-badge>
      `
    })

    const statusView = started 
      ? html`
        <div>
          <div class="badges">
            <note-badge note-id=${tonic?.id} reveal></note-badge>
            ${targetNoteBadges}
          </div>
        </div>`
      : undefined

    return html`
        <div class="in-progress">
          ${statusView}
        </div>
    `
  }
}

registerElement('progress-view', ProgressViewElement)
