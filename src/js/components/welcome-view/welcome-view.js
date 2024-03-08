import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'
import { cardStyleBase } from '../../styles.js'

const appName = `Training Wheels`
const welcomeText = `
Welcome to ${appName}, a game that helps you learn to recognize musical intervals.
`

export class WelcomeViewElement extends LitElement {
  static styles = css`
    :host {
      padding: 16px;
      max-width: min(500px, calc(100vw - 32px));
    }

    .app-title {
      font-size: 2.5rem;
      font-family: var(--heading-font-family);
    }

    .welcome-text {
      font-size: 1.5rem;
    }

    nav > ul {
      list-style: none;
      font-size: 2rem;
      font-family: var(--heading-font-family);
    }

    ${cardStyleBase}
  `

  render() {
    return html`
      <sl-card>
        <h1 class="app-title">${appName}</h1>
        <p class="welcome-text">${welcomeText}</p>
        <nav>
          <ul>
            <li><app-link href="play">Play</app-link></li>
            <li><app-link href="settings">Settings</app-link></li>
          </ul>
        </nav>
      </sl-card>
    `
  }
}

registerElement('welcome-view', WelcomeViewElement)
