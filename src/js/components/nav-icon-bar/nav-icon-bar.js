import { LitElement, html, css } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { registerElement } from '../../common/dom.js'
import { navigate, sharedRouter } from '../../route-controller.js'

export class NavIconBarElement extends LitElement {
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

    .hidden {
      visibility: hidden;
    }
  `

  render() {
    const currentRoute = sharedRouter.getCurrentLocation().route.name 

    // todo: pull into helper fn
    const isHomeRoute = ['', '/', '/index.html', 'src'].includes(currentRoute)
    const showBack = !isHomeRoute
    const showSettings = currentRoute !== 'settings'
    console.log({
      showSettings,
      showBack,
      currentRoute: sharedRouter.getCurrentLocation().route.name,
    })

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

    const backClasses = { hidden: !showBack }
    const backButton = html`
      <sl-icon-button
        class=${classMap(backClasses)}
        name="arrow-left-circle"
        label="Go back"
        @click=${goBack}>
      </sl-icon-button>
    `

    const settingsClasses = { hidden: !showSettings }
    const settingsButton = html`
      <sl-icon-button
        class=${classMap(settingsClasses)}
        name="gear-wide"
        label="settings"
        @click=${() => navigate('/settings')}></sl-icon-button>
    `

    return html`
      <div class="buttons">
        ${backButton} ${settingsButton}
      </div>
    `
  }
}

registerElement('nav-icon-bar', NavIconBarElement)
