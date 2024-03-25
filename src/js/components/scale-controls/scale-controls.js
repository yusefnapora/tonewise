import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import { selectNoteLabel, selectScaleNoteIds } from '../../state/selectors/selectors.js'
import { dispatch } from '../../state/store.js'
import { setScaleQuality, setTonicNote } from '../../state/slices/tuning-slice.js'
import { landscapeMediaQuery } from '../../styles.js'

export class ScaleControlsElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      width: 100%;
      min-height: 96px;
      align-items: center;
      justify-content: space-between;
    }

    scale-badge {
      width: 80px;
      aspect-ratio: 1;
    }

    .quality-dropdown::part(label) {
      min-width: 15ch;
    }

    .landscape-controls {
      display: none;
    }

    ${landscapeMediaQuery} {
      :host {
        min-width: calc(15ch + 32px);
        height: 100%;
        flex-direction: column;
        justify-content: space-between;
      }

      .landscape-controls {
        display: flex;
        height: 100%;
        min-height: 100px;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
      }

      .portrait-controls {
        display: none;
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
    const scaleNoteIds = tuning.scaleNotes

    const noteMenuItems = tuning.noteIds.map(noteId => html`
      <sl-menu-item value=${noteId}>${selectNoteLabel(state, noteId)}</sl-menu-item>
    `)

    /** @param {import('@shoelace-style/shoelace').SlSelectEvent} e */
    const noteSelected = (e) => {
      const noteId = e.detail.item.value
      dispatch(setTonicNote(noteId))
    }

    // todo: don't hardcode, derive from state
    const scaleQualities = ['major', 'minor', 'harmonic minor', 'blues', 'chromatic']
    /** @param {import('@shoelace-style/shoelace').SlSelectEvent} e */
    const qualitySelected = (e) => {
      dispatch(setScaleQuality(e.detail.item.value))
    }
    const currentScale = tuning.scaleQuality 
    const qualityMenuItems = scaleQualities.map(quality => html`
      <sl-menu-item value=${quality}>
        ${quality}
      </sl-menu-item>
    `)
    const badgeLabel = currentScale === 'chromatic' ? '' : currentScale

    const buttons = placement => html`
      <sl-dropdown hoist placement=${placement}>
        <sl-button slot="trigger" caret pill>
          ${tonicNoteLabel}
        </sl-button>
        <sl-menu @sl-select=${noteSelected}>
          ${noteMenuItems}
        </sl-menu>
      </sl-dropdown>

      <sl-dropdown hoist placement=${placement}>
        <sl-button class="quality-dropdown" slot="trigger" caret pill>
          ${currentScale}
        </sl-button>
        <sl-menu @sl-select=${qualitySelected}>
          ${qualityMenuItems}
        </sl-menu>
      </sl-dropdown>
    `
    const buttonsPortrait = html`
      <sl-button-group class="portrait-controls">
        ${buttons('top')}
      </sl-button-group>
    `

    const buttonsLandscape = html`
      <div class="landscape-controls">
        ${buttons('left')}
      </div>
    `

    return html`
      <scale-badge 
        tonic=${tonicNoteLabel}
        label=${badgeLabel}
        note-ids=${JSON.stringify(scaleNoteIds)}>
      </scale-badge>
      <div class="controls">
        ${buttonsPortrait}
        ${buttonsLandscape}
      </div>
    `
  }
}

registerElement('scale-controls', ScaleControlsElement)
