import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { navigate } from '../../route-controller.js'


export class WelcomeViewElement extends LitElement { 

  static styles = css`
    :host {
      min-width: min(400px, 80vw, 80dvw);
      background-color: var(--color-muted);
    }
  `

  render() {
    return html`
      <h1 class="app-title">Training Wheels</h1>
      <p class="welcome-text">Welcome to Training Wheels, a game about musical intervals.</p>
      <nav>
        <ul>
          <li><sl-button @click=${() => navigate('play')}>Play</sl-button></li>
          <li><sl-button @click=${() => navigate('settings')}>Settings</sl-button></li>
        </ul>
      </nav>
    `
  }
}

registerElement('welcome-view', WelcomeViewElement)
