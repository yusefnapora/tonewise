import { LitElement, css, html, svg } from 'lit'
import {
  calculateSegmentAngles,
  degreesBetween,
  polarToCartesian,
  rimSegmentSVGPath,
} from '../../common/geometry.js'
import { NoteHoldBeganEvent, NoteHoldEndedEvent } from './events.js'
import { PitchClassElement } from './pitch-class.js'

import {
  DEFAULT_COLOR_SCALE,
  colorForAngle,
  getContrastingTextColor,
} from '../../common/color.js'
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

const DEFAULT_FONT_SIZE = 75

const DEFAULT_PITCH_LINE_WIDTH = 200

export class ToneWheel extends LitElement {
  static styles = css`
    :host {
      /* prevent browser from eating touch events for scrolling, etc */
      touch-action: none;

      /** 
       * Layout children in a 1x1 grid, so that they overlap back-to-front
       * Used to position the gradient background so that it is positioned
       * directly behind the wheel with the same width & height.
       */
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
      place-content: center;
      place-items: center;

      font-family: var(--note-font-family);
    }

    svg {
      width: 100%;
      height: 100%;
      grid-row: 1;
      grid-column: 1;
      z-index: 2;
    }

    .tone-label {
      user-select: none;
      -webkit-user-select: none;

      stroke: var(--color-text);
      fill: var(--color-text);
    }

    .tone-label.hidden {
      opacity: 0;
    }

    .inner-wedge {
      opacity: 0;
      stroke: none;
    }

    .inner-wedge.highlight {
      opacity: 0.3;
    }

    @media (pointer: fine) {
      .tone-group {
        cursor: pointer;
      }
    }

    @media (hover: hover) and (pointer: fine) {
      .tone-group:hover > .inner-wedge {
        opacity: 0.3;
      }
    }

    .tone-group.active > .inner-wedge {
      opacity: 0;
    }

    .pitch-line {
      opacity: 0;
      transition: opacity 0.2s ease-out;
    }

    .pitch-line .outline {
      stroke: var(--color-text);
    }

    .tone-group.active > .pitch-line {
      transition: opacity 0s;
      opacity: 1;
    }

    .base-background-layer {
      clip-path: url(#gradient-clip);
      background-color: var(--color-wheel-bottom-layer-background);
      width: 100%;
      height: 100%;
      grid-row: 1;
      grid-column: 1;
    }

    .gradient-background {
      clip-path: url(#gradient-clip);
      width: 100%;
      height: 100%;
      opacity: var(--wheel-gradient-background-opacity, 0.5);
      grid-row: 1;
      grid-column: 1;
    }

    .vibrant {
      clip-path: url(#vibrant-gradient-reveal);
      opacity: var(--wheel-gradient-background-vibrant-opacity, 1);
    }

    .vibrant.hidden {
      opacity: 0;
      transition: opacity 0.2s ease-out;
    }

    .gradient-blur {
      clip-path: url(#gradient-clip);
      width: 100%;
      height: 100%;
      backdrop-filter: blur(var(--wheel-gradient-background-blur, 30px));
    }
  `

  static properties = {
    radius: { type: Number },
    rotationOffset: { type: Number },
    fontSize: { type: Number },
    colorScale: { type: String, attribute: 'color-scale' },
    hideLabels: { type: Boolean, attribute: 'hide-labels' },
  }

  constructor() {
    super()
    this.radius = DEFAULT_RADIUS
    this.rotationOffset = DEFAULT_ROTATION_OFFSET
    this.fontSize = DEFAULT_FONT_SIZE
    this.colorScale = DEFAULT_COLOR_SCALE
    this.hideLabels = false
  }

  get pitchClasses() {
    return /** @type {PitchClassElement[]} */ ([
      ...this.querySelectorAll(':scope > pitch-class'),
    ])
  }

  render() {
    const { content, styleContent } = this.renderContent()
    return html`
      <style>
        ${styleContent}
      </style>
      <div class="base-background-layer"></div>
      <div class="gradient-background gradient-colors">
        <div class="gradient-blur"></div>
      </div>
      <div class="gradient-background vibrant gradient-colors">
        <div class="gradient-blur"></div>
      </div>
      <svg viewBox="0 0 1000 1000">${content}</svg>
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

    const pitchesWithAngles = getIntervalAngles(elements)
    pitchesWithAngles.sort((a, b) => a.angle - b.angle)
    const angles = calculateSegmentAngles(pitchesWithAngles)

    const rimThickness = 140

    const groups = []
    const colors = []
    for (let i = 0; i < angles.length; i++) {
      const groupContent = []

      const el = angles[i].input.pitchClass
      const intervalAngle = angles[i].input.angle
      const segmentStartAngle = angles[i].startAngle
      const segmentEndAngle = angles[i].endAngle
      const segmentLength = degreesBetween(segmentStartAngle, segmentEndAngle)

      const className = `tone-${i}`

      groupContent.push(
        this.#createInnerWedge({
          startAngle: segmentStartAngle,
          endAngle: segmentEndAngle,
          className,
        }),
      )

      const { path: segmentPath, intervalPoint } = this.#createRimSegment({
        startAngle: segmentStartAngle,
        endAngle: segmentEndAngle,
        intervalAngle: intervalAngle,
        thickness: rimThickness,
        className,
      })

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
        }),
      )

      // push rim segment after pitch line, so it renders on top
      groupContent.push(segmentPath)

      if (el.label) {
        groupContent.push(
          this.#createSegmentLabel({
            label: el.label,
            position: intervalPoint,
            hidden: this.hideLabels,
          }),
        )
      }

      const color = colorForAngle(intervalAngle, this.colorScale)
      const textColor = getContrastingTextColor(color)
      colors.push(color)
      styleContent += `
        .${className} { 
          stroke: ${color};
          fill: ${color};
        }
        .${className} .tone-label {
          stroke: ${textColor};
          fill: ${textColor};
        }
			`

      const activated = () => {
        const event = new NoteHoldBeganEvent({ id: el.id })
        this.dispatchEvent(event)
      }

      const deactivated = () => {
        // console.log('note hold end', el.id)
        const event = new NoteHoldEndedEvent({ id: el.id })
        this.dispatchEvent(event)
      }

      /**
       *
       * @param {PointerEvent} e
       */
      const pointerDown = (e) => {
        if (e.target instanceof Element) {
          e.target.releasePointerCapture(e.pointerId)
        }
        e.preventDefault()
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

      const pointerLeave = (e) => {
        if (e.pointerType !== 'touch' && e.buttons === 0) {
          return
        }
        deactivated()
      }
      const pointerUp = (e) => {
        deactivated()
      }
      const touchDown = (e) => {
        e.preventDefault()
      }

      groups.push(svg`
        <g 
          @touchstart=${touchDown}
          @pointerdown=${pointerDown}
          @pointerenter=${pointerEnter} 
          @pointerleave=${pointerLeave}
          @pointerup=${pointerUp}
          class="tone-group ${className} ${el.active ? 'active' : undefined}"
        >
          ${groupContent}
        </g>
      `)
    }

    // repeat the first color at the end, so the
    // to act as the end point for the last gradient stop
    const backgroundColors = [...colors, colors[0]]
    styleContent += `
      .gradient-colors {
        background: conic-gradient(
          ${backgroundColors.join(', ')}
        );
      }
    `

    // clip the inner conic gradient background to extend just
    // past the inner edge of the rim. Putting it right at the
    // edge leads to a "glow" effect around the rim which is
    // nice, but not quite what I want.
    // also note that we're dividing by 1000 (viewbox width / height),
    // so that we end up covering a 1x1 unit area, which will be
    // scaled to cover the area of the clipped object thanks to
    // clipPathUnits="objectBoundingBox"
    const clipRadius = (this.radius - rimThickness / 2) / 1000

    // reveal the "vibrant" form of the inner gradient background
    // in between each of the currently "active" pitch classes
    //
    // TODO: pass in a list of pitch-class ids to be highlighted
    // instead of assuming we always want the active ones in the
    // default order.
    const activeIntervalAngles = pitchesWithAngles
      .filter(({ pitchClass }) => pitchClass.active)
      .map(({ angle }) => angle)

    const revealClipPath = this.renderRoot.querySelector(
      '#vibrant-gradient-reveal > path',
    )
    let revealMaskPath = revealClipPath?.getAttribute('d') ?? ''
    let showVibrantBackground = false
    if (activeIntervalAngles.length >= 2) {
      showVibrantBackground = true
      const startAngle = activeIntervalAngles[0] + this.rotationOffset
      const endAngle =
        activeIntervalAngles[activeIntervalAngles.length - 1] +
        this.rotationOffset
      revealMaskPath = rimSegmentSVGPath({
        center: { x: 0.5, y: 0.5 },
        radius: this.radius / 1000,
        thickness: this.radius / 1000,
        startAngle,
        endAngle,
      })
    }
    const vibrantBackgroundElement = this.renderRoot.querySelector('.vibrant')
    vibrantBackgroundElement?.classList.toggle('hidden', !showVibrantBackground)

    const content = svg`
    <defs>
      <clipPath id="gradient-clip" clipPathUnits="objectBoundingBox">
        <circle cx="0.5" cy="0.5" r=${clipRadius} />
      </clipPath>      
      <clipPath id="vibrant-gradient-reveal" clipPathUnits="objectBoundingBox">
        <path d=${revealMaskPath} />
      </clipPath>
    </defs>
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
   * @param {boolean} [args.hidden]
   * @param {Function} [args.clickHandler]
   *
   * @returns {SVGTemplateResult}
   */
  #createSegmentLabel(args) {
    const { label, position } = args
    const x = position.x
    const y = position.y + this.fontSize * 0.25
    const className = 'tone-label' + (args.hidden ? ' hidden' : '')
    return svg`
      <text
        class=${className}
        stroke="white"
        fill="white"
        text-anchor="middle"
        font-size=${this.fontSize}
        x=${x}
        y=${y}
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
   * @param {number} [args.cx] center x coord of wheel in viewbox units. defaults to 500
   * @param {number} [args.cy] center y coord of wheel in viewbox units. defaults to 500
   *
   */
  #createPitchLine(args) {
    const { className, endpoint, width } = args
    const cx = args.cx ?? 500
    const cy = args.cy ?? 500

    return svg`
    <g class="pitch-line">
      <line
        class="outline" 
        x1=${cx} y1=${cy}
        x2=${endpoint.x} y2=${endpoint.y}
        stroke-width=${width}
        stroke-linecap="round"
        opacity="0.7"
      />
      <line class=${className}
        x1=${cx} y1=${cy}
        x2=${endpoint.x} y2=${endpoint.y}
        stroke-width=${width * 0.8}
        stroke-linecap="round"
        opacity="0.9"
      />
    </g>
    `
  }

  /**
   * @param {object} args
   * @param {string} args.className CSS class name, used for stroke color
   * @param {number} args.startAngle angle in degrees of the beginning of the wedge
   * @param {number} args.endAngle angle in degrees of the end of the wedge
   */
  #createInnerWedge(args) {
    const { className } = args
    const startAngle = args.startAngle + this.rotationOffset
    const endAngle = args.endAngle + this.rotationOffset
    const center = { x: 500, y: 500 }

    const pathString = rimSegmentSVGPath({
      center,
      radius: this.radius,
      thickness: this.radius,
      startAngle,
      endAngle,
    })

    const fullClass = ['inner-wedge', className].join(' ')
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
