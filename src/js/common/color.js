// @ts-check

import { inferno, magma, plasma, viridis } from './color-scales/color-scales.js'

/**
 * @typedef {import('./types.js').ColorScaleName} ColorScaleName
 */

export const COLOR_SCALE_CSS_PROPERTY = '--color-scale'
export const VALID_COLOR_SCALES = new Set(['oklch', 'oklch_clockwise', 'inferno', 'magma', 'plasma', 'viridis'])
export const DEFAULT_COLOR_SCALE = 'oklch'

/**
 * Given an `angle` in degrees, returns a CSS color string.
 * 
 * The "color scale" / palette is determined by resolving the CSS variable `--color-scale`
 * using the computed styles of the given `elementScope`. If `elementScope` is not provided,
 * uses `document.body`, so will only pick up changes from the `:root` variable namespace.
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