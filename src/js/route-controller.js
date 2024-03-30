import { html } from 'lit'
import Navigo from 'navigo'
import defaultRoutes, { hooks } from './routes.js'

// @ts-expect-error
const APP_BASE_PATH = process.env.NODE_ENV === 'development' ? '/src' : '/'

/** @type {Navigo.default} */
// @ts-expect-error
export const sharedRouter = new Navigo(APP_BASE_PATH)

export const { navigate } = sharedRouter

/** @param {Event} e */
export const navLinkClicked = (e) => {
  e.preventDefault()
  console.log('navlink clicked', e, e.target)
  if (typeof e.target['href'] !== 'string') {
    return
  }
  navigate(e.target['href'])
}

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
    /** @type {Function[]} */
    this.unhookFns = []
    host.addController(this)
  }

  hostConnected() {
    for (const [path, render] of Object.entries(this.routes)) {
      this.router.on(path, (match) => {
        this.content = render(match)
        this.host.requestUpdate()
      })

      const trimmedPath = path.replace(/^\//, '')
      const routeHooks = hooks[trimmedPath] ?? hooks[path]
      if (routeHooks?.enter) {
        const unhook = this.router.addAfterHook(trimmedPath, routeHooks.enter)
        this.unhookFns.push(unhook)
      }
      if (routeHooks?.leave) {
        const unhook = this.router.addLeaveHook(trimmedPath, routeHooks.leave)
        this.unhookFns.push(unhook)
      }
    }
    this.router.resolve()
  }

  hostDisconnected() {
    for (const path of Object.keys(this.routes)) {
      this.router.off(path)
    }
    for (const unhook of this.unhookFns) {
      unhook()
    }
  }
}
