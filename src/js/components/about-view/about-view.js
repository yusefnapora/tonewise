import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'

export class AboutViewElement extends LitElement {
  static styles = css`
    :host {
      max-width: min(500px, 80dvw);
    }
  `

  render() {
    return html`
      <glass-panel>
        <h2>About</h2>
        <p>
          This is a little app I made. This screen will soon have
          some info about the app, and eventually a little guided
          walkthrough of interacting with the tone wheel.
        </p>

      </glass-panel>
    `
  }
}

registerElement('about-view', AboutViewElement)
