import { LitElement, css, html } from 'lit'
import { RouteController } from '../../route-controller.js'
import { loadSampler } from '../../state/slices/audio-slice.js'
import { dispatch } from '../../state/store.js'
import { setupSplashScreenImages } from '../../splash-screen.js'

export class AppViewElement extends LitElement {
  static styles = css`
    :host {
      max-width: 100vw;
      width: 100%;
      height: 100%;
      min-height: min(100vh, 100dvh);

      display: grid;
      place-items: center;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
    }

    :host > * {
      grid-row: 1;
      grid-column: 1;
    }

    app-background {
      z-index: 0;
    }

    .toolbar {
      position: absolute;
      z-index: 3;
      top: 0;
      left: 0;
      width: 100%;
      /* min-height: calc(48px + var(--toolbar-padding)); */
    }

    .content {
      max-width: calc(
        100vw - env(safe-area-inset-left) - env(safe-area-inset-right)
      );
      min-height: calc(
        min(100vh, 100dvh) - env(safe-area-inset-top) - env(
            safe-area-inset-bottom
          )
      );
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;

      margin-top: env(safe-area-inset-top);
      margin-bottom: env(safe-area-inset-bottom);
      margin-left: env(safe-area-inset-left);
      margin-right: env(safe-area-inset-right);
    }
  `

  #routeController = new RouteController(this)

  connectedCallback() {
    super.connectedCallback()
    dispatch(loadSampler())
    setupSplashScreenImages()
  }

  render() {
    // @ts-expect-error todo: make the icon bar update itself on route changes
    this.renderRoot.querySelector('nav-icon-bar')?.requestUpdate()

    return html`
      <app-background></app-background>
      <div class="toolbar">
        <nav-icon-bar></nav-icon-bar>
      </div>
      <div class="content">${this.#routeController.content}</div>
    `
  }
}
customElements.define('app-view', AppViewElement)
