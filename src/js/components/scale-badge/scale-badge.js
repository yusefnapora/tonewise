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
      fill: var(--color-background);
      opacity: 0.75;
    }

    .badge-rim-segment {
      stroke: var(--color-text-muted);
      fill: var(--color-text-muted);
    }

    .badge-rim-segment:not(.active-note) {
      opacity: 0;
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
    // if (activeNote && colorScale.startsWith('oklch')) {
    //   activeNoteColor = colorForAngle(activeNote.angle, colorScale)
    // }

    const r = 420
    const cx = 500
    const cy = 500
    const backgroundCircle = svg`
    <circle class="background" r=${r} cx=${cx} cy=${cy} />
    `

    const r2 = r-60
    const textArcPath = `
      M ${cx-r2},${cy}
      a ${r2},${r2} 0 1,0 ${r2*2},0
      `

    const arcDef = svg`
    <defs>
      <path id="text-arc" d=${textArcPath} style="stroke: red; stroke-width: 10; fill: none;"/>
    </defs>
    `

    content.push(arcDef)
    content.push(backgroundCircle)

    const label = this.label ?? ''

    const fontSize = 280
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

    const qualityLabelText = svg`
      <text
        class="quality-label"
        text-anchor="middle"
        font-size="180"
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
   */
  #createRimSegment(args) {
    const center = { x: 500, y: 500 }
    const radius = 500
    const thickness = 500

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
