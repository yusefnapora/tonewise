import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'

export class AboutViewElement extends LitElement {
  static styles = css`
    :host {
      max-width: min(600px, 85dvw);
    }

    a {
      color: var(--color-primary);
      text-decoration: none;
    }
    a:hover {
      color: color-mix(in lch, var(--color-primary), var(--color-text) 20%);
      text-decoration: underline;
    }

    p {
      margin: 16px;
    }

    .panel {
      margin-top: 64px;
      margin-bottom: 64px;
    }

    .heading {
      display: flex;
      align-items: center;
      font-size: 1.25rem;
    }

    .app-title {
      font-family: var(--app-title-font-family);
      letter-spacing: var(--app-title-letter-spacing);
    }

    wheel-icon {
      min-height: 32px;
      max-height: 64px;
      margin: 16px;
    }

    @media (max-width: 435px) {
      .app-title {
        display: none;
      }
    }
  `

  render() {
    return html`
      <glass-panel class="panel">
        <div class="heading">
          <wheel-icon active-notes="Ab,E"></wheel-icon>
          <h2>
            About
            <span class="app-title">Tonewise</span>
          </h2>
        </div>
         <p>
          Tonewise was made to play around with relationships
          between sound, color, and proportion.
        </p>
        <p>
          In the <app-link href="/free-play">free play</app-link> mode,
          you can play music on the <em>tone wheel</em>, a circle that
          covers one musical octave. Try pressing the scale icon next
          to the tone wheel to switch between different musical keys.
        </p>
        <p>
          The <app-link href="/play">quiz mode</app-link> helps you
          learn to identify the <em>intervals</em> between two notes.
        </p>
        <p>
          First, the app will play a reference note and highlight it on
          the wheel. Next, you'll hear a "hidden note," but it won't be
          highlighted. When you tap the hidden note on the wheel, you'll
          see the name of the interval between the two notes.
        </p>
        <p>
          This app is a passion project that I work on when I have
          the time and motivation. You can help with the motivation bit by
          <a href="mailto:contact@tonewise.app">sending me an email</a>,
          or check out <a href="https://yusef.napora.org">my website</a>
          for other ways to get in touch.
        </p>
      </glass-panel>
    `
  }
}

registerElement('about-view', AboutViewElement)
