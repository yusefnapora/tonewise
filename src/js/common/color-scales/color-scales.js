import { interpolateColorArray } from './interpolate.js'
import { infernoRGB } from './rgb/inferno.js'
import { magmaRGB } from './rgb/magma.js'
import { plasmaRGB } from './rgb/plasma.js'
import { viridisRGB } from './rgb/viridis.js'

export const inferno = interpolateColorArray(infernoRGB)
export const magma = interpolateColorArray(magmaRGB)
export const plasma = interpolateColorArray(plasmaRGB)
export const viridis = interpolateColorArray(viridisRGB)
