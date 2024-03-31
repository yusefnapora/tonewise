import { css, unsafeCSS } from 'lit'

export const cardStyleBase = css`
  sl-card::part(base) {
    background: var(--color-glass-background);
    box-shadow: var(--glass-box-shadow);
    backdrop-filter: var(--glass-backdrop-filter);
    -webkit-backdrop-filter: var(--glass-backdrop-filter);
    border: 1px solid var(--color-glass-border);
  }
`

/* prettier-ignore */
const landscapeCriteria = `(orientation: landscape) and (max-height: 540px)`

export function isLandscape(maxHeight = '540px') {
  const criteria = `(orientation: landscape) and (max-height: ${maxHeight})`
  return window.matchMedia(criteria).matches
}

/**
 *
 * @param {(orientation: 'landscape' | 'portrait') => unknown} callback
 */
export function onOrientationChange(callback, maxHeight = '540px') {
  const criteria = `(orientation: landscape) and (max-height: ${maxHeight})`

  window.matchMedia(criteria).addEventListener('change', (ev) => {
    if (ev.matches) {
      callback('landscape')
    } else {
      callback('portrait')
    }
  })
}

export const landscapeMediaQuery = css`
  /* prettier-ignore */
  @media ${unsafeCSS(landscapeCriteria)}
`
