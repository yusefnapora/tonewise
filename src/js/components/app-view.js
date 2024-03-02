import { ContextProvider } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { Sampler } from '../audio/sampler.js';
import { SoundContext } from '../context/sound-context.js';

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

  #soundProvider = new ContextProvider(this, { 
    context: SoundContext,
    initialValue: new Sampler()
  })

  render() {
    return html`<game-view></game-view>`
  }
}
customElements.define('app-view', AppViewElement)
