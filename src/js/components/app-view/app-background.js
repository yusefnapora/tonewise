import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  selectColorScale,
  selectNoteAngle,
  selectTuningNoteIds,
} from '../../state/selectors/selectors.js'
import { colorForAngle } from '../../common/color.js'

export class AppBackgroundElement extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      min-width: 100vw;
      min-height: min(100vh, 100dvh);
      display: grid;
      place-content: center;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;

      --color-primary-lightness: var(--bgcolor-lightness);
      --color-primary-chroma: var(--bgcolor-chroma);
    }

    :host > * {
      grid-row: 1;
      grid-column: 1;
    }

    .app-background {
      min-width: 100vw;
      min-height: min(100vh, 100dvh);
    }
  `

  #stateController = new StateController(this)

  render() {
    const noteIds = this.#stateController.select(selectTuningNoteIds)
    const colorScale = this.#stateController.select(selectColorScale)

    let background = 'var(--color-background)'
    if (colorScale.startsWith('oklch')) {
      const colors = [...noteIds, noteIds[0]].map((noteId) => {
        const angle = this.#stateController.select(selectNoteAngle, noteId)
        return colorForAngle(angle, colorScale)
      })
      background = `conic-gradient(${colors.join(', ')})`
    }

    return html`
      <style>
        .app-background {
          background: ${background};
        }
      </style>
      <div class="app-background"></div>
    `
  }
}

registerElement('app-background', AppBackgroundElement)
