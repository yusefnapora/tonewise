import { LitElement, css, html } from 'lit'
import { colorForAngle } from '../../common/color.js'
import { registerElement, resolveCSSVariables } from '../../common/dom.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { rimSegmentSVGPath, toRadians } from '../../common/geometry.js'

export class SplashScreenCanvasElement extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      max-width: 100vw;
      max-height: 100vh;
    }

    canvas {
      width: 100%;
      height: 100%;
    }
  `

  /**
   * @type {import('lit/directives/ref.js').Ref<HTMLCanvasElement>}
   */
  canvasRef = createRef()

  render() {
    this.#draw()
    return html`
      <canvas width="100%" height="100%" ${ref(this.canvasRef)}></canvas>
    `
  }

  #draw() {
    const canvas = this.canvasRef.value
    if (!canvas) {
      console.warn('no canvas element, redrawing on next tick')
      setTimeout(() => this.#draw())
      return
    }

    const rotation = -90
    const noteColors = getNoteColors().map((c) => resolveCSSVariables(c, this))
    const backgroundColors = backgroundGradientColors().map((c) =>
      resolveCSSVariables(c, this),
    )
    const bottomLayerColor = resolveCSSVariables(
      'var(--color-background, black)',
      this,
    )

    const activeStartAngle = 120
    const activeEndAngle = 240
    drawSplashScreen({
      canvas,
      rotation,
      noteColors,
      backgroundColors,
      bottomLayerColor,
      activeStartAngle,
      activeEndAngle,
    })
  }
}

/**
 *
 * @param {object} opts
 * @param {number} opts.width
 * @param {number} opts.height
 * @param {'dark'|'light'} opts.colorTheme
 * @param {number} [opts.pixelRatio]
 */
export function createSplashScreenImage(opts) {
  const { width, height, colorTheme } = opts

  const rotation = -90
  const baseColors = getNoteColors().map((c) =>
    c.replaceAll('--color-', `--theme-${colorTheme}-color-`),
  )

  const backgroundColorsBase = baseColors.map((c) =>
    c
      .replaceAll('-primary-lightness', '-background-lightness')
      .replaceAll('-primary-chroma', '-background-chroma'),
  )

  const cssScope = document.documentElement
  const noteColors = baseColors.map((c) => resolveCSSVariables(c, cssScope))
  const backgroundColors = backgroundColorsBase.map((c) =>
    resolveCSSVariables(c, cssScope),
  )
  const bottomLayerColor = resolveCSSVariables(
    `var(--theme-${colorTheme}-color-background)`,
    document.documentElement,
  )

  const activeStartAngle = 120
  const activeEndAngle = 240

  const canvas = document.createElement('canvas')
  const canvasRect = new DOMRect(0, 0, width, height)

  drawSplashScreen({
    canvas,
    canvasRect,
    rotation,
    noteColors,
    backgroundColors,
    bottomLayerColor,
    activeStartAngle,
    activeEndAngle,
  })

  return canvas.toDataURL('image/png')
}

/**
 *
 * @param {object} opts
 * @param {HTMLCanvasElement} opts.canvas
 * @param {number} opts.rotation
 * @param {string[]} opts.noteColors
 * @param {string[]} opts.backgroundColors
 * @param {string} opts.bottomLayerColor
 * @param {number} opts.activeStartAngle
 * @param {number} opts.activeEndAngle
 * @param {DOMRect} [opts.canvasRect]
 * @param {number} [opts.pixelRatio]
 * @param {number} [opts.innerGradientOpacity]
 */
function drawSplashScreen(opts) {
  const {
    canvas,
    rotation,
    noteColors,
    backgroundColors,
    bottomLayerColor,
    activeStartAngle,
    activeEndAngle,
  } = opts
  const startTime = Date.now()
  const ctx = canvas.getContext('2d')
  // Get the DPR and size of the canvas
  const dpr = opts.pixelRatio ?? window.devicePixelRatio
  const rect = opts.canvasRect ?? canvas.getBoundingClientRect()

  // Set the "actual" size of the canvas
  const width = rect.width * dpr
  const height = rect.height * dpr
  canvas.width = width
  canvas.height = height

  // Scale the context to ensure correct drawing operations
  ctx.scale(dpr, dpr)

  // Set the "drawn" size of the canvas
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`

  const viewportSize = Math.min(rect.width, rect.height)
  const radius = viewportSize * 0.35
  const thickness = radius * 0.28
  const innerRadius = radius - thickness / 2
  const center = { x: rect.width / 2, y: rect.height / 2 }
  drawBackground({ canvas, center, rotation, backgroundColors })

  // console.log({ viewportSize, radius, thickness, center, rotation })

  const innerLayerOpacity = opts.innerGradientOpacity ?? 0.5
  drawInnerBackground({
    canvas,
    center,
    radius: innerRadius,
    rotation,
    opacity: 1,
    colors: bottomLayerColor,
  })
  drawInnerBackground({
    canvas,
    center,
    radius: innerRadius,
    rotation,
    opacity: innerLayerOpacity,
    colors: noteColors,
    filter: 'blur(30px)',
  })

  const startAngle = activeStartAngle
  const endAngle = activeEndAngle
  ctx.save()
  setInnerWedgeClipPath({
    canvas,
    center,
    radius,
    rotation,
    startAngle,
    endAngle,
  })
  drawInnerBackground({
    canvas,
    center,
    radius: innerRadius,
    rotation,
    opacity: 1,
    colors: noteColors,
    filter: 'blur(30px)',
  })
  ctx.restore()

  drawWheelRim({ canvas, center, rotation, radius, thickness, noteColors })
  console.log(`drew splash screen to canvas in ${Date.now() - startTime}ms`)
}

/**
 * @param {object} opts
 * @param {HTMLCanvasElement} opts.canvas
 * @param {import("../../common/types.js").Point} opts.center
 * @param {number} opts.rotation
 * @param {string[]} opts.colors
 */
function setGradientFill(opts) {
  const { canvas, center, rotation, colors } = opts
  const ctx = canvas.getContext('2d')
  const stops = [...colors, colors[0]]
  // console.log('color stops', stops)
  const startAngle = toRadians(rotation)
  const gradient = ctx.createConicGradient(startAngle, center.x, center.y)
  for (let i = 0; i < stops.length; i++) {
    gradient.addColorStop(i / stops.length, stops[i])
  }
  ctx.fillStyle = gradient
}

/**
 * @param {object} opts
 * @param {HTMLCanvasElement} opts.canvas
 * @param {import("../../common/types.js").Point} opts.center
 * @param {number} opts.rotation
 * @param {string[]} opts.backgroundColors
 */
function drawBackground(opts) {
  const { canvas, center, rotation, backgroundColors } = opts
  const ctx = canvas.getContext('2d')
  ctx.save()
  setGradientFill({ canvas, center, rotation, colors: backgroundColors })
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
}

/**
 * @param {object} opts
 * @param {HTMLCanvasElement} opts.canvas
 * @param {import("../../common/types.js").Point} opts.center
 * @param {number} opts.rotation
 * @param {number} opts.opacity
 * @param {number} opts.radius radius of inner section, not whole wheel
 * @param {string | string[]} opts.colors pass single color for solid background, array for gradient
 * @param {string} [opts.filter]
 */
function drawInnerBackground(opts) {
  const { canvas, center, opacity, rotation, radius, colors } = opts
  const ctx = canvas.getContext('2d')
  ctx.save()
  if (typeof colors === 'string') {
    ctx.fillStyle = colors
  } else {
    setGradientFill({ canvas, center, rotation, colors })
  }

  ctx.arc(center.x, center.y, radius, 0, 360)

  ctx.globalAlpha = opacity
  ctx.filter = opts.filter
  ctx.fill()
  ctx.restore()
}

/**
 *
 * @param {object} opts
 * @param {HTMLCanvasElement} opts.canvas
 * @param {import("../../common/types.js").Point} opts.center
 * @param {number} opts.rotation
 * @param {number} opts.radius radius of inner section, not whole wheel
 * @param {number} opts.startAngle
 * @param {number} opts.endAngle
 */
function setInnerWedgeClipPath(opts) {
  const { canvas, center, rotation, radius } = opts
  const startAngle = opts.startAngle + rotation
  const endAngle = opts.endAngle + rotation

  const pathStr = rimSegmentSVGPath({
    center,
    radius,
    thickness: radius,
    startAngle,
    endAngle,
  })
  const path = new Path2D(pathStr)
  const ctx = canvas.getContext('2d')
  ctx.clip(path)
}

/**
 * @param {object} opts
 * @param {HTMLCanvasElement} opts.canvas
 * @param {import("../../common/types.js").Point} opts.center
 * @param {number} opts.rotation
 * @param {number} opts.radius
 * @param {number} opts.thickness
 * @param {string[]} opts.noteColors
 */
function drawWheelRim(opts) {
  const { canvas, center, rotation, radius, thickness, noteColors } = opts
  const ctx = canvas.getContext('2d')

  const step = 360 / noteColors.length
  for (let i = 0; i < noteColors.length; i++) {
    const angle = i * step + rotation
    const startAngle = angle - step / 2
    const endAngle = angle + step / 2

    const pathStr = rimSegmentSVGPath({
      center,
      startAngle,
      endAngle,
      radius,
      thickness,
    })
    const path = new Path2D(pathStr)
    ctx.fillStyle = noteColors[i]
    ctx.fill(path)
  }
}

function getNoteColors(colorScale = 'oklch') {
  const colors = []
  const n = 12
  const step = 360 / n
  for (let i = 0; i < n; i++) {
    const angle = step * i
    colors.push(colorForAngle(angle, colorScale))
  }
  // console.log('colors', colors)
  return colors
}

function backgroundGradientColors(colorScale = 'oklch') {
  return getNoteColors(colorScale).map((c) =>
    c
      .replace('--color-primary-lightness', '--bgcolor-lightness')
      .replace('--color-primary-chroma', '--bgcolor-chroma'),
  )
}

registerElement('splash-screen-canvas', SplashScreenCanvasElement)
