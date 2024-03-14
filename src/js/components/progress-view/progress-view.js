import { LitElement, css, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  isGameStarted,
  selectCurrentRound,
  selectNoteLabel,
} from '../../state/selectors/selectors.js'
import { playChallengeSequence, start } from '../../state/slices/game-slice.js'
import { resetInstrumentState } from '../../state/slices/instrument-slice.js'

export class ProgressViewElement extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
    }

    sl-card {
      width: 100%;
    }
    .content {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .badges {
      display: flex;
      flex-direction: row;
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
    }

    @media (orientation: landscape) {
      .badges {
        flex-direction: column;
      }
    }
  `

  #stateController = new StateController(this)

  #restartGame(rules) {
    const progress = { guesses: [ ] }
    this.#stateController.dispatch(start({ rules, progress }))
    this.#stateController.dispatch(resetInstrumentState())
    this.#stateController.dispatch(playChallengeSequence())
  }

  render() {
    const currentRound = this.#stateController.select(selectCurrentRound)
    const tonic = currentRound?.rules?.tonic
    const started = this.#stateController.select(isGameStarted)
    const { challengePlaying } = currentRound

    const targetNoteBadges = currentRound?.rules.targets.map((note) => {
      const reveal = currentRound?.progress.guesses.some(
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

    const tonicLabel = this.#stateController.select(selectNoteLabel, tonic?.id)
    const statusView = started
      ? html`
          <div class="badges">
            <note-badge
              note-id=${tonic?.id}
              label=${tonicLabel}
              reveal
            ></note-badge>
            ${targetNoteBadges}
          </div>
        `
      : undefined

    const replayButton = challengePlaying 
      ? undefined 
      : html`
        <sl-icon-button 
          name="arrow-counterclockwise" 
          @click=${() => this.#restartGame(currentRound?.rules)}>
        </sl-icon-button>
        `

    const buttons = html`
      <div class="buttons">
        ${replayButton}
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
