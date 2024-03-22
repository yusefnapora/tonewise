import { LitElement, html, css, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'
import { selectWheelNotes } from '../../state/selectors/selectors.js'
import { store } from '../../state/store.js'

export class WheelIconElement extends LitElement {

  static properties = {
    activeNotes: { type: String, attribute: 'active-notes' }
  }

  static styles = css`
    :host {
      height: 100%;
      aspect-ratio: 1;
    }
  `

  constructor() {
    super()
    this.activeNotes = ''
  }

  render() {
    const state = store.getState()
    const wheelNotes = selectWheelNotes(state)

    const activeNoteIds = this.activeNotes.split(',')

    const pitchClasses = wheelNotes.map(
      ({ noteId, label }) => { 
        const active = activeNoteIds.includes(noteId)
        return html`<pitch-class id=${noteId} active=${active || nothing}> ${label} </pitch-class>`
      }
    )

    return html`
      <tone-wheel hide-labels>
        ${pitchClasses}
      </tone-wheel>
    `
  }
}

registerElement('wheel-icon', WheelIconElement)
