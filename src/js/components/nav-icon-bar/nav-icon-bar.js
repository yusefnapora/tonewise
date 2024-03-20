import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { navigate, sharedRouter } from '../../route-controller.js'

export class NavIconBarElement extends LitElement {
  static properties = {
    backRoute: { type: String, attribute: 'back-route' }
  }

  constructor() {
    super()
    this.backRoute = undefined
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: space-between;

      width: 100%;
      height: 100%;
    }

    .buttons {
      font-size: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--toolbar-padding);
    }
    .message {
      width: 100%;
      text-align: center;
      font-size: 1.6rem;
    }
  `

  render() {
    const backButton = html`
      <sl-icon-button
        name="arrow-left-circle"
        label="Go back"
        @click=${() => {
          if (typeof this.backRoute === 'string') {
            navigate(this.backRoute)
            return
          }
          const { history } = window
          // Length of two means we're the first page on the stack
          // after the "new tab" page, which means if we're "deep"
          // into the app, we got there by direct linking (bookmark, etc).
          // In that case, we probably don't have anywhere to go back to,
          // and we should just pop to the '/' route.
          if (history.length <= 2) {
            navigate('/')
            return
          }
          history.back()
        }}>
      </sl-icon-button>
    `

    const settingsButton = html`
      <sl-icon-button
        name="gear-wide"
        label="settings"
        @click=${() => navigate('/settings')}></sl-icon-button>
    `

    const showSettings =
      sharedRouter.getCurrentLocation().route.name !== 'settings'
    console.log({
      showSettings,
      currentRouteName: sharedRouter.getCurrentLocation().route.name,
    })

    return html`
      <div class="buttons">
        ${backButton} ${showSettings ? settingsButton : undefined}
      </div>
    `
  }
}

registerElement('nav-icon-bar', NavIconBarElement)
