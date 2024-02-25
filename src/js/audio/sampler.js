import { SplendidGrandPiano } from 'smplr'

/**
 * @typedef {import('./smplr-types.d.ts').SampleStart} SampleStart
 */

export class Sampler {

  /** @type { AudioContext } */
  #audioContext

  #instrument

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
   * @param {SampleStart} note
   */
  async play(note) {
    if (this.#audioContext.state === 'suspended') {
      console.log('resuming audio context')
      await this.#audioContext.resume()
      console.log('context resumed')
    }
    return this.#instrument.start(note)
  }
}