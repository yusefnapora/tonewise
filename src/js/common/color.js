/**
 * Given an `angle` in degrees, returns a CSS color string.
 *
 * Uses the oklch color space, so the angle is used directly
 * to set the hue. It's inverted so that colors run clockwise
 * from red, through violet and into green, simply because I've
 * got used to that orientation.
 *
 * Might add a toggle for counter-clockwise at some point.
 *
 * The lightness and chroma of the color can be set with
 * the `--color-primary-lightness` and `--color-primary-chroma`
 * CSS variables.
 *
 * TODO:
 *   - add secondary colors (e.g. non scale tones)
 *   - research alternate color mappings to accommodate
 *     people with different color sensitivities
 *
 * @param {number} angle angle in degrees
 * @returns {string} a css color string
 */
export function colorForAngle(angle) {
  const lightness = 'var(--color-primary-lightness, 60%)'
  const chroma = 'var(--color-primary-chroma, 0.26)'
  const hue = `-${angle}deg`
  return `oklch(${lightness} ${chroma} ${hue})`
}