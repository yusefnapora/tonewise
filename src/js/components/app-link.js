import { LitElement, html, css } from 'lit'
import { sharedRouter } from '../route-controller.js'
import { registerElement } from '../common/dom.js'

export class AppLinkElement extends LitElement {
  static styles = css`
    a {
      color: var(--color-primary);
      text-decoration: none;
    }
    a:hover {
      color: color-mix(in lch, var(--color-primary), var(--color-text) 20%);
      text-decoration: underline;
    }

    a:focus-visible {
      border: 2px solid var(--color-primary);
      background-color: red;
      border-radius: 5px;
    }
  `

  static properties = {
    href: { type: String },
  }

  constructor() {
    super()
    this.href = '#'
    this.role = 'presentation'
  }

  /**
   *
   * @param {MouseEvent} e
   */
  #handleClick(e) {
    e.preventDefault()
    if (typeof this.onclick === 'function') {
      this.onclick(e)
    }
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
