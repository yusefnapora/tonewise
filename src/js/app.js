export * from './components/index.js'

import { unmuteIosAudio } from './audio/unmute-ios.js'
import { setupColorScheme } from './color-scheme.js'
unmuteIosAudio()
setupColorScheme()

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
import '@shoelace-style/shoelace/dist/components/visually-hidden/visually-hidden.js'

import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'
import { setupServiceWorker } from './worker-setup.js'
setBasePath('/')

setupServiceWorker()
