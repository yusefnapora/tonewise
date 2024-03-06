import { LitElement, html } from 'lit'
import { registerElement } from '../../common/dom.js'

export class WelcomeViewElement extends LitElement { 

  render() {
    return html`
      <h1 class="app-title">Training Wheels</h1>
      <p class="welcome-text">Welcome to Training Wheels, a game about musical intervals.</p>
      <nav>
        <ul>
          <li><a href="play" data-navigo>Play</a></li>
          <li><a href="settings" data-navigo>Settings</a></li>
        </ul>
      </nav>
    `
  }
}

registerElement('welcome-view', WelcomeViewElement)
