// @ts-check
import Color from 'colorjs.io'
import { inferno, magma, plasma, viridis } from './color-scales/color-scales.js'

/**
 * @typedef {import('./types.js').ColorScaleName} ColorScaleName
 */

/** @type {Record<ColorScaleName, string>} */
export const COLOR_SCALE_NAMES = {
  oklch: 'Prism',
  oklch_clockwise: 'Prism (reversed)',
  magma: 'Magma',
  inferno: 'Inferno',
  plasma: 'Plasma',
  viridis: 'Viridis',
}

/**
 * @param {string|undefined} s
 * @returns {ColorScaleName | undefined}
 */
export function asColorScaleName(s) {
  const names = new Set(Object.keys(COLOR_SCALE_NAMES))
  if (names.has(s)) {
    return /** @type {ColorScaleName} */ (s)
  }
  return undefined
}

export const DEFAULT_COLOR_SCALE = 'oklch'

/**
 * Given an `angle` in degrees, returns a CSS color string.
 *
 * The default 'oklch' color scale uses the angle to set the hue in the
 * [oklch color space](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch).
 *
 * The 'inferno', 'magma', 'plasma', and 'viridis' scales are the perceptual scales used
 * by matplotlib, and may be more accessible to people with different color sensitivities.
 *
 * @param {number} angle angle in degrees
 * @param {string} colorScale
 * @returns {string} a css color string
 */
export function colorForAngle(angle, colorScale = DEFAULT_COLOR_SCALE) {
  const normalized = angle / 360

  switch (colorScale) {
    case 'inferno':
      return inferno(normalized)
    case 'magma':
      return magma(normalized)
    case 'plasma':
      return plasma(normalized)
    case 'viridis':
      return viridis(normalized)

    case 'oklch_clockwise':
      return oklchColor(angle, { clockwise: true })

    case 'oklch':
    default:
      return oklchColor(angle)
  }
}

/**
 * Returns a color in the oklch color space.
 *
 * The CSS variables `--color-primary-lightness` and `--color-primary-chroma`
 * can be used to override the default lightness and chroma components.
 *
 * @param {number} angle angle in degrees
 * @param {object} [opts]
 * @param {boolean} [opts.clockwise] set to `true` to wind colors around the wheel clockwise. default: false
 * @returns {string} CSS color string
 */
function oklchColor(angle, opts) {
  const clockwise = opts?.clockwise ?? false

  const lightness = 'var(--color-primary-lightness, 60%)'
  const chroma = 'var(--color-primary-chroma, 0.26)'
  const hue = clockwise ? `${angle}deg` : `-${angle}deg`
  return `oklch(${lightness} ${chroma} ${hue})`
}

/**
 * @param {string} backgroundColor
 * @returns {string}
 */
export function getContrastingTextColor(backgroundColor) {
  if (!backgroundColor.startsWith('#')) {
    // HACK to avoid resolving css variables for the oklch-based color schemes
    return 'var(--color-text, white)'
  }
  const bg = new Color(backgroundColor)
  const bgLightness  = bg.oklch[0]

  if (bgLightness >= 0.7) {
    return 'black'
  }
  return 'white'
}
