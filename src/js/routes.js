import { html } from 'lit'
import Navigo from 'navigo'

// @ts-expect-error
const APP_BASE_PATH = process.env.NODE_ENV === 'development' ? '/src' : '/'

/** @type {Navigo.default} */
// @ts-expect-error
export const router = new Navigo(APP_BASE_PATH)

/**
 * @typedef {(match: Navigo.Match) => import('lit').TemplateResult<1>} RouteHandler
 */

/** @type {RouteHandler} */
const homeRoute = (_) => html`
  <h1>home</h1>
	<a href="settings" data-navigo>settings</a>
	`

const gameRoute = (_) => html`
	<game-view></game-view>
`

/** @type {Record<string, RouteHandler>} */
export const routes = {
	'/': homeRoute,
	'/index.html': homeRoute,
	'/settings': (_) => html`<h1>settings</h1>`,
	'/game': gameRoute,
}

/**
 * @typedef {import('lit').ReactiveControllerHost} ReactiveControllerHost
 */

export class RouteController {
  /** @param {ReactiveControllerHost} host  */
  constructor(host) {
    this.host = host
  }

  hostConnected() {
    for (const [path, render] of Object.entries(routes)) {
			router.on(path, (match) => { 
				this.content = render(match)
				this.host.requestUpdate()
			})
		}
		router.resolve()
  }

  hostDisconnected() {

  }
}