import { LitElement, css, html, nothing } from 'lit'
import { registerElement } from '../../common/dom.js'
import { StateController } from '../../state/controller.js'
import { guess, playChallengeSequence, start } from '../../state/slices/game-slice.js'
import { PitchClassElement } from '../tone-wheel/pitch-class.js'
import { clearNoteHighlight, endPlayerNote, highlightNote, resetInstrumentState, startPlayerNote } from '../../state/slices/instrument-slice.js'
import { resumeAudio, triggerNoteStart, triggerNoteStop } from '../../state/slices/audio-slice.js'
import { NoteIdMidiMap, NoteIds } from '../../audio/notes.js'
import { isGameCompleted, isGameStarted, selectActiveNoteIds } from '../../state/selectors/selectors.js'


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

  /**
   * 
   * @param {import('../../state/slices/types.js').GameRules|undefined} [rules]
   */
  #startGame(rules) {

    if (!rules) {
      const tonic = this.#getRandomPitchClass().toJsObject()
      let target = this.#getRandomPitchClass().toJsObject()
      while (target.id === tonic.id) {
        target = this.#getRandomPitchClass().toJsObject() 
      }
      rules = { tonic, targets: [ target ]}
    }
    const progress = { guesses: [] }

    this.#stateController.dispatch(start({ rules, progress }))
    this.#stateController.dispatch(resetInstrumentState())
    this.#stateController.dispatch(playChallengeSequence())
  }


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
    const started = isGameStarted(state)
    const completed = isGameCompleted(state)
    const allActive = selectActiveNoteIds(state)

    const tonicLabel = tonic ? `Tonic: ${tonic.id}` : ''

    const actionButton = (started && !completed)
      ? html`<sl-button variant="danger" @click=${() => this.#startGame()}>Give up</sl-button>`
      : html`<sl-button variant="primary" @click=${() => this.#startGame()}>New game</sl-button>`

    const replayButton = currentRound?.rules
      ? html`<sl-button variant="neutral" @click=${() => this.#startGame(currentRound.rules)}>Replay</sl-button>`
      : undefined

    const pitchClasses = NoteIds.map((id) => {
      const midiNote = NoteIdMidiMap[id]
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
