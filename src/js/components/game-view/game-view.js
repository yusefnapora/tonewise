import { LitElement, html, css } from 'lit'
import { ContextConsumer } from '@lit/context'
import { registerElement } from '../../common/dom.js'
import { SoundContext } from '../../context/sound-context.js'
import { PitchClassElement } from '../tone-wheel/pitch-class.js'
import { StateController } from '../../state/controller.js'
import { start, guess } from '../../state/game-slice.js'

const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const randomNote = () => NOTES[Math.floor(Math.random()*NOTES.length)]

export class GameViewElement extends LitElement {
  static styles = css`
    tone-wheel {
      max-width: min(50vw, 90vh);
      margin: 30px auto;
    }
  `

  #stateController = new StateController(this)
  #sampler = new ContextConsumer(this, { context: SoundContext })

  connectedCallback() {
    super.connectedCallback()
    this.#startNewGame()
  }

  stateChanged(state) {
    console.log('state update', state)
    this.requestUpdate()
  }

  #startNewGame() {
    // TODO: play note sequence & leave tonic note active (pitch line showing)
    const rules = { tonic: randomNote(), targets: [ randomNote() ]}
    const progress = { guesses: [] }
    this.#stateController.dispatch(start({ rules, progress }))
  }

  /** @type {import('../tone-wheel/tone-wheel.js').ToneWheel} */
  get #wheel() {
    return this.renderRoot.querySelector('tone-wheel')
  }

  /** 
   * @param {import('../tone-wheel/events.js').PitchClassSelectedEvent} e
   */
  #pitchSelected(e) {
    e.pitchClass.active = !e.pitchClass.active
    // TODO: make wheel auto-update when any pitch class changes active state
    this.#wheel.requestUpdate()

    if (e.pitchClass.active) {
      this.#triggerNote(e.pitchClass)
      this.#stateController.dispatch(guess(e.pitchClass.id))
    }
  }

  /**
   * 
   * @param {PitchClassElement} pitchClass 
   */
  async #triggerNote(pitchClass) {
    const note = pitchClass.midiNote
    if (!note) {
      return
    }
    const sampler = this.#sampler.value
    if (!sampler) {
      console.warn('no sampler available in context')
      return
    }
    await sampler.enable()
    console.log('triggering note', note)
    await sampler.play({ 
      note,
      duration: 1,
      onEnded: () => this.#noteEnded(pitchClass)
    })
  }

  /**
   * 
   * @param {PitchClassElement} pitchClass 
   */
  #noteEnded(pitchClass) {
    // TODO: fade animation
    pitchClass.active = false 
    this.#wheel.requestUpdate()
  }

  render() {
    return html`
    <tone-wheel @pitchClassSelected=${this.#pitchSelected} no-pitch-constellation>
      <pitch-class id="C"  midi-note="60">C</pitch-class>
      <pitch-class id="C♯" midi-note="61">C♯</pitch-class>
      <pitch-class id="D"  midi-note="62">D</pitch-class>
      <pitch-class id="D♯" midi-note="63">D♯</pitch-class>
      <pitch-class id="E"  midi-note="64">E</pitch-class>
      <pitch-class id="F"  midi-note="65">F</pitch-class>
      <pitch-class id="F♯" midi-note="66">F♯</pitch-class>
      <pitch-class id="G"  midi-note="67">G</pitch-class>
      <pitch-class id="G♯" midi-note="68">G♯</pitch-class>
      <pitch-class id="A"  midi-note="69">A</pitch-class>
      <pitch-class id="A♯" midi-note="70">A♯</pitch-class>
      <pitch-class id="B"  midi-note="71">B</pitch-class>
    </tone-wheel>
  `
  }
}

registerElement('game-view', GameViewElement)
