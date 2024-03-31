import { createSplashScreenImage } from './components/splash-screen/splash-screen-canvas.js'

export function setupSplashScreenImages() {
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
  for (const [orientation, { width, height }] of Object.entries(orientations)) {
    for (const colorTheme of colorThemes) {
      const mediaQuery = `screen and (orientation: ${orientation}) and (prefers-color-scheme: ${colorTheme})`
      const dataUri = createSplashScreenImage({
        width,
        height,
        pixelRatio,
        // @ts-expect-error
        colorTheme,
      })
      console.log('setting splash screen image for', mediaQuery)
      const link = document.createElement('link')
      link.setAttribute('rel', 'apple-touch-startup-image')
      link.setAttribute('media', mediaQuery)
      link.setAttribute('href', dataUri)
      document.head.appendChild(link)
    }
  }
}
