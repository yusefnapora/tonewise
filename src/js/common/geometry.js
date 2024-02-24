// @ts-check

/**
 * @typedef {{x: number, y: number}} Point
 */

/**
 * 
 * @param {Point} a 
 * @param {Point} b 
 * @returns {Point}
 */
export function pointAdd(a, b) {
  return { x: a.x + b.x, y: a.y + b.y }
}

/**
 * @param {number} degrees angle in degrees
 * @returns {number} angle in radians
 */
export function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * @param {number} radians angle in radians
 * @returns {number} angle in degrees
 */
export function toDegrees(radians) {
  return radians * (180 / Math.PI)
}

/**
 * 
 * @param {number} a 
 * @param {number} b 
 * @returns {number} 
 */
export function degreesBetween(a, b) {
  const dist = normalizeAngle(Math.max(a, b) - Math.min(a, b))
  if (dist < 180) {
    return dist
  }
  return 360 - dist
}

/**
 * Convert polar coordinates in the form of (radius, angle) to
 * Cartesian (x,y) coordinates, optionally offset by a `center` cartesian point.
 * @param {number} radius
 * @param {number} degrees
 * @param {Point} center
 * @returns {Point}
 */
export function polarToCartesian(radius, degrees, center = { x: 0, y: 0 }) {
  const angle = toRadians(degrees)
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  }
}

/**
 * Returns an SVG path string that draws a line from the current point to the given `point`
 * @param {Point} point
 */
function lineToPoint(point) {
  return `L ${point.x} ${point.y}`
}

function moveToPoint(point) {
  return `M ${point.x} ${point.y}`
}

function normalizeAngle(degrees) {
  if (degrees >= 0) {
    return degrees
  }
  return 360 + degrees
}

/**
 * Returns an SVG path string describing an arc segment that covers the
 * circumference of a circle with the given `center` and `radius` and extends
 * from `startAngle` to `endAngle`.
 *
 * @param {object} args
 * @param {Point} args.center center point of the circle
 * @param {number} args.radius radius of the circle
 * @param {number} args.startAngle angle in degrees of start of the arc
 * @param {number} args.endAngle angle in degrees of end of the arc
 * @param {boolean} [args.clockwise]
 */
function svgArc(args) {
  const { center, radius } = args
  const startAngle = Math.max(args.startAngle, args.endAngle)
  const endAngle = Math.min(args.startAngle, args.endAngle)
  const rotationAngle = 0

  let largeArcFlag = 0
  if (endAngle >= startAngle) {
    largeArcFlag = endAngle - startAngle <= 180 ? 1 : 0
  } else {
    largeArcFlag = endAngle + 360.0 - startAngle <= 180 ? 1 : 0
  }

  const sweepFlag = args.clockwise ? 1 : 0

  const start = polarToCartesian(radius, startAngle, center)
  const end = polarToCartesian(radius, endAngle, center)
  const finalPoint = args.clockwise ? start : end
  const path = [
    'A',
    radius,
    radius,
    rotationAngle,
    largeArcFlag,
    sweepFlag,
    finalPoint.x,
    finalPoint.y,
  ].join(' ')
  return { start, end, path }
}

/**
 * Returns an SVG path string for a closed shape that follows the circumference
 * of a circle with the given `center` and `radius` and extends from `startAngle`
 * to `endAngle`. It extends "inward" towards the center of the circle by `thickness` units.
 *
 * @param {object} args
 * @param {Point} args.center
 * @param {number} args.radius
 * @param {number} args.startAngle
 * @param {number} args.endAngle
 * @param {number} args.thickness
 */
export function rimSegmentSVGPath(args) {
  const { center, radius, startAngle, endAngle, thickness } = args

  const innerRadius = radius - thickness
  const outerArc = svgArc({ center, radius, startAngle, endAngle })
  const innerArc = svgArc({
    center,
    radius: innerRadius,
    startAngle,
    endAngle,
    clockwise: true,
  })

  let path = [
    moveToPoint(outerArc.start),
    outerArc.path,
    lineToPoint(innerArc.end),
    innerArc.path,
    lineToPoint(outerArc.start),
  ].join(' ')
  return path
}
