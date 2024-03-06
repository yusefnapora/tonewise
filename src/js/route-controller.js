import { html } from 'lit'
import Navigo from 'navigo'
import defaultRoutes from './routes.js'

// @ts-expect-error
const APP_BASE_PATH = process.env.NODE_ENV === 'development' ? '/src' : '/'

/** @type {Navigo.default} */
// @ts-expect-error
export const sharedRouter = new Navigo(APP_BASE_PATH)

/**
 * @typedef {(match: Navigo.Match) => import('lit').TemplateResult<1>} RouteHandler
 * @typedef {import('lit').ReactiveControllerHost} ReactiveControllerHost
 */

export class RouteController {
  /** 
	 * @param {ReactiveControllerHost} host
	 * @param {Record<string, RouteHandler>} routes
	 * @param {Navigo.default} router
	 **/
  constructor(host, routes = defaultRoutes, router = sharedRouter) {
    this.host = host
		this.router = router
		this.routes = routes
		this.content = html``
		host.addController(this)
  }

  hostConnected() {
    for (const [path, render] of Object.entries(this.routes)) {
			this.router.on(path, (match) => {
				this.content = render(match)
				this.host.requestUpdate()
			})
		}
		this.router.resolve()
  }

  hostDisconnected() {
		for (const path of Object.keys(this.routes)) {
			this.router.off(path)
		}
  }
}