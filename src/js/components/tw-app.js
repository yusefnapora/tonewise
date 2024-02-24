import {LitElement, html} from 'lit';

export class AppElement extends LitElement {
  render() {
    return html`
    <p>yo</p>
    `;
  }
}
customElements.define('tw-app', AppElement);