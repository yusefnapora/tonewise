import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'

import { COLOR_SCALE_NAMES, asColorScaleName } from '../../common/color.js'
import { StateController } from '../../state/controller.js'
import { selectColorScale } from '../../state/selectors/selectors.js'
import { setColorScale } from '../../state/slices/preferences-slice.js'
import { cardStyleBase } from '../../styles.js'
import { navigate } from '../../route-controller.js'

export class SettingsViewElement extends LitElement {
  static styles = css`
    .card-title {
      font-size: 2rem;
    }

    ${cardStyleBase}
  `

  #stateController = new StateController(this)

  render() {
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

    return html`
      <sl-card class="card-header">
        <div slot="header">
          <sl-icon-button name="arrow-left" @click=${() => navigate('/')}></sl-icon-button>
          <span class="card-title">settings</span>
        </div>

        <sl-select label="Color palette" value=${colorScale} @sl-change=${colorChanged}>
          ${colorOptions}
        </sl-select>
      </sl-card>
    `
  }
}

registerElement('settings-view', SettingsViewElement)
