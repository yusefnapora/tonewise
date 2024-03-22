import { SplendidGrandPiano } from 'smplr'

/**
 * @typedef {import('./smplr-types.d.ts').SampleStart} SampleStart
 */

const NOTES_TO_LOAD = [...Array(12).keys()].map((n) => n + 60)
const VELOCITY = 100
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

    this.#instrument = new SplendidGrandPiano(this.#audioContext, {
      baseUrl: '/assets/audio/splendid-grand-piano',
      notesToLoad: {
        notes: NOTES_TO_LOAD,
        velocityRange: [VELOCITY, VELOCITY],
      },
    })

    console.log('sampler constructor', this)
  }

  async enable() {
    await this.#instrument.load
    return this
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

    /** @type {Promise<SampleStart>} */
    let ended
    /** @type {(time?: number) => void} */
    let stop
    /** @type {Promise<SampleStart>} */
    const started = new Promise((resolveStart) => {
      ended = new Promise((resolveEnd) => {
        stop = this.#instrument.start({
          onStart: resolveStart,
          onEnded: resolveEnd,
          ...note,
        })
      })
    })
    return { started, ended, stop }
  }
}
