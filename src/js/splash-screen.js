import { createSplashScreenImage } from './components/splash-screen/splash-screen-canvas.js'
import { isIOS, isIPad, isProd } from './common/platform.js'
import { store } from './state/store.js'

let currentThemePref = undefined

export function setupSplashScreenImages() {
  const skipGeneration = isProd && !isIOS()
  if (skipGeneration) {
    console.log('skipping splash screen generation')
    return
  }

  generateAndSetSplahImages()
  store.subscribe(() => generateAndSetSplahImages())
}

function generateAndSetSplahImages() {
  const colorThemePref = store.getState().preferences.theme
  if (colorThemePref === currentThemePref) {
    return
  }
  if (currentThemePref !== undefined) {
    console.log(`regenerating splash images. theme preference changed from ${currentThemePref} to ${colorThemePref}`)
  }
  currentThemePref = colorThemePref

  const { width, height } = screen
  const pixelRatio = window.devicePixelRatio ?? 1
  /** @type {Array<'dark'|'light'>} */
  const colorThemes = colorThemePref === 'auto' ? ['light', 'dark'] : [colorThemePref]
  const orientations = {
    portrait: {
      width: Math.min(width, height),
      height: Math.max(width, height),
    },
    landscape: {
      width: Math.max(width, height),
      height: Math.min(width, height),
    },
  }
  // iPadOS has a longstanding bug that causes it to use the portrait
  // splash image and stretch it to fit the landscape view.
  // This looks terrible, so we skip drawing the icon on iPad,
  // since the gradient background stretches well & is better
  // than nothing.
  //
  // feel free to remove this hack if / when the underlying bug is fixed.
  // see: https://intercom.help/progressier/en/articles/6755369-why-do-ipad-landscape-splash-screens-look-stretched
  const backgroundOnly = isIPad()
  const uris = []
  for (const [orientation, { width, height }] of Object.entries(orientations)) {
    for (const colorTheme of colorThemes) {
      let mediaQuery = `screen and (orientation: ${orientation})`
      if (colorThemes.length > 1) {
        mediaQuery += ' and (prefers-color-scheme: ${colorTheme})'
      }

      const dataUri = createSplashScreenImage({
        width,
        height,
        pixelRatio,
        colorTheme,
        backgroundOnly,
      })
      // console.log('setting splash screen image for', mediaQuery)
      const link = document.createElement('link')
      link.setAttribute('rel', 'apple-touch-startup-image')
      link.setAttribute('media', mediaQuery)
      link.setAttribute('href', dataUri)
      document.head.appendChild(link)
      uris.push(dataUri)
    }
  }
  // for (const u of uris) {
  //   window.open(u, '_blank')
  // }
}
