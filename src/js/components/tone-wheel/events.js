// @ts-check

import { PitchClassElement } from "./pitch-class.js"

export const PitchClassSelectedEventName = 'pitchClassSelected'

export class PitchClassSelectedEvent extends CustomEvent {
  /**
   * @param {PitchClassElement} pitchClassElement 
   */
  constructor(pitchClassElement) {
    super(PitchClassSelectedEventName, { detail: pitchClassElement })
  }

  /** @returns { PitchClassElement } */
  get pitchClass() {
    return this.detail
  }
}
