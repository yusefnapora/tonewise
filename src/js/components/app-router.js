import { LitElement, html } from 'lit'
import Navigo from 'navigo'
import { registerElement } from '../common/dom.js'

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
const routes = {
	'/': homeRoute,
	'/index.html': homeRoute,
	'/settings': (_) => html`<h1>settings</h1>`,
	'/game': gameRoute,
}

export class AppRouterElement extends LitElement {

	constructor() {
		super()
		this.content = html`
			<h1>default</h1>
			<a href="settings" data-navigo>settings</a>
		`
	}

	connectedCallback() {
		super.connectedCallback()

		for (const [path, render] of Object.entries(routes)) {
			router.on(path, (match) => { 
				this.content = render(match)
				this.requestUpdate()
			})
		}
		router.resolve()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		for (const path of Object.keys(routes)) {
			router.off(path)
		}
	}

	render() {
		return this.content
	}
}

registerElement('app-router', AppRouterElement)

