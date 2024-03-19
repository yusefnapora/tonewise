import { LitElement, css, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  selectAudioLoadingState,
  selectCurrentRound,
  selectNoteLabel,
  selectProgressNoteBadgeInfo,
} from '../../state/selectors/selectors.js'
import { restartGame, startNewGame } from '../../state/sequences/game-sequences.js'
import { landscapeMediaQuery } from '../../styles.js'

export class ProgressViewElement extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 96px;
      /* margin: 10px; */
    }

    .content {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      /* margin: 10px; */
    }

    .content.not-playing {
      justify-content: center;
      font-size: 48px; 
    }

    .badges {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      /* margin-left: 5px; */
    }

    .badges note-badge {
      width: 64px;
      height: 64px;
      margin: 8px;
    }

    note-badge.hidden {
      opacity: 0;
      transform: scale(0.05);
    }

    note-badge:not(.hidden) {
      transition: all 0.2s ease-in-out;
      opacity: 100%;
      transform: scale(1);
    }

    .buttons {
      display: flex;
      align-items: center;
      justify-self: flex-end;
      font-size: 48px;
      /* margin-right: 5px; */
    }

    ${landscapeMediaQuery} {
      .content {
        flex-direction: column;
        height: 100%;
      }
      .content.not-playing {
        height: 100%;
      }
      .badges {
        flex-direction: column;
        /* margin-left: 0px;
        margin-top: 10px; */
      }
      /* .buttons {
        margin-right: 0px;
        margin-bottom: 10px;
      } */
    }
  `

  #stateController = new StateController(this)

  stateChanged() {
    // TODO: figure out why selector update logic in state controller
    // isn't working for this component
    this.requestUpdate()
  }

  render() {
    const audioLoadingState = this.#stateController.select(selectAudioLoadingState)
    if (audioLoadingState === 'loading') {
      return html`
      <div class="content not-playing">
        <sl-spinner></sl-spinner> 
      </div>` 
    }
    const currentRound = this.#stateController.select(selectCurrentRound)
    if (!currentRound) {
      return html`
        <div class="content not-playing">
            <sl-icon-button
              name="play-fill"
              label="New game"
              @click=${() => startNewGame(this.#stateController.state, this.#stateController.dispatch)}
            >
            </sl-icon-button>
        </div>`
    }
    const challengePlaying = currentRound.challengePlaying ?? false

    const noteInfo = this.#stateController.select(selectProgressNoteBadgeInfo)

    const noteBadges = noteInfo.map((info) => {
      const { noteId, noteRevealed, highlighted, hidden } = info
      const label = this.#stateController.select(selectNoteLabel, noteId)
      return html`
        <note-badge
          class=${hidden ? 'hidden' : ''}
          note-id=${noteId}
          label=${label}
          reveal=${noteRevealed ? 'true' : nothing}
          highlight=${highlighted ? 'true' : nothing}
        ></note-badge>
      ` 
    })

    const statusView = html`
    <div class="badges">
      ${noteBadges}
    </div>
  `

    const replayButton = html`
        <sl-icon-button 
          name="arrow-counterclockwise" 
          @click=${() => restartGame(this.#stateController.state, this.#stateController.dispatch)}>
        </sl-icon-button>
        `
    
    const nextRoundButton = html`
    <sl-icon-button 
      name="chevron-double-right" 
      @click=${() => startNewGame(this.#stateController.state, this.#stateController.dispatch)}>
    </sl-icon-button>
    `

    const showReplayButton = !challengePlaying && !currentRound.progress.isCompleted 
    const showNextRound = currentRound.progress.isCompleted === true

    const buttons = html`
      <div class="buttons">
        ${showReplayButton ? replayButton : undefined}
        ${showNextRound ? nextRoundButton : undefined}
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
