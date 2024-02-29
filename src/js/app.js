export * from './components/index.js'

import '@shoelace-style/shoelace/dist/components/button/button.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// @ts-expect-error
if (process.env.NODE_ENV === 'production') {
  setBasePath('/shoelace')
}
