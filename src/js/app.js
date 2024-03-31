export * from './components/index.js'

import { unmuteIosAudio } from './audio/unmute-ios.js'
import { setupColorScheme } from './color-scheme.js'
import { setupServiceWorker } from './worker-setup.js'
import { setupShoelace } from './shoelace.js'

unmuteIosAudio()
setupColorScheme()
setupServiceWorker()
setupShoelace()

// todo: move this elsewhere once it works
const simulateTouchHighlight = true // todo: add debug setting
function setupTouchHighlights() {
  if (!simulateTouchHighlight) {
    return
  }

  document.body.addEventListener('pointerdown', (e) => {
    if (e.target instanceof HTMLElement) {
      e.target.releasePointerCapture(e.pointerId)
    }
    const indicator = document.createElement('div')
    indicator.id = `indicator-${e.pointerId}`
    indicator.classList.add('touch-indicator')
    document.body.appendChild(indicator)
    const transform = `translate(${e.clientX}px, ${e.clientY}px)`
    indicator.style.setProperty('--indicator-transform', transform)
    console.log('pointerdown', { indicator })
  })

  document.body.addEventListener('pointermove', (e) => {
    const indicatorId = `indicator-${e.pointerId}`
    /** @type {HTMLElement | undefined} */
    const indicator = document.body.querySelector(`#${indicatorId}`)
    const transform = `translate(${e.clientX}px, ${e.clientY}px)`
    indicator?.style.setProperty('--indicator-transform', transform)
  })

  for (const event of ['pointerup', 'pointercancel']) {
    document.body.addEventListener(event, (e) => {
      // @ts-expect-error
      const indicatorId = `indicator-${e.pointerId}`
      /** @type {HTMLElement | undefined} */
      const indicator = document.body.querySelector(`#${indicatorId}`)
      if (indicator) {
        document.body.removeChild(indicator)
      }
    })
  }
}

setupTouchHighlights()
