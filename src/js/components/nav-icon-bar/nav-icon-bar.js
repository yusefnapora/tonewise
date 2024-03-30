import { LitElement, html, css } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { registerElement } from '../../common/dom.js'
import { navigate, sharedRouter } from '../../route-controller.js'

export class NavIconBarElement extends LitElement {
  static styles = css`
    :host {
      position: relative;
      width: 100%;
      height: 0px;
      font-size: 36px;

      display: flex;
      justify-content: space-between;
    }

    .back-button {
      position: absolute;
      top: var(--toolbar-padding, 0px);
      left: var(--toolbar-padding, 0px);
    }

    .settings-button {
      position: absolute;
      top: var(--toolbar-padding, 0px);
      right: var(--toolbar-padding, 0px);
    }

    .hidden {
      visibility: hidden;
    }
  `

  constructor() {
    super()
    this.role = 'navigation'
    this.ariaLabel = 'app navigation'
  }

  render() {
    const currentRoute = sharedRouter.getCurrentLocation().route.name

    // todo: pull into helper fn
    const isHomeRoute = ['', '/', '/index.html', 'src'].includes(currentRoute)
    const showBack = !isHomeRoute
    const showSettings = currentRoute !== 'settings'

    const goBack = () => {
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
    }

    const backClasses = { 'back-button': true, hidden: !showBack }
    const backButton = html`
      <sl-icon-button
        class=${classMap(backClasses)}
        name="arrow-left-circle"
        role="presentation"
        label="Go back"
        @click=${goBack}>
      </sl-icon-button>
    `

    const settingsClasses = { 'settings-button': true, hidden: !showSettings }
    const settingsButton = html`
      <sl-icon-button
        class=${classMap(settingsClasses)}
        name="gear-wide"
        role="presentation"
        label="settings"
        @click=${() => navigate('/settings')}></sl-icon-button>
    `

    return html` ${backButton} ${settingsButton} `
  }
}

registerElement('nav-icon-bar', NavIconBarElement)
