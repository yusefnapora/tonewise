import { LitElement, html, css, nothing } from 'lit'
import {
  keyboardActivationEventListener,
  registerElement,
} from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  selectNoteAriaLabel,
  selectNoteColor,
  selectNoteLabel,
  selectNoteLabelColor,
} from '../../state/selectors/selectors.js'
import { dispatch } from '../../state/store.js'
import {
  deriveScaleNotes,
  setScaleQuality,
  setTonicNote,
} from '../../state/slices/tuning-slice.js'
import { landscapeMediaQuery } from '../../styles.js'
import { classMap } from 'lit/directives/class-map.js'

export class ScaleControlsElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 96px;
      align-items: center;
      justify-content: space-between;
      user-select: none;
      -webkit-user-select: none;

      --color-selected-scale-highlight: var(--color-text);
    }

    scale-badge {
      margin: 4px 2px;
      min-width: 60px;
      max-width: 80px;
      width: 100%;
      aspect-ratio: 1;
    }

    scale-badge.selected {
      outline: 2px solid var(--color-selected-scale-highlight);
      outline-offset: 2px;
      border-radius: 10px;
      filter: drop-shadow(0 0 25px white);
    }

    scale-badge:focus-visible {
      outline: 4px solid var(--color-selected-scale-highlight);
      outline-offset: 2px;
      border-radius: 10px;
      /* filter: drop-shadow(0 0 25px white); */
    }

    .badges:has(scale-badge:focus-visible) {
      & > scale-badge.selected:not(:focus-visible) {
        outline: 2px dotted var(--color-selected-scale-highlight);
      }
    }

    /* scale-badge.selected:not(:focus-visible) {
      outline: 2px dotted var(--color-selected-scale-highlight);
    } */

    sl-button::part(base),
    sl-menu-item::part(base) {
      touch-action: manipulation;
    }

    sl-button::part(label) {
      color: var(--color-text);
      font-size: 1.4rem;
    }

    sl-menu-item::part(label) {
      color: var(--color-text);
      font-size: 1.2rem;
      font-family: var(--note-font-family);
    }

    sl-menu-item:active::part(base) {
      filter: brightness(0.8);
    }

    .note-dropdown::part(label) {
      min-width: 6ch;
      font-family: var(--note-font-family);
    }

    .badges {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      max-width: 100%;
    }

    .controls {
      margin-bottom: 8px;
    }

    ${landscapeMediaQuery} {
      :host {
        /* min-width: calc(15ch + 32px); */
        height: 100%;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
      }

      .badges {
        flex-direction: column;
        flex-wrap: wrap;
        width: 100%;
        max-height: 90%;
      }

      .controls {
        margin-top: 8px;
        margin-bottom: 0px;
      }
    }
  `

  #state = new StateController(this)
  stateChanged() {
    this.requestUpdate()
  }

  render() {
    const { state } = this.#state
    const { tuning } = state
    const { tonicNote } = tuning

    /**
     * @param {string} noteId
     * @param {1|-1} direction
     */
    const getNeighboringNoteId = (noteId, direction) => {
      let i = tuning.noteIds.indexOf(noteId)
      if (i < 0) {
        return undefined
      }
      i += direction
      if (i < 0) {
        i = tuning.noteIds.length - 1
      } else if (i >= tuning.noteIds.length) {
        i = 0
      }
      return tuning.noteIds[i]
    }

    const nextNote = getNeighboringNoteId(tonicNote, 1)
    const prevNote = getNeighboringNoteId(tonicNote, -1)
    const tonicNoteLabel = selectNoteLabel(state, tonicNote)
    const tonicColor = selectNoteColor(state, tonicNote)
    const prevColor = selectNoteColor(state, prevNote)
    const nextColor = selectNoteColor(state, nextNote)
    const tonicLabelColor = selectNoteLabelColor(state, tonicNote)
    const prevLabelColor = selectNoteLabelColor(state, prevNote)
    const nextLabelColor = selectNoteLabelColor(state, nextNote)
    const tonicAriaLabel = selectNoteAriaLabel(state, tonicNote)
    const prevAriaLabel = selectNoteAriaLabel(state, prevNote)
    const nextAriaLabel = selectNoteAriaLabel(state, nextNote)

    const noteMenuItems = tuning.noteIds.map(
      (noteId) => html`
        <sl-menu-item class=${`note-${noteId}`} value=${noteId}>
          <span aria-label=${selectNoteAriaLabel(state, noteId)}>
            ${selectNoteLabel(state, noteId)}
          </span>
        </sl-menu-item>
      `,
    )

    const noteMenuStyles = tuning.noteIds
      .map(
        (noteId) => `
      sl-menu-item.note-${noteId}::part(base) {
        background-color: ${selectNoteColor(state, noteId)};
      }
      sl-menu-item.note-${noteId}::part(label) {
        color: ${selectNoteLabelColor(state, noteId)};
      }
    `,
      )
      .join('\n')

    /** @param {import('@shoelace-style/shoelace').SlSelectEvent} e */
    const noteSelected = (e) => {
      const noteId = e.detail.item.value
      dispatch(setTonicNote(noteId))
    }

    /** @param {1|-1} adjust */
    const noteStepBy = (adjust) => {
      const nextNote = getNeighboringNoteId(tonicNote, adjust)
      dispatch(setTonicNote(nextNote))
    }

    // todo: don't hardcode, derive from state
    const scaleQualities = [
      'major',
      'minor',
      'harmonic minor',
      'blues',
      'chromatic',
    ]
    /** @param {string} q */
    const qualitySelected = (q) => {
      dispatch(setScaleQuality(q))
    }

    const qualityBadges = scaleQualities.map((quality) => {
      const noteIds = JSON.stringify(
        deriveScaleNotes(tuning.noteIds, tonicNote, quality),
      )
      const selected = quality === tuning.scaleQuality
      const classes = { selected }
      const ariaLabel = `${tonicAriaLabel} ${quality}`
      return html`
        <scale-badge
          role="radio"
          tabindex="0"
          aria-label=${ariaLabel}
          aria-checked=${selected}
          class=${classMap(classes)}
          @keyup=${keyboardActivationEventListener(() =>
            qualitySelected(quality),
          )}
          @badge:selected=${() => qualitySelected(quality)}
          tonic=${tonicNoteLabel}
          label=${quality}
          note-ids=${noteIds}>
        </scale-badge>
      `
    })

    const tonicControl = html`
      <sl-button-group aria-label="tonic note switcher">
        <sl-button class="prev-note" pill @click=${() => noteStepBy(-1)}>
          <sl-icon
            label="previous note: ${prevAriaLabel}"
            name="chevron-compact-left"></sl-icon>
        </sl-button>
        <sl-dropdown hoist>
          <sl-button label="tonic note" class="note-dropdown" slot="trigger">
            <span aria-label=${tonicAriaLabel}>${tonicNoteLabel}</span>
          </sl-button>
          <sl-menu @sl-select=${noteSelected}> ${noteMenuItems} </sl-menu>
        </sl-dropdown>
        <sl-button class="next-note" pill @click=${() => noteStepBy(1)}>
          <sl-icon
            label="next note: ${nextAriaLabel}"
            name="chevron-compact-right"></sl-icon>
        </sl-button>
      </sl-button-group>
    `

    return html`
      <style>
        .badges {
          --color-selected-scale-highlight: ${tonicColor};
        }

        .note-dropdown::part(base) {
          background-color: ${tonicColor};
        }

        .note-dropdown::part(label) {
          color: ${tonicLabelColor};
        }

        .prev-note::part(base) {
          background-color: ${prevColor};
        }

        .prev-note::part(label) {
          color: ${prevLabelColor};
        }

        .next-note::part(base) {
          background-color: ${nextColor};
        }
        .next-note::part(label) {
          color: ${nextLabelColor};
        }

        ${noteMenuStyles}
      </style>
      <section class="badges" role="radiogroup">${qualityBadges}</section>
      <section class="controls">
        <header>
          <sl-visually-hidden> Tonic note selection </sl-visually-hidden>
        </header>
        ${tonicControl}
      </section>
    `
  }
}

registerElement('scale-controls', ScaleControlsElement)
