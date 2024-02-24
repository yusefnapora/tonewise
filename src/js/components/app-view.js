// @ts-check

import { LitElement, html, css } from 'lit'

export class AppViewElement extends LitElement {
  static styles = css`
    tone-wheel {
      max-width: 50vw;
      margin: auto;
    }
  `;

  render() {
    return html`<game-view></game-view>`
  }
}
customElements.define('app-view', AppViewElement)
