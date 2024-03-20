import { LitElement, html } from 'lit'
import { registerElement } from '../../common/dom.js'

export class IconSandboxViewElement extends LitElement {

  render() {
    return html`
      <wheel-icon active-notes="G♯,E"></wheel-icon>
    `
  }
}

registerElement('icon-sandbox', IconSandboxViewElement)