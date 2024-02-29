import { LitElement, css, html, svg } from 'lit'
import {
  degreesBetween,
  polarToCartesian,
  rimSegmentSVGPath,
} from '../../common/geometry.js'
import { PitchClassSelectedEvent } from './events.js'
import { PitchClassElement } from './pitch-class.js'

import { colorForAngle } from '../../common/color.js'
import { registerElement } from '../../common/dom.js'
/**
 * @typedef {import('../../common/types.d.ts').Point} Point
 * @typedef {import('../../common/types.d.ts').Rect} Rect
 * 
 * @typedef {import('lit').TemplateResult<2>} SVGTemplateResult
 */

// Our SVG view box is 1000x1000 "user units" and we want to fill it completely,
// so default radius is 500 units.
const DEFAULT_RADIUS = 500

// SVG starts counting degrees from the "eastward" point of the circle
// but I want 0 degrees to mean due north. So by default we apply a
// global rotation of -90deg.
const DEFAULT_ROTATION_OFFSET = -90

const DEFAULT_FONT_SIZE = 50

const DEFAULT_PITCH_LINE_WIDTH = 200

export class ToneWheel extends LitElement {
  static styles = css`
    :host {
      display: block;

			/* prevent browser from eating touch events for scrolling, etc */
		  touch-action: none;
    }

    .tone-label {
      user-select: none;
      -webkit-user-select: none;
    }

    .inner-wedge {
      opacity: 0;
      stroke: none;
    }

    .inner-wedge.highlight {
      opacity: 0.2;
    }

    @media(pointer: fine) {
      .tone-group {
        cursor: pointer;
      }
    }

    @media(hover: hover) and (pointer: fine) {
      .tone-group:hover > .inner-wedge {
        opacity: 0.2;
      }
    }

    
    .tone-group > .inner-wedge.active {
      opacity: 0;
    }

    .pitch-line {
      opacity: 0;
    }

    .pitch-line.active {
      opacity: 1.0;
    }
    
  `

  static properties = {
    radius: { type: Number },
    rotationOffset: { type: Number },
    fontSize: { type: Number },
  }

  constructor() {
    super()
    this.radius = DEFAULT_RADIUS
    this.rotationOffset = DEFAULT_ROTATION_OFFSET
    this.fontSize = DEFAULT_FONT_SIZE
  }

  get pitchClasses() {
    return /** @type {PitchClassElement[]} */ ([
      ...this.querySelectorAll(':scope > pitch-class')
    ])
  }

  render() {
    const { content, styleContent } = this.renderContent()
    return html`
    <style>
      ${styleContent}
    </style>
    <svg viewBox="0 0 1000 1000">
      ${content}
    </svg>
    `
  }

  renderContent() {
    let styleContent = ''
    const elements = this.pitchClasses

    if (elements.length === 0) {
      return
    }

    if (elements.some((el) => !(el instanceof PitchClassElement))) {
      console.error('<pitch-class> element not registered, unable to render')
      return
    }
    let pointerIsDown = false

    const pitchesWithAngles = getIntervalAngles(elements)
    pitchesWithAngles.sort((a, b) => a.angle - b.angle)

    const groups = []
    for (let i = 0; i < pitchesWithAngles.length; i++) {
      const groupContent = []
      const el = pitchesWithAngles[i].pitchClass

      // calculate start and end angles for this segment
      // by finding midpoints between our intervalAngle and the
      // intervalAngle of the previous and next segments.

      const nextIndex = i === elements.length - 1 ? 0 : i + 1
      const prevIndex = i === 0 ? elements.length - 1 : i - 1

      const intervalAngle = pitchesWithAngles[i].angle
      const prevIntervalAngle = pitchesWithAngles[prevIndex].angle
      const nextIntervalAngle = pitchesWithAngles[nextIndex].angle

      const segmentStartAngle =
        intervalAngle - degreesBetween(prevIntervalAngle, intervalAngle) / 2
      const segmentEndAngle =
        intervalAngle + degreesBetween(intervalAngle, nextIntervalAngle) / 2
      const segmentLength = degreesBetween(segmentStartAngle, segmentEndAngle)

      const className = `tone-${i}`

      groupContent.push(this.#createInnerWedge({
        startAngle: segmentStartAngle,
        endAngle: segmentEndAngle,
        className,
        active: el.active,
      }))

      const { path: segmentPath, intervalPoint } = this.#createRimSegment({
        startAngle: segmentStartAngle,
        endAngle: segmentEndAngle,
        intervalAngle: intervalAngle,
        className,
      })
      groupContent.push(segmentPath)

      // scale the pitch line width proportional to the wheel radius,
      // and also shrink the width for pitches whose rim segment length
      // is less than 1 EDO-step
      const edoStep = 360 / elements.length
      const len = Math.min(edoStep, segmentLength)
      const widthScalar = (len / 360) * (this.radius / DEFAULT_RADIUS)
      const width = DEFAULT_PITCH_LINE_WIDTH * widthScalar
      groupContent.push(
        this.#createPitchLine({
          className,
          endpoint: intervalPoint,
          width,
          active: el.active,
        }),
      )

      if (el.label) {
        groupContent.push(
          this.#createSegmentLabel({
            label: el.label,
            position: intervalPoint,
          }),
        )
      }

      const color = colorForAngle(intervalAngle)
      styleContent += `
        .${className} { 
          stroke: ${color};
          fill: ${color};
        }
			`

      const clickHandler = () => {
        console.log(`${el.label} (tone ${i}) clicked. active: ${el.active}`)
        const event = new PitchClassSelectedEvent(el)
        this.dispatchEvent(event)
      }

      const activated = () => {
        console.log(`${el.label} (tone ${i}) entered. active: ${el.active}`)
        const event = new PitchClassSelectedEvent(el)
        this.dispatchEvent(event) 
      }

      /**
       * 
       * @param {PointerEvent} e 
       */
      const pointerDown = (e) => {
        if (e.target instanceof Element) {
          e.target.releasePointerCapture
        }
        activated()
      }

      /**
       * @param {PointerEvent} e
       */
      const pointerEnter = (e) => {
        if (e.pointerType !== 'touch' && e.buttons === 0) {
          return
        } 
        activated()
      }

      groups.push(svg`
        <g 
          @pointerdown=${pointerDown}
          @pointerenter=${pointerEnter} 
          class="tone-group ${className}"
        >
          ${groupContent}
        </g>
      `)
    }

    const content = svg`
    <g>
      ${groups}
    </g>
    `
    return { content, styleContent }
  }

  /**
   *
   * @param {object} args
   * @param {string} args.label
   * @param {Point} args.position
   * @param {Function} [args.clickHandler]
   *
   * @returns {SVGTemplateResult}
   */
  #createSegmentLabel(args) {
    const { label, position } = args
    return svg`
      <text
        class="tone-label"
        stroke="white"
        fill="white"
        text-anchor="middle"
        font-size=${this.fontSize}
        x=${position.x}
        y=${position.y}
      >
        ${label}
      </text>
    `
  }

  /**
   * Creates an SVG path element that covers an arc segment on the outer rim of the wheel,
   * representing one pitch-class.
   *
   * @param {object} args
   * @param {number} args.intervalAngle angle in degrees of the interval for this pitch class, relative to the tonic pitch at angle 0
   * @param {number} args.startAngle angle in degrees of the beginning of the rim segment arc
   * @param {number} args.endAngle angle in degrees of the end of the rim segment arc
   * @param {number} [args.thickness] distance between inner and outer radii of the arc segment. defaults to 100
   * @param {string} [args.className] CSS class name, used for stroke color
   *
   * @typedef {object} RimSegment
   * @property {SVGTemplateResult} RimSegment.path an svg fragment containing shapes for the segment
   * @property {Point} intervalPoint a point positioned along the `intervalAngle`,
   *   midway between the inner and outer radius of the segment. Used for positioning labels
   *   and pitch constellation lines.
   *
   * @returns {RimSegment}
   */
  #createRimSegment(args) {
    const { className } = args
    const center = { x: 500, y: 500 }
    const radius = this.radius
    const thickness = args.thickness ?? 140

    const intervalAngle = args.intervalAngle + this.rotationOffset

    const startAngle = args.startAngle + this.rotationOffset
    const endAngle = args.endAngle + this.rotationOffset
    const pathString = rimSegmentSVGPath({
      center,
      radius,
      startAngle,
      endAngle,
      thickness,
    })
    const path = svg`
      <path class=${className + ' rim-segment'} d=${pathString} />
    `

    // return the cartesian point that corresponds to the intervalAngle,
    // positioned midway between the inner and outer radii
    const midpointRadius = radius - thickness / 2
    const intervalPoint = polarToCartesian(
      midpointRadius,
      intervalAngle,
      center,
    )

    return { path, intervalPoint }
  }

  /**
   * Creates a `line` element from the center of the wheel to the given endpoint.
   * @param {object} args
   * @param {Point} args.endpoint (x,y) coords of line's endpoint
   * @param {string} args.className CSS class name, to set stroke color
   * @param {number} args.width width of line in viewbox units
   * @param {boolean} [args.active]
   * @param {number} [args.cx] center x coord of wheel in viewbox units. defaults to 500
   * @param {number} [args.cy] center y coord of wheel in viewbox units. defaults to 500
   *
   */
  #createPitchLine(args) {
    const { className, endpoint, width, active } = args
    const cx = args.cx ?? 500
    const cy = args.cy ?? 500

    return svg`
    <line class=${className + ' pitch-line' + (active ? 'active' : '')}
      x1=${cx} y1=${cy}
      x2=${endpoint.x} y2=${endpoint.y}
      stroke-width=${width}
      stroke-linecap="round"
      opacity="0.6"
    />
    `
  }

  /**
   * @param {object} args
   * @param {string} args.className CSS class name, used for stroke color
   * @param {number} args.startAngle angle in degrees of the beginning of the wedge
   * @param {number} args.endAngle angle in degrees of the end of the wedge
   * @param {boolean} [args.active]
   */
  #createInnerWedge(args) {
    const { className,  active } = args
    const startAngle = args.startAngle + this.rotationOffset
    const endAngle = args.endAngle + this.rotationOffset
    const center = { x: 500, y: 500 }

    const pathString = rimSegmentSVGPath({ 
      center,
      radius: this.radius,
      thickness: this.radius,
      startAngle,
      endAngle
    })
    
    const fullClass = ['inner-wedge', className, active ? 'active' : ''].join(' ')
    return svg`
      <path class=${fullClass} d=${pathString} />
    `
  }
}



/**
 * Calculates the angle in degrees for each pitch class element,
 * using the `interval` attribute if present. If a pitch class
 * does not have an `interval` defined, it will be assigned an
 * angle assuming equal divisions of the octave, based on its
 * position in the input `pitchClasses` array. This lets us
 * support EDO tunings without having to specify an interval
 * for each pitch, but requires that the input be in ascending
 * order of EDO-steps (e.g. C is followed by C#, etc), and
 * also assumes that the first pitch is the "tonic" (interval 1:1)
 *
 * NOTE: I may end up revisiting this in the future, since it
 * can be a bit awkward if only some of the pitch classes have
 * an explicit `interval` attribute.
 *
 * @param {PitchClassElement[]} pitchClasses all pitch-class elements that comprise the tuning
 * @return {Array<{ angle: number, pitchClass: PitchClassElement }>} an array of objects containing
 *   the input pitch class elements and their angle in degrees along the tone wheel. The array will
 *   have the same ordering of elements as the input `pitchClasses` array.
 */
function getIntervalAngles(pitchClasses) {
  const edoStep = 360 / pitchClasses.length

  return pitchClasses.map((el, i) => {
    // use interval if defined, otherwise default to EDO steps
    if (el.interval) {
      const deg = (360 * el.interval) % 360.0
      return { angle: deg, pitchClass: el }
    }
    return { angle: edoStep * i, pitchClass: el }
  })
}

registerElement('tone-wheel', ToneWheel)
