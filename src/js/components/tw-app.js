import { LitElement, html, css } from 'lit'

export class AppElement extends LitElement {
  static styles = css`
    tone-wheel {
      max-width: 50vw;
      margin: auto;
    }
  `;

  render() {
    return html`
    <tone-wheel>
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
customElements.define('tw-app', AppElement)
