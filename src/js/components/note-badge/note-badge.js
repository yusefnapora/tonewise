import { LitElement, css, html, svg } from 'lit'
import { colorForAngle } from '../../common/color.js'
import { registerElement } from '../../common/dom.js'
import {
  calculateSegmentAngles,
  rimSegmentSVGPath,
} from '../../common/geometry.js'
import { StateController } from '../../state/controller.js'
import {
  selectColorScale,
  selectNoteAngle,
  selectTuningNoteIds,
} from '../../state/selectors/selectors.js'

export class NoteBadgeElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--note-font-family);
      letter-spacing: var(--note-letter-spacing);
    }

    .background {
      fill: var(--color-background);
      opacity: 0.5;
    }

    .badge-rim-segment {
      stroke: var(--color-text-muted);
      fill: var(--color-text-muted);
    }

    .highlighted {
      stroke: var(--color-text);
      fill: var(--color-text);
    }

    .revealed {
      transition: opacity 0.2s ease-in-out;
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
    colorScale: { type: String, attribute: 'color-scale' },
    label: { type: String },
  }

  #stateController = new StateController(this)

  constructor() {
    super()
    this.rotationOffset = -90
    this.noteId = undefined
    this.reveal = false
    this.highlight = false
    this.label = undefined
  }

  render() {
    return html` <svg viewBox="0 0 1000 1000">${this.#svgContent()}</svg> `
  }

  #svgContent() {
    const noteIds = this.#stateController.select(selectTuningNoteIds)
    const colorScale = this.#stateController.select(selectColorScale)

    /** @type {Array<{id: string, angle: number}>} */
    const notes = []
    for (const id of noteIds) {
      const angle = this.#stateController.select(selectNoteAngle, id)
      notes.push({ id, angle })
    }

    let activeNote =
      this.noteId == null ? null : notes.find((n) => n.id === this.noteId)

    const gapDegrees = 10

    const backgroundCircle = this.reveal
      ? svg`
      <circle class="background" r="360" cx="500" cy="500" />
    `
      : undefined

    const content = [backgroundCircle]
    const colors = []
    const segmentStyles = []
    const elements = calculateSegmentAngles(notes, {
      gapDegrees,
    })

    for (let i = 0; i < elements.length; i++) {
      const note = elements[i].input
      const { startAngle, endAngle } = elements[i]

      const className = `badge-segment-${i}`
      let fullClass = className
      if (this.highlight) {
        fullClass += ' highlighted'
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

      const color = colorForAngle(note.angle, colorScale)
      colors.push(color)
      segmentStyles.push(`
        .${className}.active-note {
          stroke: ${color};
          fill: ${color};
        }
      `)
    }
    let activeNoteColor = 'var(--color-text)'
    if (activeNote && colorScale.startsWith('oklch')) {
      activeNoteColor = colorForAngle(activeNote.angle, colorScale)
    }
    const label = this.label ?? activeNote?.id

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
