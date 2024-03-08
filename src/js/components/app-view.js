import { LitElement, css } from 'lit'
import { RouteController } from '../route-controller.js'
import { loadSampler } from '../state/slices/audio-slice.js'
import { dispatch } from '../state/store.js'


export class AppViewElement extends LitElement {
  static styles = css`
    :host {
      max-width: 100vw;
      width: 100%;
      min-height: min(100vh, 100dvh);
      max-height: min(100vh, 100dvh);

      display: grid;
      place-items: center;


    }

    game-view {
      min-width: 100vw;
      /* backdrop-filter: blur(50px); */
    }
  `

  #routeController = new RouteController(this)

  connectedCallback() {
    super.connectedCallback()
    dispatch(loadSampler())
  }

  render() {
    return this.#routeController.content
  }
}
customElements.define('app-view', AppViewElement)
