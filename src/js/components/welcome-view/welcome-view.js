import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'
import { cardStyleBase, landscapeMediaQuery } from '../../styles.js'
import { resumeAudio } from '../../state/slices/audio-slice.js'
import { dispatch } from '../../state/store.js'
import { endGame } from '../../state/sequences/game-sequences.js'

const appName = `Training Wheels`
const welcomeText = `
A game for learning musical intervals
`

export class WelcomeViewElement extends LitElement {
  static styles = css`
    :host {
      /* padding: 16px; */
      max-width: min(600px, calc(100vw - 32px));
    }

    .content {
      display: grid;

      grid-template-columns: 1fr;
    }

    wheel-icon {
      min-height: min(25dvh, 25dvw);
      max-height: 25dvh;
    }

    glass-panel {
      --glass-panel-padding: 20px;
    }

    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }

    .app-title {
      font-size: 2.25rem;
      font-family: var(--heading-font-family);
      grid-column: 1;
      place-self: center;
      text-align: center;
    }

    .welcome-text {
      font-size: 1.5rem;
      grid-column: 1;
      color: var(--color-text-muted);
    }

    nav {
      grid-column: 1;
    }

    ${landscapeMediaQuery} {
      wheel-icon {
        min-height: min(15dvh, 15dvw);
        max-height: 30dvh;
      }

      .content {
        grid-template-columns: 1fr 2fr;
        grid-template-areas:
         'logo welcome'
         'logo nav'
         ;
      }

      .app-title {
        font-size: 1.75rem;
      }

      .logo {
        grid-area: logo;
      }

      .welcome-text {
        grid-area: welcome;
      }

      nav {
        grid-area: nav;
      }
    }

    nav > ul {
      list-style: none;
      font-size: 2rem;
      font-family: var(--heading-font-family);
      line-height: 4rem;
    }
  `

  render() {
    const playClicked = () => {
      resumeAudio()
      endGame(dispatch)
    }

    return html`
      <glass-panel>
        <div class="content">
          <div class="logo">
            <wheel-icon active-notes="G♯,E"></wheel-icon>
            <h1 class="app-title">${appName}</h1>
          </div>
          <p class="welcome-text">${welcomeText}</p>
          <nav>
            <ul>
              <li>
                <app-link @click=${playClicked} href="play"
                  >Play</app-link
                >
              </li>
              <li><app-link href="settings">Settings</app-link></li>
            </ul>
          </nav>
        </div>
      </glass-panel>
    `
  }
}

registerElement('welcome-view', WelcomeViewElement)
