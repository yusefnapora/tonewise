export * from './components/index.js'

import { unmuteIosAudio } from './audio/unmute-ios.js'
import { setupColorScheme } from './color-scheme.js'
import { setupServiceWorker } from './worker-setup.js'
import { setupShoelace } from './shoelace.js'
import { setupTouchHighlights } from './common/touch-highlights.js'

unmuteIosAudio()
setupColorScheme()
setupServiceWorker()
setupShoelace()
setupTouchHighlights()
