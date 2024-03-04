import { LitElement, css, html, svg } from 'lit'
import { colorForAngle } from '../../common/color.js'
import { registerElement } from '../../common/dom.js'
import { degreesBetween, rimSegmentSVGPath } from '../../common/geometry.js'

// TODO: make tuning a part of redux state
const DEFAULT_TUNING = {
  pitchClases: [
    { id: 'C', angle: 0 },
    { id: 'C♯', angle: 30 },
    { id: 'D', angle: 60 },
    { id: 'D♯', angle: 90 },
    { id: 'E', angle: 120 },
    { id: 'F', angle: 150 },
    { id: 'F♯', angle: 180 },
    { id: 'G', angle: 210 },
    { id: 'G♯', angle: 240 },
    { id: 'A', angle: 270 },
    { id: 'A♯', angle: 300 },
    { id: 'B', angle: 330 },
  ]
}

export class NoteBadgeElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `

  static properties = {
    activeNoteId: { type: String, attribute: 'active-note' }
  }

  constructor() {
    super()
    this.tuning = DEFAULT_TUNING
    this.rotationOffset = 90
    this.activeNoteId = undefined
  }

  render() {
    return html`
      <svg viewBox="0 0 1000 1000">
        ${this.#svgContent()}
      </svg>
    `
  }

  #svgContent() {
    let activeNote = this.activeNoteId == null
      ? null
      : this.tuning.pitchClases.find(n => n.id === this.activeNoteId)

    const gapDegrees = 10

    const content = []
    const colors = []
    const elements = this.tuning.pitchClases
    for (let i = 0; i < elements.length; i++) {
      const note = elements[i]
      colors[i] = colorForAngle(note.angle)

      const nextIndex = i === elements.length - 1 ? 0 : i + 1
      const prevIndex = i === 0 ? elements.length - 1 : i - 1

      const intervalAngle = elements[i].angle
      const prevIntervalAngle = elements[prevIndex].angle
      const nextIntervalAngle = elements[nextIndex].angle

      let startAngle =
        intervalAngle - (degreesBetween(prevIntervalAngle, intervalAngle) / 2)
      let endAngle =
        intervalAngle + (degreesBetween(intervalAngle, nextIntervalAngle) / 2) 
  
      startAngle += gapDegrees / 2
      endAngle -= gapDegrees / 2

      const segment = this.#createRimSegment({
        className: `badge-note-${i}`,
        startAngle,
        endAngle
      })
      content.push(segment)
    }

    const color = activeNote ? colorForAngle(activeNote.angle) : null
    const label = activeNote?.id

    return svg`
      <g>${content}</g>
    `
  }

  /**
   * 
   * @param {object} args
   * @param {string} args.className
   * @param {number} args.startAngle
   * @param {number} args.endAngle
   */
  #createRimSegment(args) {
    const center = { x: 500, y: 500 }
    const radius = 500
    const thickness = 140


    const startAngle = args.startAngle + this.rotationOffset
    const endAngle = args.endAngle + this.rotationOffset
    const pathString = rimSegmentSVGPath({
      center,
      radius,
      startAngle,
      endAngle,
      thickness,
    })
    const className = args.className + ' badge-rim-segment'
    return svg`
      <path class=${className} d=${pathString} fill="white" />
    `
  }
}

registerElement('note-badge', NoteBadgeElement)
