import { LitElement, css, html, nothing } from 'lit'
import {
  keyboardActivationEventListener,
  registerElement,
} from '../../common/dom.js'
import { dispatch } from '../../state/store.js'
import { StateController } from '../../state/controller.js'
import {
  selectAudioLoadingState,
  selectCurrentRound,
  selectNoteLabel,
  selectProgressNoteBadgeInfo,
} from '../../state/selectors/selectors.js'
import {
  restartGame,
  startNewGame,
} from '../../state/sequences/game-sequences.js'
import { landscapeMediaQuery } from '../../styles.js'
import {
  triggerNoteStart,
  triggerNoteStop,
} from '../../state/slices/audio-slice.js'

export class ProgressViewElement extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 96px;
    }

    .content {
      touch-action: manipulation;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 100%;
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
      margin-right: 16px;
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

    note-badge:focus-visible {
      outline: 4px solid var(--color-primary);
      outline-offset: 10px;
      border-radius: 5px;
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

  #state = new StateController(this)

  constructor() {
    super()
    this.ariaLabel = 'progress panel'
  }

  /**
   * @param {string} id
   * @param {number} midiNumber
   */
  #startPlayback(id, midiNumber) {
    dispatch(triggerNoteStart({ id, midiNumber }))
  }

  /**
   * @param {string} id
   * @param {number} midiNumber
   */
  #stopPlayback(id, midiNumber) {
    dispatch(triggerNoteStop({ id, midiNumber }))
  }

  render() {
    const audioLoadingState = this.#state.select(selectAudioLoadingState)
    if (audioLoadingState === 'loading') {
      return html` <div class="content not-playing">
        <sl-visually-hidden>Loading...</sl-visually-hidden>
        <sl-spinner></sl-spinner>
      </div>`
    }
    const currentRound = this.#state.select(selectCurrentRound)
    if (!currentRound) {
      return html` <div class="content not-playing">
        <sl-icon-button
          role="presentation"
          name="play-fill"
          label="New game"
          @click=${() => startNewGame(this.#state.state, dispatch)}>
        </sl-icon-button>
      </div>`
    }
    const challengePlaying = currentRound.challengePlaying ?? false

    const noteInfo = this.#state.select(selectProgressNoteBadgeInfo)

    const noteBadges = noteInfo.map((info) => {
      const { noteId, noteRevealed, highlighted, hidden, midiNote } = info
      const label = this.#state.select(selectNoteLabel, noteId)
      const startPlayback = () => this.#startPlayback(noteId, midiNote)
      const stopPlayback = () => this.#stopPlayback(noteId, midiNote)
      return html`
        <note-badge
          role="button"
          tabindex="0"
          aria-selected=${highlighted}
          class=${hidden ? 'hidden' : ''}
          note-id=${noteId}
          label=${label}
          reveal=${noteRevealed ? 'true' : nothing}
          highlight=${highlighted ? 'true' : nothing}
          @pointerdown=${startPlayback}
          @pointerup=${stopPlayback}
          @pointerleave=${stopPlayback}
          @keydown=${keyboardActivationEventListener((e) => {
            if (e.repeat) {
              return
            }
            startPlayback()
          })}
          @keyup=${keyboardActivationEventListener(stopPlayback)}></note-badge>
      `
    })

    const statusView = html` <div class="badges">${noteBadges}</div> `

    const replayButton = html`
      <sl-icon-button
        role="presentation"
        label="replay this round"
        name="arrow-counterclockwise"
        @click=${() => restartGame(this.#state.state, dispatch)}>
      </sl-icon-button>
    `

    const nextRoundButton = html`
      <sl-icon-button
        role="presentation"
        label="next round"
        name="chevron-double-right"
        @click=${() => startNewGame(this.#state.state, dispatch)}>
      </sl-icon-button>
    `

    const showReplayButton =
      !challengePlaying && !currentRound.progress.isCompleted
    const showNextRound = currentRound.progress.isCompleted === true

    const buttons = html`
      <div class="buttons">
        ${showReplayButton ? replayButton : undefined}
        ${showNextRound ? nextRoundButton : undefined}
      </div>
    `

    return html`
      <div role="presentation" class="content">${statusView} ${buttons}</div>
    `
  }
}

registerElement('progress-view', ProgressViewElement)
