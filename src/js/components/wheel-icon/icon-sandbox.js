import { LitElement, css, html } from 'lit'
import { registerElement } from '../../common/dom.js'

export class IconSandboxViewElement extends LitElement {

  static styles = css`
    tone-wheel {
      height: 500px;
    }
  `

  render() {
    return html`
      <tone-wheel rotation="330">
        <pitch-class class="C" active midi-note="60">C</pitch-class>
        <pitch-class class="C♯" active midi-note="61">C♯</pitch-class>
        <pitch-class class="D"  midi-note="62">D</pitch-class>
        <pitch-class class="D♯" midi-note="63">D♯</pitch-class>
        <pitch-class class="E"  midi-note="64">E</pitch-class>
        <pitch-class class="F"  midi-note="65">F</pitch-class>
        <pitch-class class="F♯" midi-note="66">F♯</pitch-class>
        <pitch-class class="G"  midi-note="67">G</pitch-class>
        <pitch-class class="G♯"  midi-note="68">G♯</pitch-class>
        <pitch-class class="A"  midi-note="69">A</pitch-class>
        <pitch-class class="A♯"  midi-note="70">A♯</pitch-class>
        <pitch-class class="B"  midi-note="71">B</pitch-class>
      </tone-wheel>
    `
  }
}

registerElement('icon-sandbox', IconSandboxViewElement)