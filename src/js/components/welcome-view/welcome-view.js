import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'
import { cardStyleBase, landscapeMediaQuery } from '../../styles.js'
import { resumeAudio } from '../../state/slices/audio-slice.js'
import { dispatch } from '../../state/store.js'
import { endGame } from '../../state/sequences/game-sequences.js'
import { setGameMode } from '../../state/slices/game-slice.js'

const appName = `Tonewise`
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

    .nav-link {
      display: flex;
      align-items: center;

      & > sl-icon {
        margin-right: 20px;
      }
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

  render() {
    /** @param {import('../../state/slices/types.js').GameMode} gameMode */
    const playClicked = (gameMode) => {
      resumeAudio()
      // endGame(dispatch)
      // dispatch(setGameMode(gameMode))
    }

    return html`
      <glass-panel>
        <div class="content">
          <div class="logo">
            <wheel-icon active-notes="Ab,E"></wheel-icon>
            <h1 class="app-title">${appName}</h1>
          </div>
          <!-- <p class="welcome-text">${welcomeText}</p> -->
          <nav>
            <ul>
              <li>
                <app-link
                  @click=${() => playClicked('free-play')}
                  href="/free-play">
                  <div class="nav-link">
                    <sl-icon name="hypnotize"></sl-icon>
                    Free play
                  </div>
                </app-link>
              </li>
              <li>
                <app-link @click=${() => playClicked('challenge')} href="play">
                  <div class="nav-link">
                    <sl-icon name="music-note-list"></sl-icon>
                    Quiz mode
                  </div>
                </app-link>
              </li>
              <li>
                <app-link href="about">
                  <div class="nav-link">
                    <sl-icon name="question-lg"></sl-icon>
                    About
                  </div>
                </app-link>
              </li>
            </ul>
          </nav>
        </div>
      </glass-panel>
    `
  }
}

registerElement('welcome-view', WelcomeViewElement)
