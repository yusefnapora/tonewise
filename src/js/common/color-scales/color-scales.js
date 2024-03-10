import { interpolateColorArray } from './interpolate.js'
import { infernoRGB } from './rgb/inferno.js'
import { magmaRGB } from './rgb/magma.js'
import { plasmaRGB } from './rgb/plasma.js'
import { viridisRGB } from './rgb/viridis.js'

// the inferno and magma scales start with black, so we trim off the start
// of the range to make it more usable

export const inferno = interpolateColorArray(infernoRGB.slice(60))
export const magma = interpolateColorArray(magmaRGB.slice(60))
export const plasma = interpolateColorArray(plasmaRGB)
export const viridis = interpolateColorArray(viridisRGB)
