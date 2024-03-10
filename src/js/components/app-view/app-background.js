import { LitElement, css, html } from "lit"
import { registerElement } from "../../common/dom.js"
import { StateController } from "../../state/controller.js"
import { selectColorScale, selectNoteAngle, selectTuningNoteIds } from "../../state/selectors/selectors.js"
import { colorForAngle } from "../../common/color.js"

export class AppBackgroundElement extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      min-width: 100vw;
      min-height: 100vh;
      display: grid;
      place-content: center;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
    }

    :host > * {
      grid-row: 1;
      grid-column: 1;
    }

    .app-background {
      min-width: 100vw;
      min-height: 100vh;

      --color-primary-lightness: var(--bgcolor-lightness);
      --color-primary-chroma: var(--bgcolor-chroma);
    }

    .app-background-filter {
      min-width: 100vw;
      min-height: 100vh;
      backdrop-filter: blur(5px) brightness(60%) saturate(60%);
    }

    @media (prefers-color-scheme: light) {
      .app-background-filter {
        backdrop-filter: blur(5px) brightness(80%) saturate(80%);
      }
    }
  `

  #stateController = new StateController(this)

  render() {
    const { state } = this.#stateController
    const noteIds = selectTuningNoteIds(state)
    const colorScale = selectColorScale(state)

    const colors = [...noteIds, noteIds[0]].map(noteId => {
      const angle = selectNoteAngle(state, noteId)
      return colorForAngle(angle, colorScale)
    })

    const background = `conic-gradient(${colors.join(', ')})`

    const showFilter = !colorScale.startsWith('oklch')
    const filter = showFilter ? html `<div class="app-background-filter"></div>` : undefined

    return html`
      <style>
        .app-background {
          background: ${background};
        }
      </style>
      <div class="app-background"></div>
      ${filter}
    `
  }
}

registerElement('app-background', AppBackgroundElement)
