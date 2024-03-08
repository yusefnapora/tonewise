import { css } from 'lit'

export const cardStyleBase = css`

sl-card::part(base) {
  background: var(--color-glass-background);
  box-shadow: var(--glass-box-shadow);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--color-glass-border);
}

`
