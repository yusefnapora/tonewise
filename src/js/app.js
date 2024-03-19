export * from './components/index.js'

import { unmuteIosAudio } from './audio/unmute-ios.js'
import { setupColorScheme } from './color-scheme.js'
unmuteIosAudio()
setupColorScheme()

import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/card/card.js'
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js'
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js'
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js'
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js'
import '@shoelace-style/shoelace/dist/components/select/select.js'
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js'
import '@shoelace-style/shoelace/dist/components/option/option.js'

import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'

// @ts-expect-error
if (process.env.NODE_ENV === 'production') {
  setBasePath('/shoelace')
} else {
  setBasePath('/node_modules/@shoelace-style/shoelace/dist')
}
