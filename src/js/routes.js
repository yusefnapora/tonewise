import { html } from 'lit'

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

/** @type {Record<string, RouteHandler>} */
export default {
  '/': homeRoute,
  '/index.html': homeRoute,
  '/about': aboutRoute,
  '/settings': settingsRoute,
  '/play': playGameRoute,
  '/free-play': freePlayRoute,
  '/icon-sandbox': () => html`<icon-sandbox></icon-sandbox>`
}
