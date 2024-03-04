export * from './components/index.js'

import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/card/card.js'
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'

// @ts-expect-error
if (process.env.NODE_ENV === 'production') {
  setBasePath('/shoelace')
}

/**
 * @param {'dark'|'light'} scheme
 */
function setColorScheme(scheme) {
  const html = document.querySelector('html')
  if (scheme === 'light') {
    html.classList.add('sl-theme-light', 'light-theme')
    html.classList.remove('sl-theme-dark', 'dark-theme')
  } else {
    html.classList.add('sl-theme-dark', 'dark-theme')
    html.classList.remove('sl-theme-light', 'light-theme')
  }
}

if (
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
) {
  setColorScheme('dark')
}
if (
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: light)').matches
) {
  setColorScheme('light')
}

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (event) => {
    const newColorScheme = event.matches ? 'dark' : 'light'
    setColorScheme(newColorScheme)
  })
