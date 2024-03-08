import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { navigate } from '../../route-controller.js'


export class WelcomeViewElement extends LitElement { 

  static styles = css`
    :host {
      padding: 4rem;
      border-radius: 10px;
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
          <li><app-link href="play">Play</app-link></li>
          <li><app-link href="settings">Settings</app-link></li>
        </ul>
      </nav>
    `
  }
}

registerElement('welcome-view', WelcomeViewElement)
