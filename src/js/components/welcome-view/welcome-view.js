import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'
import { cardStyleBase } from '../../styles.js'
import { resumeAudio } from '../../state/slices/audio-slice.js'

const appName = `Training Wheels`
const welcomeText = `
A game for learning musical intervals
`

export class WelcomeViewElement extends LitElement {
  static styles = css`
    :host {
      padding: 16px;
      max-width: min(600px, calc(100vw - 32px));
    }

    .content {
      display: grid;

      grid-template-columns: 1fr;
    }

    .content glass-panel {
      padding: 20px;
    }

    .app-title {
      font-size: 2.25rem;
      font-family: var(--heading-font-family);
      grid-column: 1;
    }

    .welcome-text {
      font-size: 1.5rem;
      grid-column: 1;
      color: var(--color-text-muted);
    }

    nav {
      grid-column: 1;
    }

    @media (orientation: landscape) {
      /* :host {
        max-width: min(800px, calc(100vw - 64px));
      } */

      .content {
        grid-template-rows: 4rem 1fr;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      nav {
        grid-column: 2;
        grid-row-start: 1;
        grid-row-end: 2;
      }
    }

    nav > ul {
      list-style: none;
      font-size: 2rem;
      font-family: var(--heading-font-family);
      line-height: 4rem;
    }

    ${cardStyleBase}
  `

  render() {
    return html`
        <div class="content">
          <glass-panel>
          <h1 class="app-title">${appName}</h1>
          <p class="welcome-text">${welcomeText}</p>
          <nav>
            <ul>
              <li>
                <app-link @click=${() => resumeAudio()} href="play"
                  >Play</app-link
                >
              </li>
              <li><app-link href="settings">Settings</app-link></li>
            </ul>
          </nav>
          </glass-panel>
        </div>
    `
  }
}

registerElement('welcome-view', WelcomeViewElement)
