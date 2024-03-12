import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'

import { COLOR_SCALE_NAMES, asColorScaleName } from '../../common/color.js'
import { StateController } from '../../state/controller.js'
import { selectColorScale, selectEnharmonicPresentation } from '../../state/selectors/selectors.js'
import { setColorScale, setEnharmonicPresentation } from '../../state/slices/preferences-slice.js'
import { cardStyleBase } from '../../styles.js'
import { navigate } from '../../route-controller.js'

export class SettingsViewElement extends LitElement {
  static styles = css`
    .card-title {
      font-size: 2rem;
    }

    .control {
      margin-top: 16px;
      margin-bottom: 16px;
    }

    .enharmonic {
      font-size: 1.5rem;
    }

    ${cardStyleBase}
  `

  #stateController = new StateController(this)

  render() {
    const enharmonicPresentation = this.#stateController.select(selectEnharmonicPresentation)
    const colorScale = this.#stateController.select(selectColorScale)

    const colorOptions = Object.entries(COLOR_SCALE_NAMES).map(([value, name]) => html`
      <sl-option value=${value}>${name}</sl-option>
    `)

    /**
     * @param {CustomEvent} e 
     */
    const colorChanged = (e) => {
      const newScale = asColorScaleName(e.target['value'])
      if (newScale) {
        this.#stateController.dispatch(setColorScale(newScale))
      }
    }

    /** @param {CustomEvent} e */
    const enharmonicsChanged = (e) => {
      const val = e.target['value']
      if (val === 'sharp') {
        this.#stateController.dispatch(setEnharmonicPresentation('sharp')) 
      } else if (val === 'flat') {
        this.#stateController.dispatch(setEnharmonicPresentation('flat'))
      }
    }

    return html`
      <sl-card class="card-header">
        <div slot="header">
          <sl-icon-button name="arrow-left" @click=${() => navigate('/')}></sl-icon-button>
          <span class="card-title">settings</span>
        </div>

        <div class="control">
          <sl-select label="Color palette" value=${colorScale} @sl-change=${colorChanged}>
            ${colorOptions}
          </sl-select>
        </div>

        <div class="control">
          <sl-radio-group label="Display sharps or flats?" name="enharmonics" value="${enharmonicPresentation}" @sl-change=${enharmonicsChanged}>
            <sl-radio-button value="sharp"><span class="enharmonic" slot="prefix">♯</span>Sharps</sl-radio-button>
            <sl-radio-button value="flat"><span class="enharmonic" slot="prefix">♭</span>Flats</sl-radio-button>
          </sl-radio-group>
        </div>
      </sl-card>
    `
  }
}

registerElement('settings-view', SettingsViewElement)
