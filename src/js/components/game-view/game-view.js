import { LitElement, html, css } from 'lit'
import { ContextConsumer } from '@lit/context'
import { registerElement } from '../../common/dom.js'
import { SoundContext } from '../../context/sound-context.js'
import { PitchClassElement } from '../tone-wheel/pitch-class.js'
import { currentRound, EventNames } from '../../state/game-round.js'

const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const randomNote = () => NOTES[Math.floor(Math.random()*NOTES.length)]

export class GameViewElement extends LitElement {
  static styles = css`
    tone-wheel {
      max-width: 50vw;
      margin: auto;
    }
  `

  #sampler = new ContextConsumer(this, { context: SoundContext })

  connectedCallback() {
    super.connectedCallback()
    currentRound.addEventListener(EventNames.correctGuess, (e) => {
      console.log('correct guess', e.target)
    })
    currentRound.addEventListener(EventNames.incorrectGuess, (e) => {
      console.log('incorrect guess', e.target)
    })
    currentRound.addEventListener(EventNames.started, (e) => {
      console.log('game started', e.target)
    })
    currentRound.addEventListener(EventNames.completed, (e) => {
      console.log('game completed', e.target)
      // TODO: trigger success animation, etc 
      this.#startNewGame()
    })
    this.#startNewGame()
  }

  #startNewGame() {
    // TODO: play note sequence & leave tonic note active (pitch line showing)
    currentRound.start({ tonic: randomNote(), targets: [ randomNote() ]})
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
      currentRound.guess(e.pitchClass.id)
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
    <tone-wheel @pitchClassSelected=${this.#pitchSelected}>
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
