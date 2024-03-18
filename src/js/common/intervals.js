import { Interval } from 'tonal'

/**
 * 
 * @param {number} a 
 * @param {number} b 
 */
export function midiNoteInterval(a, b) {
  const semitones = Math.abs(a - b)
  return Interval.fromSemitones(semitones)
}


const QUALITY_NAMES = {
  dd: 'Double diminished',
  d: 'Diminished',
  m: 'Minor',
  P: 'Perfect',
  M: 'Major',
  A: 'Augmented'
}

const NUMBER_NAMES = {
  1: 'Unison',
  2: 'Second',
  3: 'Third',
  4: 'Fourth',
  5: 'Fifth',
  6: 'Sixth',
  7: 'Seventh',
  8: 'Octave',
}

/**
 * @param {string} interval 
 */
export function intervalDisplayName(interval) {
  const quality = Interval.quality(interval)
  const num = Interval.num(interval)
  if (num === 1) {
    return 'Unison'
  }
  if (num === 8) {
    return 'Octave'
  }
  const q = QUALITY_NAMES[quality]
  const n = NUMBER_NAMES[num]
  return `${q} ${n}`
}