import { PitchClassElement } from "./pitch-class.js"

// export const NoteTouchBeganEvent = 'note:touch-began'
// export const NoteTouchEndedEvent = 'note:touch-ended'

export const NoteHoldBeganEventName = 'note:holdBegan'
export const NoteHoldEndedEventName = 'note:holdEnded'

/**
 * @extends {CustomEvent<{ id: string }>}
 */
export class NoteHoldBeganEvent extends CustomEvent {
  /** @param {{ id: string }} detail  */
  constructor(detail) {
    super(NoteHoldBeganEventName, { detail })
  }
}

/**
 * @extends {CustomEvent<{ id: string }>}
 */
export class NoteHoldEndedEvent extends CustomEvent {
  /** @param {{ id: string }} detail  */
  constructor(detail) {
    super(NoteHoldEndedEventName, { detail })
  }
}

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
