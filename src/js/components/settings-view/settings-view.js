import { LitElement, css, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'

import { COLOR_SCALE_NAMES, asColorScaleName } from '../../common/color.js'
import { dispatch } from '../../state/store.js'
import { StateController } from '../../state/controller.js'
import {
  selectColorScale,
  selectColorTheme,
  selectEnharmonicPresentation,
  selectShowTouchHighlights,
  selectWheelNotes,
} from '../../state/selectors/selectors.js'
import {
  setColorScale,
  setEnharmonicPresentation,
  setSystemColorTheme,
  setShowTouchHighlights,
} from '../../state/slices/preferences-slice.js'
import { isLandscape, onOrientationChange } from '../../styles.js'
import { unregisterServiceWorker } from '../../worker-setup.js'

let awaitingForceRefresh = false

export class SettingsViewElement extends LitElement {
  static styles = css`
    :host {
      --glass-panel-padding: 20px;
      margin-top: calc(48px + (2 * var(--toolbar-padding)));

      width: 100%;
      max-width: min(90vw, 450px);
    }

    h1 {
      margin: 0;
    }

    glass-panel {
      width: 100%;
      /* min-width: 50vw; */
      min-height: 75vh;
    }

    .appearance {
      display: grid;
      place-content: center;

      width: 100%;
      grid-template-areas:
        'wheel'
        'controls';
    }

    .card-title {
      font-size: 2rem;
      font-family: var(--heading-font-family);

      display: flex;
      align-items: center;
      justify-content: center;
      /* margin-bottom: 2rem; */
    }

    .control {
      margin-top: 16px;
      margin-bottom: 16px;
      max-width: 450px;
    }

    .enharmonic {
      font-size: 1.5rem;
    }

    tone-wheel {
      min-height: 150px;
      max-height: 150px;
      height: 100%;
      width: 100%;
      margin: auto;

      grid-area: wheel;
    }

    .appearance-controls {
      grid-area: controls;
    }

    .debug-controls {
      display: flex;
      flex-direction: column;

      & > * {
        margin: 1rem 2ch;
      }
    }

    @media (orientation: landscape) and (max-height: 650px) {
      :host {
        margin-top: 0;
        max-width: min(90vw, calc(800px - 96px - var(--toolbar-padding)));
      }

      glass-panel {
        min-height: min(calc(100vh - 16px), 352px);
      }

      .appearance {
        grid-template-areas: 'wheel controls controls';
        grid-template-columns: 1fr 1fr 1fr;
      }
    }
  `

  #state = new StateController(this)

  constructor() {
    super()
    this.ariaLabel = 'Settings screen'
  }

  connectedCallback() {
    super.connectedCallback()
    onOrientationChange(() => this.requestUpdate(), '580px')
  }

  render() {
    const enharmonicPresentation = this.#state.select(
      selectEnharmonicPresentation,
    )
    const colorScale = this.#state.select(selectColorScale)
    const wheelNotes = this.#state.select(selectWheelNotes)
    const theme = this.#state.select(selectColorTheme)
    const showTouchHighlights = this.#state.select(selectShowTouchHighlights)

    const activeNotes = ['Ab', 'E']
    const pitchClasses = wheelNotes.map(
      ({ noteId, label }) => html`
        <pitch-class
          id=${noteId}
          active=${activeNotes.includes(noteId) ? true : nothing}>
          ${label}
        </pitch-class>
      `,
    )

    const colorOptions = Object.entries(COLOR_SCALE_NAMES).map(
      ([value, name]) => html` <sl-option value=${value}>${name}</sl-option> `,
    )

    /**
     * @param {CustomEvent} e
     */
    const colorChanged = (e) => {
      const newScale = asColorScaleName(e.target['value'])
      if (newScale) {
        dispatch(setColorScale(newScale))
      }
    }

    /** @param {CustomEvent} e */
    const enharmonicsChanged = (e) => {
      const val = e.target['value']
      if (val === 'sharp') {
        dispatch(setEnharmonicPresentation('sharp'))
      } else if (val === 'flat') {
        dispatch(setEnharmonicPresentation('flat'))
      }
    }

    /** @param {CustomEvent} e */
    const themeChanged = (e) => {
      const val = e.target['value']
      if (val === 'dark' || val === 'light' || val === 'auto') {
        dispatch(setSystemColorTheme(val))
      }
    }

    const forceRefresh = async () => {
      console.log('forcing service worker reload')
      awaitingForceRefresh = true
      this.requestUpdate()
      await unregisterServiceWorker()
      console.log('reloading page')
      awaitingForceRefresh = false
      window.location.reload()
    }

    const forceRefreshIcon = awaitingForceRefresh
      ? html`<sl-spinner slot="prefix"></sl-spinner>`
      : html`<sl-icon slot="prefix" name="arrow-clockwise"></sl-icon>`

    //@ts-expect-error
    this.renderRoot.querySelector('tone-wheel')?.requestUpdate()

    const tabPlacement = isLandscape('580px') ? 'start' : 'top'

    return html`
      <glass-panel>
        <h1 class="card-title">settings</h1>

        <sl-tab-group placement=${tabPlacement}>
          <sl-tab slot="nav" panel="appearance">Appearance</sl-tab>
          <sl-tab slot="nav" panel="debug">Debug</sl-tab>

          <sl-tab-panel
            name="appearance"
            role="group"
            aria-label="appearance settings">
            <div role="presentation" class="appearance">
              <tone-wheel non-interactive color-scale=${colorScale}>
                ${pitchClasses}
              </tone-wheel>

              <div class="appearance-controls" role="presentation">
                <div role="presentation" class="control">
                  <sl-radio-group
                    role="presentation"
                    label="Theme"
                    name="theme"
                    value="${theme}"
                    @sl-change=${themeChanged}>
                    <sl-radio-button value="dark">
                      <sl-icon name="moon" slot="prefix"></sl-icon>
                      Dark
                    </sl-radio-button>
                    <sl-radio-button value="light">
                      <sl-icon name="sun" slot="prefix"></sl-icon>
                      Light
                    </sl-radio-button>
                    <sl-radio-button value="auto">
                      <sl-icon name="brilliance" slot="prefix"></sl-icon>
                      Auto
                    </sl-radio-button>
                  </sl-radio-group>
                </div>
                <div role="presentation" class="control">
                  <sl-select
                    role="presentation"
                    label="Color palette"
                    value=${colorScale}
                    @sl-change=${colorChanged}>
                    ${colorOptions}
                  </sl-select>
                </div>

                <div role="presentation" class="control">
                  <sl-radio-group
                    role="presentation"
                    label="Display sharps or flats?"
                    name="enharmonics"
                    value="${enharmonicPresentation}"
                    @sl-change=${enharmonicsChanged}>
                    <sl-radio-button value="sharp"
                      ><span class="enharmonic" slot="prefix">♯</span
                      >Sharps</sl-radio-button
                    >
                    <sl-radio-button value="flat"
                      ><span class="enharmonic" slot="prefix">♭</span
                      >Flats</sl-radio-button
                    >
                  </sl-radio-group>
                </div>
              </div>
            </div>
          </sl-tab-panel>

          <sl-tab-panel
            name="debug"
            class="debug"
            role="group"
            aria-label="debug settings">
            <div role="presentation" class="debug-controls">
              <sl-button
                @click=${() => forceRefresh()}
                label="Refresh cache"
                role="presentation">
                ${forceRefreshIcon} Clear offline cache
              </sl-button>

              <sl-switch
                @sl-change=${(e) =>
                  dispatch(setShowTouchHighlights(e.target.checked))}
                value=${showTouchHighlights}
                label="Show pointer highlights?">
                Show pointer highlights?
              </sl-switch>
            </div>
          </sl-tab-panel>
        </sl-tab-group>
      </glass-panel>
    `
  }
}

registerElement('settings-view', SettingsViewElement)
