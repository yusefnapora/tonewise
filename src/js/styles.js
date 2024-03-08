import { css } from 'lit'

export const cardStyleBase = css`

sl-card::part(base) {
  background: rgba(49, 35, 35, 0.21);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5.1px);
  -webkit-backdrop-filter: blur(5.1px);
  border: 1px solid rgba(49, 35, 35, 0.23);
}

`
