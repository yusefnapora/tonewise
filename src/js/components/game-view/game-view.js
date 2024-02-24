import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'
import { PitchClassSelectedEventName } from '../tone-wheel/events.js';

export class GameViewElement extends LitElement {
  static styles = css`
    tone-wheel {
      max-width: 50vw;
      margin: auto;
    }
  `;

  /** @type {import('../tone-wheel/tone-wheel.js').ToneWheel} */
  get #wheel() {
    return this.renderRoot.querySelector('tone-wheel')
  }

  /** 
   * @param {import('../tone-wheel/events.js').PitchClassSelectedEvent} e
   */
  #pitchSelected(e) {
    console.log('pitch class selected', e)
    e.pitchClass.active = !e.pitchClass.active
    // TODO: make pitch-class into reactive element to avoid manual update
    this.#wheel.render()
  }

  render() {
    return html`
    <tone-wheel @pitchClassSelected=${this.#pitchSelected}>
      <pitch-class active>C</pitch-class>
      <pitch-class>C♯</pitch-class>
      <pitch-class active>D</pitch-class>
      <pitch-class>D♯</pitch-class>
      <pitch-class active>E</pitch-class>
      <pitch-class active>F</pitch-class>
      <pitch-class>F♯</pitch-class>
      <pitch-class active>G</pitch-class>
      <pitch-class>G♯</pitch-class>
      <pitch-class active>A</pitch-class>
      <pitch-class>A♯</pitch-class>
      <pitch-class active>B</pitch-class>
    </tone-wheel>
  `
  }
}

registerElement('game-view', GameViewElement)
