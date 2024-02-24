import { registerElement } from '../../common/dom.js'

export class PitchClassElement extends HTMLElement {
  get label() {
    return this.textContent
  }

  get active() {
    return this.hasAttribute('active')
  }

  /**
   * @param {boolean} val 
   */
  set active(val) {
    if (val) {
      this.setAttribute('active', 'true')
    } else {
      this.removeAttribute('active')
    }
  }

  /**
   * @returns {number | undefined}
   */
  get interval() {
    let s = this.getAttribute('interval')
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

  /**
   * @param {string|number|undefined} val 
   */
  set interval(val) {
    if (val) {
      this.setAttribute('interval', val.toString())
    } else {
      this.removeAttribute('interval')
    }
  }

  get midiNote() {
    const s = this.getAttribute('midi-note')
    if (s) {
      return parseInt(s)
    }
    return undefined
  }

}

registerElement('pitch-class', PitchClassElement)
