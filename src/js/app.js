export * from './components/index.js'

import { unmuteIosAudio } from './audio/unmute-ios.js'
import { setupColorScheme } from './color-scheme.js'
unmuteIosAudio()
setupColorScheme()

// @ts-expect-error process is defined in rollup & not visible to typescript
const isProd = process.env.NODE_ENV === 'production'

import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/button-group/button-group.js'
import '@shoelace-style/shoelace/dist/components/card/card.js'
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js'
import '@shoelace-style/shoelace/dist/components/icon/icon.js'
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js'
import '@shoelace-style/shoelace/dist/components/menu/menu.js'
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js'
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js'
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js'
import '@shoelace-style/shoelace/dist/components/select/select.js'
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js'
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js'
import '@shoelace-style/shoelace/dist/components/option/option.js'

import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'
setBasePath('/')

/** @type {ServiceWorkerRegistration | null} */
let swRegistration = null

if ('serviceWorker' in navigator && isProd) {
  const { Workbox } = await import('workbox-window')
  const wb = new Workbox('/sw.js')

  /** @type {Array<keyof import('workbox-window').WorkboxEventMap>} */
  const eventNames = ['activated', 'activating', 'controlling', 'installed', 'installing', 'redundant', 'waiting']
  for (const n of eventNames) {
    wb.addEventListener(n, (e) => {
      console.log(`service worker event ${n}`, e)
    })
  }
  wb.register()
    .then(registration => {
      swRegistration = registration
    })
  wb.update()
}

export async function unregisterServiceWorker() {
  if (!swRegistration) {
    return
  }
  console.log('unregistering service worker')
  try {
    const success = swRegistration.unregister()
    if (success) {
      console.log('unregistered service worker successfully')
    } else {
      console.log('service worker unregister failed')
    }
  } catch (e) {
    console.error('error unregistering service worker:', e)
  }
}
