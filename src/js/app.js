export * from './components/index.js'

import { unmuteIosAudio } from './audio/unmute-ios.js'
import { setupColorScheme } from './color-scheme.js'
unmuteIosAudio()
setupColorScheme()

// @ts-expect-error process is defined in rollup & not visible to typescript
const isProd = process.env.NODE_ENV === 'production'

import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/card/card.js'
import '@shoelace-style/shoelace/dist/components/icon/icon.js'
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js'
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js'
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js'
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js'
import '@shoelace-style/shoelace/dist/components/select/select.js'
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js'
import '@shoelace-style/shoelace/dist/components/option/option.js'

import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'

if (isProd) {
  setBasePath('/shoelace')
} else {
  setBasePath('/node_modules/@shoelace-style/shoelace/dist')
}

if ('serviceWorker' in navigator && isProd) {
  const { Workbox } = await import('workbox-window')
  const wb = new Workbox('/sw.js')
  wb.register()
}
