import { LitElement, css, html } from 'lit';
import { dispatch } from '../state/store.js'
import { loadSampler } from '../state/slices/audio-slice.js';

export class AppViewElement extends LitElement {
  static styles = css`
    :host {
      max-width: 100vw;
      width: 100%;
      max-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center; 
    }
    game-view {
      max-width: 100vw;
      width: 100%;
      min-height: 100vh;
      margin: auto;
    }
  `;

  connectedCallback() {
    super.connectedCallback()
    // todo: show welcome screen before game view
    dispatch(loadSampler())
  }

  render() {
    return html`<game-view></game-view>`
  }
}
customElements.define('app-view', AppViewElement)
