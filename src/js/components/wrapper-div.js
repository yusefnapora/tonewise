import { registerElement } from '../common/dom.js'

/**
 * Like a regular <div>, but with `role = 'presentation'`
 * always set. Use when you need a div for styling, but
 * there's no semantic meaning to the element.
 */
export class WrapperDivElement extends HTMLElement {
  connectedCallback() {
    this.role = 'presentation'
  }
}

registerElement('wrapper-div', WrapperDivElement)
