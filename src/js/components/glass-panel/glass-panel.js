import { LitElement, html, css } from 'lit'
import { registerElement } from '../../common/dom.js'

export class GlassPanelElement extends LitElement {
  static styles = css`
    :host {
      background: var(--color-glass-background);
      box-shadow: var(--glass-box-shadow);
      backdrop-filter: var(--glass-backdrop-filter);
      -webkit-backdrop-filter: var(--glass-backdrop-filter);
      border: 1px solid var(--color-glass-border);

      border-radius: 5px;
      display: grid;
      place-content: stretch;
    }

    .contents {
      padding: var(--glass-panel-padding);
    }
  `

  render() {
    return html`
    <div class="contents">
      <slot></slot>
    </div>
    `
  }
}

registerElement('glass-panel', GlassPanelElement)