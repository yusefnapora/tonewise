// @ts-check
// The functions in this file are adapted from https://github.com/politiken-journalism/scale-color-perceptual/blob/master/utils/interpolate.js
// which has the following license:

// Copyright (c) 2015, Politiken Journalism <emil.bay@pol.dk>

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

import { rgb2hex } from './rgb-to-hex.js'

/**
 * @typedef {[number, number, number]} RGBArray
 * @typedef {(t: number) => string} InterpolationFn
 */

/**
 * Given two colors `a` and `b`, returns a function that will interpolate between them.
 * @param {RGBArray} a
 * @param {RGBArray} b
 * @returns {InterpolationFn} an interpolation function that accepts a value `t` between [0, 1] and returns a hex-encoded color that's `t` distance between `a` and `b`
 */
function interpolate(a, b) {
  const [ar, ag, ab] = a
  const br = b[0] - ar
  const bg = b[1] - ag
  const bb = b[2] - ab

  return (t) => rgb2hex([ar + br * t, ag + bg * t, ab + bb * t])
}

/**
 * @param {RGBArray[]} colors
 * @returns {InterpolationFn}
 */
export function interpolateColorArray(colors) {
  const N = colors.length - 2 // -1 for spacings, -1 for number of interpolate fns
  const intervalWidth = 1 / N
  const intervals = []

  for (let i = 0; i <= N; i++) {
    intervals[i] = interpolate(colors[i], colors[i + 1])
  }

  return function (t) {
    if (t < 0 || t > 1) throw new Error('Outside the allowed range of [0, 1]')

    var i = Math.floor(t * N)
    var intervalOffset = i * intervalWidth

    return intervals[i](t / intervalWidth - intervalOffset / intervalWidth)
  }
}
