import { LitElement, html, css, svg } from 'lit'
import { registerElement } from '../../common/dom.js'

export class StaffViewElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      min-height: 150px;
    }

    :host > svg {
      height: 100%;
    }

    foreignObject > * {
      height: 100%;
    }

    .staff-line {
      stroke: var(--color-text-muted);
      stroke-width: 10;
    }

    #tonic-note {
      stroke: var(--color-text);
      fill: var(--color-text);
    }
  `

  static properties = {
    clef: { type: String },
    tonic: { type: String },
  }

  constructor() {
    super()
    this.clef = 'treble'
    this.tonic = 'c4'
  }

  render() {
    const clef =
      this.clef === 'bass'
        ? html`<bass-clef></bass-clef>`
        : html`<treble-clef></treble-clef>`

    const width = 1000
    const height = 1000

    const startX = 0
    const endX = width
    const startY = 200
    const endY = 750
    const n = 5
    const lineSpacing = (endY - startY) / (n - 1)
    const lineElements = []

    for (let i = 0; i < n; i++) {
      const y = startY + i * lineSpacing
      lineElements.push(svg`
        <line class="staff-line" id=${`staff-line-${i}`} x1=${startX} x2=${endX} y1=${y} y2=${y} />
      `)
    }

    const staffPosition = staffPositionForNote(this.clef, this.tonic)
    console.log(
      `staff position for ${this.clef} ${this.tonic}: ${staffPosition}`,
    )
    const noteYOffset = -1 * staffPosition * (lineSpacing / 2)
    const note = this.#tonicNoteSvg(noteYOffset)

    const clicked = () => {
      if (this.clef === 'treble') {
        this.clef = 'bass'
      } else {
        this.clef = 'treble'
      }
    }

    return html`
      <svg viewBox="0 0 ${width} ${height}" @click=${clicked}>
        ${lineElements}
        <foreignObject x="0" y="0" width="${width}" height="${height}">
          ${clef}
        </foreignObject>
        ${note}
      </svg>
    `
  }

  /** @param {number} yOffset */
  #tonicNoteSvg(yOffset) {
    const stem = svg`
      <path id="tonic-note-stem" d="m 113.13433,900.47269 0,83.14019"  transform="scale(4)"  />
    `
    const head = svg`
      <path id="tonic-note-head" d="m 153.03812,108.7706 a 11.237947,7.3223042 0 1 1 -0.33175,-1.76601" transform="matrix(1.2477873,-0.63522684,0.59622185,1.3694102,-142.33379,929.29558) scale(4)" />
    `

    const translateY = -410 + yOffset
    return svg`
      <g id="tonic-note" transform="translate(-200, ${translateY}) ">
        ${head}
        ${stem}
      </g>
    `
  }
}

registerElement('staff-view', StaffViewElement)

import { Note } from 'tonal'
/**
 *
 * @param {string} clef
 * @param {string} noteName
 */
function staffPositionForNote(clef, noteName) {
  const note = Note.get(noteName)
  const clefNote = clef === 'treble' ? Note.get('G4') : Note.get('F3')
  const clefPosition = clef === 'treble' ? 2 : 6
  const noteOctave = note.oct ?? clefNote.oct
  const octaveOffset = (noteOctave - clefNote.oct) * 7
  const stepOffset = note.step - clefNote.step
  console.log({
    note,
    clefNote,
    clefPosition,
    noteOctave,
    octaveOffset,
    stepOffset,
  })
  return clefPosition + octaveOffset + stepOffset
}
