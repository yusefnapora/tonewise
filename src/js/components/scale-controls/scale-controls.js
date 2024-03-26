import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import { selectNoteColor, selectNoteLabel } from '../../state/selectors/selectors.js'
import { dispatch } from '../../state/store.js'
import { deriveScaleNotes, setScaleQuality, setTonicNote } from '../../state/slices/tuning-slice.js'
import { landscapeMediaQuery } from '../../styles.js'
import { classMap } from 'lit/directives/class-map.js'

export class ScaleControlsElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 96px;
      align-items: center;
      justify-content: space-between;

      --color-selected-scale-highlight: var(--color-text);
    }

    scale-badge {
      min-width: 60px;
      max-width: 80px;
      width: 100%;
      aspect-ratio: 1;
    }

    scale-badge.selected {
      border: 2px solid var(--color-selected-scale-highlight);
      border-radius: 10px;
      filter: drop-shadow(0 0 25px white);
    }

    sl-button::part(label) {
      color: var(--color-text);
    }

    .note-dropdown::part(label) {
      min-width: 6ch;
    }

    .badges {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      max-width: 100%;
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
    const nextNoteId = (noteId, direction) => {
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

    const tonicNoteLabel = selectNoteLabel(state, tonicNote)
    const tonicColor = selectNoteColor(state, tonicNote)
    const prevColor = selectNoteColor(state, nextNoteId(tonicNote, -1))
    const nextColor = selectNoteColor(state, nextNoteId(tonicNote, 1))

    const noteMenuItems = tuning.noteIds.map(noteId => html`
      <sl-menu-item value=${noteId}>${selectNoteLabel(state, noteId)}</sl-menu-item>
    `)

    /** @param {import('@shoelace-style/shoelace').SlSelectEvent} e */
    const noteSelected = (e) => {
      const noteId = e.detail.item.value
      dispatch(setTonicNote(noteId))
    }

    /** @param {1|-1} adjust */
    const noteStepBy = (adjust) => {
      const nextNote = nextNoteId(tonicNote, adjust)
      dispatch(setTonicNote(nextNote))
    }


    // todo: don't hardcode, derive from state
    const scaleQualities = ['major', 'minor', 'harmonic minor', 'blues', 'chromatic']
    /** @param {string} q */
    const qualitySelected = (q) => {
      dispatch(setScaleQuality(q))
    }

    const qualityBadges = scaleQualities.map(quality => {
      const noteIds = JSON.stringify(deriveScaleNotes(tuning.noteIds, tonicNote, quality))
      const selected = quality === tuning.scaleQuality
      const classes = { selected }
      return html`
        <scale-badge
          class=${classMap(classes)}
          @click=${() => qualitySelected(quality)}
          tonic=${tonicNoteLabel}
          label=${quality}
          note-ids=${noteIds}>
        </scale-badge>
      `
    })

    const tonicControl = html`
      <sl-button-group>
        <sl-button class="prev-note" pill @click=${() => noteStepBy(-1)}>
          <sl-icon name="chevron-compact-left"></sl-icon>
        </sl-button>
        <sl-dropdown hoist>
          <sl-button class="note-dropdown" slot="trigger">
            ${tonicNoteLabel}
          </sl-button>
          <sl-menu @sl-select=${noteSelected}>
            ${noteMenuItems}
          </sl-menu>
        </sl-dropdown>
        <sl-button class="next-note" pill @click=${() => noteStepBy(1)}>
          <sl-icon name="chevron-compact-right"></sl-icon>
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

        .prev-note::part(base) {
          background-color: ${prevColor};
        }

        .next-note::part(base) {
          background-color: ${nextColor};
        }
      </style>
      <div class="badges">

        ${qualityBadges}
      </div>
      <div class="controls">
        ${tonicControl}
      </div>
    `
  }
}

registerElement('scale-controls', ScaleControlsElement)
