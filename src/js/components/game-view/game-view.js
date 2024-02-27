import { ContextConsumer } from '@lit/context'
import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'
import { SoundContext } from '../../context/sound-context.js'
import { StateController } from '../../state/controller.js'
import { guess, start } from '../../state/game-slice.js'
import { PitchClassElement } from '../tone-wheel/pitch-class.js'

export class GameViewElement extends LitElement {
  static styles = css`
    tone-wheel {
      max-width: min(500px, calc(100vw - 40px));
      margin: 30px auto;
    }
  `

  #stateController = new StateController(this)
  #sampler = new ContextConsumer(this, { context: SoundContext })

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
  }

  /**
   * @param {import('../../state/game-slice.js').GameRules} rules 
   */
  async #playChallenge(rules) {
    const { tonic, challengeMode } = rules
    const sampler = this.#sampler.value
    if (!sampler) {
      console.error('no sampler available')
      return
    }

    if (challengeMode === 'chord') {
      console.warn('chord mode not supported yet, playing sequentially')
    }
    const duration = 1
    const tonicPC = this.#pitchClass(tonic.name)
    if (!tonicPC) {
      return
    }
    await this.#playAndHighlight(tonicPC, { duration })
    for (const note of rules.targets) {
      const pc = this.#pitchClass(note.name)
      if (!pc) {
        continue
      }
      const { ended } = await sampler.play({ note: pc.midiNote, duration })
      await ended
    }

    await this.#playAndHighlight(tonicPC, { duration }, true)
  }

  /** 
   * @param {PitchClassElement} pc
   * @param {Omit<import('../../audio/smplr-types.js').SampleStart, 'note'>} options
   */
  async #playAndHighlight(pc, options, keepHighlighted = false) {
    const sampler = this.#sampler.value
    if (!pc.midiNote || !sampler) {
      return
    }

    pc.active = true
    this.#wheel.requestUpdate()
    const { ended } = await sampler.play({ note: pc.midiNote, ...options})
    await ended
    if (!keepHighlighted) {
      pc.active = false
      this.#wheel.requestUpdate()
    }
  }

  /** @type {import('../tone-wheel/tone-wheel.js').ToneWheel} */
  get #wheel() {
    return this.renderRoot.querySelector('tone-wheel')
  }

  /** @param {string} id  */
  #pitchClass(id) {
    return /** @type {PitchClassElement | undefined} */ (
      this.renderRoot.querySelector(`pitch-class.${id}`)
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
   * @param {import('../tone-wheel/events.js').PitchClassSelectedEvent} e
   */
  #pitchSelected(e) {
    e.pitchClass.active = true
    // TODO: make wheel auto-update when any pitch class changes active state
    this.#wheel.requestUpdate()

    this.#triggerNote(e.pitchClass)
    this.#stateController.dispatch(guess(e.pitchClass.toJsObject()))
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
    const { state } = this.#stateController
    const { currentRound } = state.game
    const tonic = currentRound?.rules?.tonic
    const completed = currentRound?.progress.isCompleted ?? false
    
    return html`
    <tone-wheel @pitchClassSelected=${this.#pitchSelected} no-pitch-constellation>
      <pitch-class class="C"  midi-note="60">C</pitch-class>
      <pitch-class class="C♯" midi-note="61">C♯</pitch-class>
      <pitch-class class="D"  midi-note="62">D</pitch-class>
      <pitch-class class="D♯" midi-note="63">D♯</pitch-class>
      <pitch-class class="E"  midi-note="64">E</pitch-class>
      <pitch-class class="F"  midi-note="65">F</pitch-class>
      <pitch-class class="F♯" midi-note="66">F♯</pitch-class>
      <pitch-class class="G"  midi-note="67">G</pitch-class>
      <pitch-class class="G♯" midi-note="68">G♯</pitch-class>
      <pitch-class class="A"  midi-note="69">A</pitch-class>
      <pitch-class class="A♯" midi-note="70">A♯</pitch-class>
      <pitch-class class="B"  midi-note="71">B</pitch-class>
    </tone-wheel>

    <div>
    <div>${tonic?.name}</div>
    <div>${completed ? 'Correct!' : undefined}</div>
    <button @click=${this.#startNewGame}>New Game</button>
    </div>
  `
  }
}

registerElement('game-view', GameViewElement)
