import { LitElement, css, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import { guess, start } from '../../state/slices/game-slice.js'
import { PitchClassElement } from '../tone-wheel/pitch-class.js'
import { clearNoteHighlight, endPlayerNote, highlightNote, resetInstrumentState, startPlayerNote } from '../../state/slices/instrument-slice.js'
import { resumeAudio, triggerNoteStart, triggerNoteStop } from '../../state/slices/audio-slice.js'


export class GameViewElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    tone-wheel {
      width: 100%;
      max-width: min(500px, calc(100vw - 40px));
      margin: 30px auto;
    }
  `

  #stateController = new StateController(this)

  connectedCallback() {
    super.connectedCallback()
  }

  stateChanged() {
    this.requestUpdate()
  }

  #startNewGame() {
    const tonic = this.#getRandomPitchClass().toJsObject()
    const target = this.#getRandomPitchClass().toJsObject()
    const rules = { tonic, targets: [ target ]}
    const progress = { guesses: [] }
    for (const pc of this.#pitchClasses()) {
      pc.active = false
    }

    this.#playChallenge(rules)
    this.#stateController.dispatch(start({ rules, progress }))
    this.#stateController.dispatch(resetInstrumentState())
  }

  /**
   * @param {import('../../state/slices/game-slice.js').GameRules} rules 
   */
  async #playChallenge(rules) {
    // const { tonic, challengeMode } = rules

    // if (challengeMode === 'chord') {
    //   console.warn('chord mode not supported yet, playing sequentially')
    // }
    // const duration = 1
    // const tonicPC = this.#pitchClass(tonic.id)
    // if (!tonicPC) {
    //   return
    // }
    // this.#triggerNote(tonicPC)
    // await this.#playAndHighlight(tonicPC, { duration })
    // for (const note of rules.targets) {
    //   const pc = this.#pitchClass(note.id)
    //   if (!pc) {
    //     continue
    //   }
    //   const { ended } = await sampler.play({ note: pc.midiNote, duration })
    //   await ended
    // }

    // await this.#playAndHighlight(tonicPC, { duration }, true)
  }

  /** 
   * @param {PitchClassElement} pc
   */
  // async #playAndHighlight(pc) {
  //   if (!pc.midiNote) {
  //     return
  //   }
  //   const midiNote = pc.midiNote
  //   const note = { id: pc.id }

  //   this.#stateController.dispatch(triggerNoteStart({ midiNote }))
  //   this.#stateController.dispatch(highlightNote(note))
  // }

  /** @type {import('../tone-wheel/tone-wheel.js').ToneWheel} */
  get #wheel() {
    return this.renderRoot.querySelector('tone-wheel')
  }

  /** @param {string} id  */
  #pitchClass(id) {
    return /** @type {PitchClassElement | undefined} */ (
      this.renderRoot.querySelector(`pitch-class#${id}`)
    )
  }

  #pitchClasses() {
    return /** @type {PitchClassElement[]} */ (
      [...this.renderRoot.querySelectorAll('pitch-class')]
    )
  }

  #getRandomPitchClass() {
    const classes = this.#pitchClasses()
    return classes[Math.floor(Math.random()*classes.length)]
  }

  /** 
   * @param {import('../tone-wheel/events.js').NoteHoldBeganEvent} e
   */
  #pitchSelected(e) {
    const note = e.detail
    resumeAudio()
    this.#stateController.dispatch(startPlayerNote(note))

    const pc = this.#pitchClass(note.id)
    this.#triggerNote(pc)
    this.#stateController.dispatch(guess(note))
  }

   /** 
   * @param {import('../tone-wheel/events.js').NoteHoldEndedEvent} e
   */ 
  #pitchDeselected(e) {
    const note = e.detail
    this.#stateController.dispatch(endPlayerNote(note)) 
    this.#endNotePlayback(this.#pitchClass(note.id))
  }

  /**
   * 
   * @param {PitchClassElement} pitchClass 
   */
  #triggerNote(pitchClass) {
    const midiNote = pitchClass.midiNote
    if (!midiNote) {
      return
    }
    this.#stateController.dispatch(triggerNoteStart({ midiNote })) 
  }

  #endNotePlayback(pitchClass) {
    const midiNote = pitchClass.midiNote
    if (!midiNote) {
      return
    }
    this.#stateController.dispatch(triggerNoteStop({ midiNote }))  
  }


  render() {
    const { state } = this.#stateController
    const { currentRound } = state.game
    const tonic = currentRound?.rules?.tonic
    const completed = currentRound?.progress.isCompleted ?? false
    
    const tonicLabel = tonic ? `Tonic: ${tonic.id}` : ''

    const allActive = new Set([
      ...state.instrument.heldNotes, 
      ...state.instrument.highlightedNotes
    ].map(n => n.id))
    

    const actionButton = (!!currentRound && !completed)
      ? html`<sl-button variant="danger" @click=${this.#startNewGame}>Give up</sl-button>`
      : html`<sl-button variant="primary" @click=${this.#startNewGame}>New game</sl-button>`

    const replayButton = currentRound?.rules
      ? html`<sl-button variant="neutral" @click=${() => this.#playChallenge(currentRound.rules)}>Replay</sl-button>`
      : undefined

      // todo: define notes & midi mapping elsewhere
    const noteIds = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
    const pitchClasses = noteIds.map((id, i) => {
      const midiNote = i + 60
      const active = allActive.has(id)
      return html`
      <pitch-class id=${id} midi-note=${midiNote} active=${active || nothing}>${id}</pitch-class>
      `
    })
    
    // TODO: make tone-wheel update itself when active pitch classes change
    this.#wheel?.requestUpdate()

    return html`
    <tone-wheel 
      @note:holdBegan=${this.#pitchSelected}
      @note:holdEnded=${this.#pitchDeselected}
    >
      ${pitchClasses}
    </tone-wheel>

    <div>
      ${actionButton}
      ${replayButton}
      <div>${completed ? 'Correct!' : tonicLabel}</div>
    </div>
  `
  }
}

registerElement('game-view', GameViewElement)
