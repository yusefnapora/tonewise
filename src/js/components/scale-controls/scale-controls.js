import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import { selectNoteLabel } from '../../state/selectors/selectors.js'
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
    }

    scale-badge {
      min-width: 60px;
      max-width: 80px;
      width: 100%;
      aspect-ratio: 1;
    }

    scale-badge.selected {
      border: 2px solid var(--color-text);
      border-radius: 10px;
      filter: drop-shadow(0 0 25px white);
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


    const tonicNoteLabel = selectNoteLabel(state, tonicNote)

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
      const tonicIndex = tuning.noteIds.indexOf(tonicNote)
      if (tonicIndex < 0) {
        return
      }
      let nextIndex = tonicIndex + adjust
      if (nextIndex < 0) {
        nextIndex = tuning.noteIds.length - 1
      }
      if (nextIndex >= tuning.noteIds.length) {
        nextIndex = 0
      }
      dispatch(setTonicNote(tuning.noteIds[nextIndex]))
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
        <sl-button pill @click=${() => noteStepBy(-1)}>
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
        <sl-button pill @click=${() => noteStepBy(1)}>
          <sl-icon name="chevron-compact-right"></sl-icon>
        </sl-button>
      </sl-button-group>
    `


    return html`
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
