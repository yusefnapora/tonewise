import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'
import { landscapeMediaQuery } from '../../styles.js'
import { navigate } from '../../route-controller.js'

const appName = `Tonewise`

export class WelcomeViewElement extends LitElement {
  static styles = css`
    :host {
      /* padding: 16px; */
      max-width: min(600px, calc(100vw - 32px));
    }

    .content {
      display: grid;

      grid-template-areas:
        'logo'
        'nav';
      grid-template-columns: min(300px, calc(100vw - 32px));
    }

    wheel-icon {
      min-height: min(25dvh, 40dvw);
      max-height: 35dvh;
    }

    glass-panel {
      --glass-panel-padding: 20px;
    }

    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      grid-area: logo;
    }

    .app-title {
      font-size: 2.25rem;
      font-family: var(--app-title-font-family);
      letter-spacing: var(--app-title-letter-spacing);
      grid-column: 1;
      place-self: center;
      text-align: center;
    }

    .welcome-text {
      font-size: 1.5rem;
      grid-column: 1;
      color: var(--color-text-muted);
      grid-area: welcome;
    }

    nav sl-button::part(label),
    sl-button::part(prefix) {
      font-size: 1.4rem;
      font-family: var(--heading-font-family);
    }

    nav > ul {
      list-style: none;
      font-size: 1.4rem;
      font-family: var(--heading-font-family);
      line-height: 3rem;
    }

    nav {
      grid-area: nav;
    }

    ${landscapeMediaQuery} {
      wheel-icon {
        min-height: min(25dvh, 25dvw);
        max-height: max(30dvh, 30dvw);
      }

      .content {
        grid-template-columns: 1fr 1fr;
        grid-template-areas: 'logo nav';
      }

      .app-title {
        font-size: 1.75rem;
      }

      nav {
        grid-area: nav;
      }
    }
  `

  constructor() {
    super()
    this.ariaLabel = 'Welcome screen'
  }

  render() {
    return html`
      <glass-panel>
        <wrapper-div class="content">
          <wrapper-div class="logo">
            <wheel-icon aria-hidden="true" active-notes="Ab,E"></wheel-icon>
            <h1 class="app-title">${appName}</h1>
          </wrapper-div>
          <nav aria-label="Main menu">
            <ul role="presentation">
              <li role="presentation">
                <sl-button
                  role="presentation"
                  variant="text"
                  @click=${() => navigate('/free-play')}
                  >
                    <sl-icon slot="prefix" name="hypnotize"></sl-icon>
                    Free play
                </sl-button>
              </li>
              <li role="presentation">
                <sl-button
                  role="presentation"
                  variant="text"
                  @click=${() => navigate('/play')}>
                  <sl-icon slot="prefix" name="music-note-list"></sl-icon>
                  Quiz mode
                </sl-button>
              </li>
              <li role="presentation">
                <sl-button
                  role="presentation"
                  variant="text"
                  @click=${() => navigate('/about')}>
                    <sl-icon slot="prefix" name="question-lg"></sl-icon>
                    About
                </sl-button>
                </a>
              </li>
            </ul>
          </nav>
        </wrapper-div>
      </glass-panel>
    `
  }
}

registerElement('welcome-view', WelcomeViewElement)
