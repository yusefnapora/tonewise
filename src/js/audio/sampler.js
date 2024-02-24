// @ts-check

import { SplendidGrandPiano } from 'smplr'

export class Sampler {

  /** @type { AudioContext } */
  #context

  #instrument

  /**
   * @param {object} [opts]
   * @param {AudioContext} [opts.context]
   */
  constructor(opts) {
    this.#context = opts?.context ?? new AudioContext()

    // todo: option for named soundfont
    this.#instrument = new SplendidGrandPiano(this.#context)
  }

  /**
   * Enables audio playback. Must be triggered by user action (e.g. button click event)
   */
  async enable() {
    await Promise.all([
      this.#context.resume(), 
      this.#instrument.load
    ])
  }

  /**
   * @param {string | number} note 
   */
  play(note) {
    // TODO: expose more options
    this.#instrument.start({ note, duration: 1 })
  }
}