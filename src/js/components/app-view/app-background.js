import { LitElement, css, html } from 'lit'
import {
  registerElement,
  resolveCSSVariables,
  setMetaThemeColors,
} from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import {
  selectAppBackgroundCss,
} from '../../state/selectors/selectors.js'
import Color from 'colorjs.io'

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

      --color-primary-lightness: var(--bgcolor-lightness, 40%);
      --color-primary-chroma: var(--bgcolor-chroma, 0.075);
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

  #state = new StateController(this)

  render() {
    let { background, themeColor } = this.#state.select(selectAppBackgroundCss)

    themeColor = resolveCSSVariables(themeColor, this)
    const c = new Color(themeColor).to('srgb').toString({ format: 'hex' })
    setMetaThemeColors(c)


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
