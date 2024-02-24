// @ts-check

import { SplendidGrandPiano } from 'smplr'

export class Sampler {

  /** @type { AudioContext } */
  #audioContext

  #instrument

  #enabled = false

  /**
   * @param {object} [opts]
   * @param {AudioContext} [opts.context]
   */
  constructor(opts) {
    this.#audioContext = opts?.context ?? new AudioContext()

    // todo: option for named soundfont
    this.#instrument = new SplendidGrandPiano(this.#audioContext)

    console.log('sampler constructor', this)
  }

  async enable() { 
    return this.#instrument.load
  }

  /**
   * @param {string | number} note 
   */
  play(note) {
    // TODO: expose more options
    if (this.#audioContext.state === 'suspended') {
      console.log('resuming audio context')
      return this.#audioContext.resume().then(() => {
        console.log('context resumed')
        this.play(note)
      })
    }
    this.#instrument.start({ note, duration: 1 })
  }
}