import { LitElement, html } from "lit"
import { sharedRouter } from "../route-controller.js"
import { registerElement } from "../common/dom.js"

export class AppLinkElement extends LitElement {
  static properties = {
    href: { type: String }
  }

  constructor() {
    super()
    this.href = "#"
  }

  /**
   * 
   * @param {MouseEvent} e 
   */
  #handleClick(e) {
    e.preventDefault()
    sharedRouter.navigate(this.href)
  }

  render() {
    return html`
      <a href=${this.href} @click=${this.#handleClick.bind(this)}>
        <slot></slot>
      </a>
    `
  }
}

registerElement('app-link', AppLinkElement)
