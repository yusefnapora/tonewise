import { createContext } from '@lit/context'

/**
 * @template ValueType
 * @typedef {import('@lit/context').Context<symbol, ValueType>} Context<ValueType>
 */

/** @type {Context<import('../audio/sampler.js').Sampler>} */ 
export const SoundContext = (createContext(Symbol('tw-sound-context')))
