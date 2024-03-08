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

      --bgcolor-lightness: 40%;
      --bgcolor-chroma: 0.075;
      background: conic-gradient(
          oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -0deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -30deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -60deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -90deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -120deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -150deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -180deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -210deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -240deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -270deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -300deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -330deg), oklch(var(--bgcolor-lightness, 60%) var(--bgcolor-chroma, 0.26) -0deg)
        );
    }

    game-view {
      min-width: 100vw;
      /* backdrop-filter: blur(50px); */
    }

    @media (prefers-color-scheme: light) {
      :host {
        --bgcolor-lightness: 60%;
        --bgcolor-chroma: 0.075;
      }
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
