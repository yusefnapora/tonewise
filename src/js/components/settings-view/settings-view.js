import { LitElement, css, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'

import { COLOR_SCALE_NAMES, asColorScaleName } from '../../common/color.js'
import { dispatch } from '../../state/store.js'
import { StateController } from '../../state/controller.js'
import {
  selectColorScale,
  selectColorTheme,
  selectEnharmonicPresentation,
  selectWheelNotes,
} from '../../state/selectors/selectors.js'
import {
  setColorScale,
  setEnharmonicPresentation,
  setSystemColorTheme,
} from '../../state/slices/preferences-slice.js'
import { landscapeMediaQuery } from '../../styles.js'

export class SettingsViewElement extends LitElement {
  static styles = css`
    :host {
      --glass-panel-padding: 20px;
      margin-top: calc(48px + (2 * var(--toolbar-padding)));
    }

    nav-icon-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }

    .appearance {
      display: grid;

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
      margin-bottom: 2rem;
    }

    .control {
      margin-top: 16px;
      margin-bottom: 16px;
    }

    .enharmonic {
      font-size: 1.5rem;
    }

    tone-wheel {
      min-height: 150px;
      max-height: 150px;
      margin: auto;

      grid-area: 'wheel';
    }

    .appearance-controls {
      grid-area: 'controls';
    }

    ${landscapeMediaQuery} {
      .appearance {
        grid-template-areas: 'wheel controls';
        column-gap: 40px;
      }
    }
  `

  #state = new StateController(this)

  render() {
    const enharmonicPresentation = this.#state.select(
      selectEnharmonicPresentation,
    )
    const colorScale = this.#state.select(selectColorScale)
    const wheelNotes = this.#state.select(selectWheelNotes)
    const theme = this.#state.select(selectColorTheme)

    const activeNotes = ['G♯','E']
    const pitchClasses = wheelNotes.map(
      ({ noteId, label }) => html`
        <pitch-class id=${noteId} active=${activeNotes.includes(noteId) ? true : nothing}> 
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

    //@ts-expect-error
    this.renderRoot.querySelector('tone-wheel')?.requestUpdate()

    return html`
      <nav-icon-bar></nav-icon-bar>
      <glass-panel>
        <div class="card-title">settings</div>

        <div class="appearance">
          <tone-wheel color-scale=${colorScale}> ${pitchClasses} </tone-wheel>

          <div class="appearance-controls">
            <div class="control">
              <sl-radio-group
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
            <div class="control">
              <sl-select
                label="Color palette"
                value=${colorScale}
                @sl-change=${colorChanged}>
                ${colorOptions}
              </sl-select>
            </div>

            <div class="control">
              <sl-radio-group
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
      </glass-panel>
    `
  }
}

registerElement('settings-view', SettingsViewElement)
