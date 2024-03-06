import { LitElement, html } from 'lit'
import { registerElement } from '../../common/dom.js'

export class SettingsViewElement extends LitElement {

  render() {
    return html`
    <sl-card>
        <h1>settings</h1>
    </sl-card>
    `
  }
}

registerElement('settings-view', SettingsViewElement)
