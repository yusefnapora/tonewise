import { LitElement, css, html } from 'lit'
import { loadSampler } from '../state/slices/audio-slice.js'
import { dispatch } from '../state/store.js'
import { RouteController } from '../route-controller.js'


export class AppViewElement extends LitElement {
  static styles = css`
    :host {
      max-width: 100vw;
      width: 100%;
      min-height: 100vh;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
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
