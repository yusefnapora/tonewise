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

export class ScaleBadgeElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--note-font-family);
      letter-spacing: var(--note-letter-spacing);
      user-select: none;
      -webkit-user-select: none;
    }

    .background {
      fill: var(--color-glass-background);
      /* opacity: 0.75; */
    }

    .badge-rim-segment {
      stroke-width: 10;
      stroke: var(--color-text);
      fill: var(--color-text-muted);
    }

    .badge-rim-segment:not(.active-note) {
      stroke: var(--color-text-muted);
      fill: var(--color-text-muted);
      opacity: 0.5;
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

    .quality-label {
      font-family: var(--text-font-family);
      color: var(--color-text);
      stroke: var(--color-text-muted);
      fill: var(--color-text);
      letter-spacing: 0.3ch;
    }
  `

  static properties = {
    noteIds: { type: Array, attribute: 'note-ids' },
    highlight: { type: Boolean },
    colorScale: { type: String, attribute: 'color-scale' },
    tonic: { type: String },
    label: { type: String },
  }

  #state = new StateController(this)

  constructor() {
    super()
    this.rotationOffset = -90
    this.tonic = ''
    this.noteIds = []
    this.highlight = false
    this.label = undefined
  }

  render() {
    return html` <svg viewBox="0 0 1000 1000">${this.#svgContent()}</svg> `
  }

  #svgContent() {
    const noteIds = this.#state.select(selectTuningNoteIds)
    const colorScale = this.#state.select(selectColorScale)

    /** @type {Array<{id: string, angle: number}>} */
    const notes = []
    for (const id of noteIds) {
      const angle = this.#state.select(selectNoteAngle, id)
      notes.push({ id, angle })
    }


    const gapDegrees = 10
    const cx = 500
    const cy = 500
    const radius = 300
    const backgroundRadius = radius * 0.6
    const thickness = radius - backgroundRadius

    const content = []
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
      if (this.noteIds.includes(note.id)) {
        fullClass += ' active-note'
      }

      const segment = this.#createRimSegment({
        className: fullClass,
        radius,
        thickness,
        startAngle,
        endAngle,
      })
      content.push(segment)

      const color = colorForAngle(note.angle, colorScale)
      colors.push(color)
      segmentStyles.push(`
        .${className}.active-note {
          fill: ${color};
        }
      `)
    }
    let activeNoteColor = 'var(--color-text)'
    // if (activeNote && colorScale.startsWith('oklch')) {
    //   activeNoteColor = colorForAngle(activeNote.angle, colorScale)
    // }


    const backgroundCircle = svg`
    <circle class="background" r=${backgroundRadius} cx=${cx} cy=${cy} />
    `

    let r = 460
    const bottomTextArc = `
      M ${cx-r},${cy}
      a ${r},${r} 0 1,0 ${r*2},0
      `

    r = radius + 60
    const topTextArc = `
      M ${cx-r},${cy}
      a ${r},${r} 0 1,1 ${r*2},0
    `

    const arcDef = svg`
    <defs>
      <path id="text-arc" d=${bottomTextArc} />
      <path id="text-arc-top" d=${topTextArc} />
    </defs>
    `

    content.push(arcDef)
    content.push(backgroundCircle)

    let label = this.label ?? ''

    const fontSize = 220
    const yOffset = fontSize * 0.25
    const transform = `translate(0 ${yOffset})`

    const tonicLabelText = svg`
      <text
        class="note-label"
        x=${cx}
        y=${cy}
        font-size=${fontSize}
        text-anchor="middle"
        transform=${transform}>
        ${this.tonic}
      </text>
    `
    content.push(tonicLabelText)

    const labelWords = label.split(' ')
    if (labelWords.length > 1) {
      const first = labelWords[0]
      const upperText = svg`
        <text
          class="quality-label"
          text-anchor="middle"
          font-size="160">
          <textPath href="#text-arc-top" startOffset="50%">
            ${first}
          </textPath>
        </text>
      `
      content.push(upperText)
      label = labelWords.slice(1).join(' ')
    }

    const qualityLabelText = svg`
      <text
        class="quality-label"
        text-anchor="middle"
        font-size="160"
      >
        <textPath href="#text-arc" startOffset="50%">
          ${label}
        </textPath>
      </text>
    `
    content.push(qualityLabelText)

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
   * @param {number} [args.radius]
   * @param {number} [args.thickness]
   */
  #createRimSegment(args) {
    const center = { x: 500, y: 500 }
    const radius = args.radius ?? 480
    const thickness = args.thickness ?? (radius / 2)

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

registerElement('scale-badge', ScaleBadgeElement)
