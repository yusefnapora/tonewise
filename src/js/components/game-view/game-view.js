import { ContextConsumer } from '@lit/context'
import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'
import { SoundContext } from '../../context/sound-context.js'
import { StateController } from '../../state/controller.js'
import { guess, start } from '../../state/game-slice.js'
import { PitchClassElement } from '../tone-wheel/pitch-class.js'

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
    const tonicPC = this.#pitchClass(tonic.id)
    if (!tonicPC) {
      return
    }
    await this.#playAndHighlight(tonicPC, { duration })
    for (const note of rules.targets) {
      const pc = this.#pitchClass(note.id)
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
    pitchClass.active = false 
    this.#wheel.requestUpdate()
  }

  render() {
    const { state } = this.#stateController
    const { currentRound } = state.game
    const tonic = currentRound?.rules?.tonic
    const completed = currentRound?.progress.isCompleted ?? false
    
    const tonicLabel = tonic ? `Tonic: ${tonic.id}` : ''

    const actionButton = (!!currentRound && !completed)
      ? html`<sl-button variant="danger" @click=${this.#startNewGame}>Give up</sl-button>`
      : html`<sl-button variant="primary" @click=${this.#startNewGame}>New game</sl-button>`

    const replayButton = currentRound?.rules
      ? html`<sl-button variant="neutral" @click=${() => this.#playChallenge(currentRound.rules)}>Replay</sl-button>`
      : undefined

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

    <div>
      ${actionButton}
      ${replayButton}
      <div>${completed ? 'Correct!' : tonicLabel}</div>
    </div>
  `
  }
}

registerElement('game-view', GameViewElement)
