import { store } from './state/store.js'

let currentColorScheme = ''
/**
 * @param {'dark'|'light'} scheme
 */
function applyColorScheme(scheme) {
  const html = document.querySelector('html')
  if (scheme === 'light') {
    html.classList.add('sl-theme-light', 'light-theme')
    html.classList.remove('sl-theme-dark', 'dark-theme')
  } else {
    html.classList.add('sl-theme-dark', 'dark-theme')
    html.classList.remove('sl-theme-light', 'light-theme')
  }
  currentColorScheme = scheme
}

/**
 * @param {'dark'|'light'} scheme
 */
function applyPreferredColorScheme(scheme) {
  const { preferences: { theme } } = store.getState()
  if (theme !== 'auto') {
    return
  }
  applyColorScheme(scheme)
}

function applyCurrentPreferredColorScheme() {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    applyPreferredColorScheme('dark')
  }
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  ) {
    applyPreferredColorScheme('light')
  }
}

export function setupColorScheme() {
  applyCurrentPreferredColorScheme()

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event) => {
      const newColorScheme = event.matches ? 'dark' : 'light'
      applyPreferredColorScheme(newColorScheme)
    })

  store.subscribe(() => {
    const { preferences: { theme } } = store.getState()
    if (theme === currentColorScheme) {
      return
    }
    if (theme === 'auto') {
      applyCurrentPreferredColorScheme()
      return
    }

    applyColorScheme(theme)
  })
}