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
  `

  static properties = {
    clef: { type: String },
  }

  constructor() {
    super()
    this.clef = 'treble'
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
    const step = (endY - startY) / (n - 1)
    const lineElements = []
    for (let i = 0; i < n; i++) {
      const y = startY + i * step
      lineElements.push(svg`
        <line class="staff-line" id=${`staff-line-${i}`} x1=${startX} x2=${endX} y1=${y} y2=${y} />
      `)
    }

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
      </svg>
    `
  }
}

registerElement('staff-view', StaffViewElement)
