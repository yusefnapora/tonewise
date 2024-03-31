import { isProd } from './common/platform.js'

/** @type {ServiceWorkerRegistration | null} */
let swRegistration = null

export async function setupServiceWorker() {
  if (!('serviceWorker' in navigator) || !isProd) {
    return
  }
  const { Workbox } = await import('workbox-window')
  const wb = new Workbox('/sw.js')

  /** @type {Array<keyof import('workbox-window').WorkboxEventMap>} */
  const eventNames = [
    'activated',
    'activating',
    'controlling',
    'installed',
    'installing',
    'redundant',
    'waiting',
  ]
  for (const n of eventNames) {
    wb.addEventListener(n, (e) => {
      console.log(`service worker event ${n}`, e)
    })
  }
  wb.register().then((registration) => {
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
