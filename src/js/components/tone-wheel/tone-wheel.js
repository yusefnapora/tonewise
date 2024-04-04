import { LitElement, css, html, svg } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
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
import {
  keyboardActivationEventListener,
  registerElement,
} from '../../common/dom.js'
/**
 * @typedef {import('../../common/types.d.ts').Point} Point
 * @typedef {import('../../common/types.d.ts').Rect} Rect
 *
 * @typedef {import('lit').TemplateResult<2>} SVGTemplateResult
 */

// Our SVG view box is 1000x1000 "user units" and we want to fill it completely,
// so default radius is just shy of 500 units. The padding avoids clipping the
// very edges of the wheel against the edge of the SVG element.
const DEFAULT_RADIUS = 496

// SVG starts counting degrees from the "eastward" point of the circle
// but I want 0 degrees to mean due north. So by default we apply a
// global rotation of -90deg.
export const DEFAULT_ROTATION_OFFSET = -90

const DEFAULT_FONT_SIZE = 75

const DEFAULT_PITCH_LINE_WIDTH = 200

export class ToneWheel extends LitElement {
  static styles = css`
    :host {
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
      /* width: 100%; */
      height: 100%;
      aspect-ratio: 1;
      grid-row: 1;
      grid-column: 1;
      z-index: 1;
    }

    svg:not(.non-interactive) {
      /* prevent browser from eating touch events for scrolling, etc */
      touch-action: none;
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

    .rim-segment-overlay {
      fill: none;
      stroke: none;
    }

    @media (pointer: fine) {
      svg:not(.non-interactive) .tone-group {
        cursor: pointer;
      }
    }

    @media (hover: hover) and (pointer: fine) {
      svg:not(.non-interactive) .tone-group:hover > .inner-wedge {
        opacity: 0.3;
      }
    }

    svg:not(.non-interactive) .tone-group.active > .inner-wedge {
      opacity: 0;
    }

    svg:not(.non-interactive) .tone-group:focus-visible {
      outline: none;

      & > .rim-segment {
        stroke: var(--color-text);
        stroke-width: 4;
      }

      &:not(.active) > .inner-wedge {
        opacity: 0.3;
      }
    }

    .tone-group.disabled {
      /* & > .rim-segment-overlay {
        fill: var(--color-background);
        opacity: 0.3;
      } */

      & > .tone-label {
        opacity: 0;
      }
    }
    svg:not(.non-interactive) .tone-group.disabled {
      cursor: auto;
      &:hover > .inner-wedge {
        opacity: 0;
      }
    }

    .pitch-line {
      opacity: 0;
      transition: opacity 0.2s ease-out;
    }

    .pitch-line .outline {
      stroke: var(--color-text);
    }

    .tone-group.active > .pitch-line:not(.hidden) {
      transition: opacity 0s;
      opacity: 1;
    }

    .pitch-line.hidden {
      opacity: 0;
    }

    .base-background-layer {
      clip-path: circle(48%);
      background-color: var(--color-wheel-bottom-layer-background);
      /* width: 100%; */
      height: 100%;
      grid-row: 1;
      grid-column: 1;
      aspect-ratio: 1;
      z-index: -2;
      border-radius: 50%;
    }

    .gradient-background {
      clip-path: circle(48%);
      /* width: 100%; */
      height: 100%;
      opacity: var(--wheel-gradient-background-opacity, 0.5);
      grid-row: 1;
      grid-column: 1;
      aspect-ratio: 1;
      z-index: -1;
      border-radius: 50%;
    }

    .vibrant {
      clip-path: var(--vibrant-reveal-path, circle(0px));
      transform: rotate(${DEFAULT_ROTATION_OFFSET});
      opacity: var(--wheel-gradient-background-vibrant-opacity, 1);
      aspect-ratio: 1;
      height: 100%;
      grid-row: 1;
      grid-column: 1;
      z-index: 0;
    }

    .vibrant.hidden {
      opacity: 0;
      transition: opacity 0.2s ease-out;
    }

    .gradient-blur {
      clip-path: circle(48%);
      width: 100%;
      height: 100%;
      backdrop-filter: blur(var(--wheel-gradient-background-blur, 30px));
    }
  `

  static properties = {
    radius: { type: Number },
    rotation: { type: Number },
    fontSize: { type: Number },
    colorScale: { type: String, attribute: 'color-scale' },
    hideLabels: { type: Boolean, attribute: 'hide-labels' },
    hidePitchLines: { type: Boolean, attribute: 'hide-pitch-lines' },
    nonInteractive: { type: Boolean, attribute: 'non-interactive' },
  }

  constructor() {
    super()
    this.radius = DEFAULT_RADIUS
    this.rotation = 0
    this.fontSize = DEFAULT_FONT_SIZE
    this.colorScale = DEFAULT_COLOR_SCALE
    this.hideLabels = false
    this.hidePitchLines = false
    this.nonInteractive = false
    this.maskIdSlug = Math.random().toString().replace('.', '_')
  }

  get rotationOffset() {
    return DEFAULT_ROTATION_OFFSET + this.rotation
  }

  get pitchClasses() {
    return /** @type {PitchClassElement[]} */ ([
      ...this.querySelectorAll(':scope > pitch-class'),
    ])
  }

  get #toneGroupElements() {
    return /** @type {SVGGElement[]} */ ([
      ...this.renderRoot.querySelectorAll('g.tone-group'),
    ])
  }

  render() {
    const { content, styleContent } = this.renderContent()
    const classes = { 'non-interactive': this.nonInteractive }

    const showVibrantBackground =
      this.pitchClasses.filter((pc) => pc.active).length >= 2

    /** @param {Element} item */
    const activate = (item) => {
      if (!(item instanceof SVGElement)) {
        return
      }

      for (const g of this.#toneGroupElements) {
        g.tabIndex = -1
      }
      item.tabIndex = 0
      item.focus()
    }

    const focusPrev = () => {
      const current = this.shadowRoot.activeElement
      if (!current) {
        return
      }
      let prev = current.previousElementSibling
      while (prev && prev.classList.contains('disabled')) {
        prev = prev.previousElementSibling
      }
      if (prev) {
        activate(prev)
        return
      }
      const groups = this.#toneGroupElements
      const last = groups[groups.length - 1]
      activate(last)
    }
    const focusNext = () => {
      const current = this.shadowRoot.activeElement
      if (!current) {
        return
      }
      let next = current.nextElementSibling
      while (next && next.classList.contains('disabled')) {
        next = next.nextElementSibling
      }
      if (next) {
        activate(next)
        return
      }
      const groups = this.#toneGroupElements
      if (groups.length === 0) {
        return
      }
      const first = groups[0]
      activate(first)
    }

    /** @param {KeyboardEvent} e */
    const arrowListener = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
        return focusPrev()
      }
      if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
        return focusNext()
      }
    }

    /** @param {FocusEvent} e */
    const focusOut = (e) => {
      const { relatedTarget } = e
      if (!(relatedTarget instanceof Element)) {
        return
      }
      if (relatedTarget.classList.contains('tone-group')) {
        return
      }
      console.log('focus leaving tone wheel, restoring tab indexes')
      for (const g of this.#toneGroupElements) {
        if (g.classList.contains('disabled')) {
          continue
        }
        g.tabIndex = 0
      }
    }

    return html`
      <style>
        ${styleContent}
      </style>
      <div
        role="presentation"
        part="inner-background"
        class="base-background-layer"></div>
      <div
        role="presentation"
        part="inner-background"
        class="gradient-background gradient-colors">
        <div class="gradient-blur"></div>
      </div>
      <div
        role="presentation"
        class="gradient-background vibrant gradient-colors ${showVibrantBackground
          ? ''
          : 'hidden'}">
        <div class="gradient-blur"></div>
      </div>
      <svg
        aria-label="tone wheel"
        @keydown=${arrowListener}
        @focusout=${focusOut}
        class=${classMap(classes)}
        viewBox="0 0 1000 1000">
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

      const { path: segmentOverlayPath } = this.#createRimSegment({
        startAngle: segmentStartAngle,
        endAngle: segmentEndAngle,
        intervalAngle: intervalAngle,
        thickness: rimThickness,
        className: 'rim-segment-overlay',
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
          hidden: this.hidePitchLines,
        }),
      )

      // push rim segment after pitch line, so it renders on top
      groupContent.push(segmentPath)
      groupContent.push(segmentOverlayPath)

      if (el.label) {
        groupContent.push(
          this.#createSegmentLabel({
            label: el.label,
            position: intervalPoint,
            hidden: this.hideLabels || el.disabled,
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

      /** @param {PointerEvent} e */
      const pointerDown = (e) => {
        if (this.nonInteractive) {
          return
        }
        if (e.target instanceof Element) {
          e.target.releasePointerCapture(e.pointerId)
        }
        e.preventDefault()
        activated()
      }

      /**  @param {PointerEvent} e */
      const pointerEnter = (e) => {
        if (this.nonInteractive) {
          return
        }
        if (e.pointerType !== 'touch' && e.buttons === 0) {
          return
        }
        activated()
      }

      /** @param {PointerEvent} e */
      const pointerLeave = (e) => {
        if (this.nonInteractive) {
          return
        }
        if (e.pointerType !== 'touch' && e.buttons === 0) {
          return
        }
        deactivated()
      }

      const pointerUp = () => {
        if (this.nonInteractive) {
          return
        }
        deactivated()
      }

      /** @param {PointerEvent} e */
      const touchDown = (e) => {
        if (this.nonInteractive) {
          return
        }
        e.preventDefault()
      }

      const keyDown = keyboardActivationEventListener((e) => {
        if (this.nonInteractive || e.repeat) {
          return
        }
        activated()
      })

      const keyUp = keyboardActivationEventListener(() => {
        if (this.nonInteractive) {
          return
        }
        deactivated()
      })

      const tabIndex = el.disabled ? undefined : '0'

      const classes = {
        [className]: true,
        'tone-group': true,
        active: el.active,
        disabled: el.disabled,
      }
      groups.push(svg`
        <g 
          @touchstart=${touchDown}
          @pointerdown=${pointerDown}
          @pointerenter=${pointerEnter} 
          @pointerleave=${pointerLeave}
          @pointerup=${pointerUp}
					@keydown=${keyDown}
					@keyup=${keyUp}
          class=${classMap(classes)}
					tabindex=${tabIndex}
					role="button"
					aria-disabled=${el.disabled}
					aria-label=${el.label}
        >
          ${groupContent}
        </g>
      `)
    }

    // repeat the first color at the end, so the
    // to act as the end point for the last gradient stop
    const backgroundColors = [...colors, colors[0]]
    const backgroundRotation = `from ${90 + this.rotationOffset}deg`
    styleContent += `
      .gradient-colors {
        background: conic-gradient(
          ${backgroundRotation},
          ${backgroundColors.join(', ')}
        );
      }
    `

    const { defs, clipMaskCss } = this.#vibrantBackgroundClipPath()

    styleContent += `
      .vibrant {
        --vibrant-reveal-path: ${clipMaskCss};
      }
    `

    const content = svg`
    ${defs}
    <g>
      ${groups}
    </g>
    `
    return { content, styleContent }
  }

  #vibrantBackgroundClipPath() {
    // reveal the "vibrant" form of the inner gradient background
    // in between each of the currently "active" pitch classes
    //
    // TODO: pass in a list of pitch-class ids to be highlighted
    // instead of assuming we always want the active ones in the
    // default order.
    const pitchesWithAngles = getIntervalAngles(this.pitchClasses)
    const activeIntervalAngles = pitchesWithAngles
      .filter(({ pitchClass }) => pitchClass.active)
      .map(({ angle }) => angle)

    if (activeIntervalAngles.length < 2) {
      return { defs: null, clipMaskCss: 'circle(0px)' }
    }

    let startAngle = activeIntervalAngles[0] + this.rotation
    let endAngle =
      activeIntervalAngles[activeIntervalAngles.length - 1] + this.rotation
    if (startAngle >= 360) {
      startAngle = startAngle - 360
    }
    if (endAngle >= 360) {
      endAngle = endAngle - 360
    }
    // console.log('reveal angles', { startAngle, endAngle, rot: this.rotation })
    const revealMaskPath = rimSegmentSVGPath({
      center: { x: 0.5, y: 0.5 },
      radius: this.radius / 1000,
      thickness: this.radius / 1000,
      startAngle,
      endAngle,
    })

    const transform = `rotate(${DEFAULT_ROTATION_OFFSET} 0.5 0.5)`
    const maskId = `vibrant-mask-${this.maskIdSlug}`
    const defs = svg`
    <defs>
      <clipPath id=${maskId} clipPathUnits="objectBoundingBox">
        <path d=${revealMaskPath} transform=${transform} />
      </clipPath>
    </defs>
    `

    const clipMaskCss = `url('#${maskId}')`

    return { defs, clipMaskCss }
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
    const { label, position, hidden } = args
    const x = position.x
    const y = position.y + this.fontSize * 0.25
    const classes = { 'tone-label': true, hidden }
    return svg`
      <text
        class=${classMap(classes)}
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
   * @param {boolean} [args.hidden]
   * @param {number} [args.cx] center x coord of wheel in viewbox units. defaults to 500
   * @param {number} [args.cy] center y coord of wheel in viewbox units. defaults to 500
   *
   */
  #createPitchLine(args) {
    const { className, endpoint, width, hidden } = args
    const cx = args.cx ?? 500
    const cy = args.cy ?? 500

    const groupClasses = { 'pitch-line': true, hidden }
    return svg`
    <g class=${classMap(groupClasses)}>
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
