import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'


export class WelcomeViewElement extends LitElement { 

  static styles = css`
    :host {
      margin: 16px;
      padding: 48px;
      border-radius: 10px;
      /* min-width: min(350px, 80vw, 80dvw); */

      background: rgba(49, 35, 35, 0.21);
      border-radius: 16px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(5.1px);
      -webkit-backdrop-filter: blur(5.1px);
      border: 1px solid rgba(49, 35, 35, 0.23);
    }

    @media (prefers-color-scheme: light) {
      :host {
        background: rgba(255, 255, 255, 0.51);
        border: 1px solid rgba(255, 255, 255, 0.23);
      }
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
