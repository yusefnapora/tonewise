// @ts-check

import { LitElement, html, css } from 'lit'
import { ContextProvider } from '@lit/context'
import { SoundContext } from '../context/sound-context.js'
import { Sampler } from '../audio/sampler.js';

export class AppViewElement extends LitElement {
  static styles = css`
    tone-wheel {
      max-width: 50vw;
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
