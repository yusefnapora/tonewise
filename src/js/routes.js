import { html } from 'lit'
import { dispatch } from './state/store.js'
import { setGameMode } from './state/slices/game-slice.js'
import { endGame } from './state/sequences/game-sequences.js'

/**
 * @typedef {import('./route-controller.js').RouteHandler} RouteHandler
 */

/** @type {RouteHandler} */
const homeRoute = (_) => html`<welcome-view></welcome-view>`

const aboutRoute = (_) => html`<about-view></about-view>`

/** @type {RouteHandler} */
const playGameRoute = (_) => html`<game-view></game-view>`

const freePlayRoute = () => html`<game-view free-play></game-view>`

/** @type {RouteHandler} */
const settingsRoute = (_) => html`<settings-view></settings-view>`

/**
 * @typedef {{ enter?: Function, leave?: Function }} RouteHooks
 */

/**
 * @type {Record<string, RouteHooks>}
 */
export const hooks = {
  play: {
    enter() {
      console.log('setting mode to challenge')
      dispatch(setGameMode('challenge'))
    },
  },
  'free-play': {
    enter() {
      console.log('setting mode to free-play')
      endGame(dispatch)
      dispatch(setGameMode('free-play'))
    },
  },
}

/** @type {Record<string, RouteHandler>} */
export default {
  '/': homeRoute,
  '/index.html': homeRoute,
  '/about': aboutRoute,
  '/settings': settingsRoute,
  '/play': playGameRoute,
  '/free-play': freePlayRoute,
  '/icon-sandbox': () => html`<icon-sandbox></icon-sandbox>`,
}
