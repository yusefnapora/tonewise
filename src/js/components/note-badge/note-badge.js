import { LitElement, css, html, svg } from 'lit'
import { colorForAngle } from '../../common/color.js'
import { registerElement } from '../../common/dom.js'
import {
  calculateSegmentAngles,
  degreesBetween,
  rimSegmentSVGPath,
} from '../../common/geometry.js'

// TODO: make tuning a part of redux state
const DEFAULT_TUNING = {
  pitchClasses: [
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
  ],
}

export class NoteBadgeElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .background {
      fill: var(--color-background);
      opacity: 0.5;
    }

    .badge-rim-segment {
      stroke: var(--color-text-muted);
      fill: var(--color-text-muted);
    }

    .badge-rim-segment.highlighted {
      stroke: var(--color-text);
      fill: var(--color-text);
    }

    .revealed {
      opacity: 1;
    }
    .hidden {
      opacity: 0;
    }
  `

  static properties = {
    noteId: { type: String, attribute: 'note-id' },
    reveal: { type: Boolean },
    highlight: { type: Boolean },
  }

  constructor() {
    super()
    this.tuning = DEFAULT_TUNING
    this.rotationOffset = -90
    this.noteId = undefined
    this.reveal = false
    this.highlight = false
  }

  render() {
    return html` <svg viewBox="0 0 1000 1000">${this.#svgContent()}</svg> `
  }

  #svgContent() {
    let activeNote =
      this.noteId == null
        ? null
        : this.tuning.pitchClasses.find((n) => n.id === this.noteId)

    const gapDegrees = 10

    const backgroundCircle = this.reveal
      ? svg`
      <circle class="background" r="360" cx="500" cy="500" />
    `
      : undefined

    const content = [backgroundCircle]
    const colors = []
    const segmentStyles = []
    const elements = calculateSegmentAngles(this.tuning.pitchClasses, {
      gapDegrees,
    })

    for (let i = 0; i < elements.length; i++) {
      const note = elements[i].input
      const { startAngle, endAngle } = elements[i]
      colors[i] = colorForAngle(note.angle)

      const className = `badge-segment-${i}`
      let fullClass = className
      if (this.highlight) {
        fullClass += ' highlight'
      }
      if (this.reveal && note.id === this.noteId) {
        fullClass += ' active-note'
      }

      const segment = this.#createRimSegment({
        className: fullClass,
        startAngle,
        endAngle,
      })
      content.push(segment)

      const color = colorForAngle(note.angle)
      segmentStyles.push(`
        .${className}.active-note {
          stroke: ${color};
          fill: ${color};
        }
      `)
    }

    const activeNoteColor = activeNote ? colorForAngle(activeNote.angle) : null
    const label = activeNote?.id

    const fontSize = 400
    const yOffset = fontSize * 0.25
    const transform = `translate(0 ${yOffset})`
    const labelClass = 'note-label ' + (this.reveal ? 'revealed' : 'hidden')
    const labelText = svg`
      <text
        class=${labelClass}
        x="500"
        y="500"
        text-anchor="middle"
        font-size=${fontSize}
        transform=${transform}
      >
        ${label}
      </text>
    `
    content.push(labelText)
    const labelStyle = `
      text.note-label {
        stroke: ${activeNoteColor};
        fill: ${activeNoteColor};
      }
    `
    return svg`
      <style>
        ${segmentStyles.join('\n')}
        ${labelStyle}
      </style>
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
      <path class=${className} d=${pathString} />
    `
  }
}

registerElement('note-badge', NoteBadgeElement)
