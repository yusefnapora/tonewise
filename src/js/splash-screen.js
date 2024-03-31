import { createSplashScreenImage } from './components/splash-screen/splash-screen-canvas.js'
import { isIOS, isIPad, isProd } from './common/platform.js'

export function setupSplashScreenImages() {
  const skipGeneration = isProd && !isIOS()
  if (skipGeneration) {
    console.log('skipping splash screen generation')
    return
  }

  const { width, height } = screen
  const pixelRatio = window.devicePixelRatio ?? 1
  const colorThemes = ['light', 'dark']
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
  const uris = []
  for (const [orientation, { width, height }] of Object.entries(orientations)) {
    for (const colorTheme of colorThemes) {
      const mediaQuery = `screen and (orientation: ${orientation}) and (prefers-color-scheme: ${colorTheme})`

      // iPadOS has a longstanding bug that causes it to use the portrait
      // splash image and stretch it to fit the landscape view.
      // This looks terrible, so we skip drawing the icon on iPad,
      // since the gradient background stretches well & is better
      // than nothing.
      //
      // feel free to remove this hack if / when the underlying bug is fixed.
      // see: https://intercom.help/progressier/en/articles/6755369-why-do-ipad-landscape-splash-screens-look-stretched
      const backgroundOnly = isIPad()

      const dataUri = createSplashScreenImage({
        width,
        height,
        pixelRatio,
        // @ts-expect-error
        colorTheme,
        backgroundOnly,
      })
      console.log('setting splash screen image for', mediaQuery)
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
