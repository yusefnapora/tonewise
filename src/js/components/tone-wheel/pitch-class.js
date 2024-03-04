import { LitElement } from 'lit'
import { registerElement } from '../../common/dom.js'

export class PitchClassElement extends LitElement {
  static properties = {
    active: { type: Boolean },
    interval: { type: Number, converter: convertIntervalString },
    midiNote: { type: Number, attribute: 'midi-note' },
  }

  constructor() {
    super()
    this.active = false
    this.interval = 0
    this.interval = undefined
    this.midiNote = 0
    this.midiNote = undefined
  }

  get label() {
    return this.textContent
  }

  toJsObject() {
    const { active, interval, midiNote, id } = this
    return { active, interval, midiNote, id }
  }
}

/**
 * Parses out interval ratio strings, which can either be floating
 * point numbers, or two numbers separated by either `/` or `:`
 * to divide two numbers.
 * @param {string} s
 * @returns number | undefined
 */
function convertIntervalString(s) {
  if (!s) {
    return undefined
  }

  s = s.replace(':', '/')
  const [numStr, denomStr] = s.split('/')
  const numerator = Number.parseFloat(numStr)
  if (denomStr == null) {
    return numerator
  }
  const denominator = Number.parseFloat(denomStr)
  return numerator / denominator
}

registerElement('pitch-class', PitchClassElement)
