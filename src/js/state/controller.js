/**
 * @typedef {import('lit').ReactiveControllerHost} ReactiveControllerHost
 * @typedef {import('./store.js').StateStore} StateStore
 * @typedef {import('./store.js').RootState} RootState
 *
 * @typedef {object} StateListener
 * @property {(state: RootState) => void} [stateChanged]
 *
 * @typedef {(state: RootState, args: any) => any & { lastResult: () => any }} SelectorFn
 */

import { store } from './store.js'

export class StateController {
  /**
   *
   * @param {ReactiveControllerHost & StateListener} host
   */
  constructor(host) {
    this.host = host
    this.store = store
    this.dispatch = store.dispatch

    /** @type {[SelectorFn, any][]} */
    this.selectors = []

    this.lastSelectorResults = []

    /** @type {Function[]} */
    this.unsubscribeFns = []

    host.addController(this)
  }

  get state() {
    return this.store.getState()
  }

  /**
   * @template ResultT
   * @template ArgsT
   *
   * @param {((state: RootState, args: any) => ResultT)} selector
   * @param  {ArgsT} [args]
   */
  select(selector, args) {
    this.selectors.push([selector, args])
    return selector(this.store.getState(), args)
  }

  /**
   * Called when the host is connected to the component tree. For custom
   * element hosts, this corresponds to the `connectedCallback()` lifecycle,
   * which is only called when the component is connected to the document.
   */
  hostConnected() {
    const unsubscribe = this.store.subscribe(() => {
      if (typeof this.host.stateChanged === 'function') {
        this.host.stateChanged(this.store.getState())
        return
      }

      let needsUpdate = false
      for (let i = 0; i < this.selectors.length; i++) {
        const [selector, args] = this.selectors[i]
        const lastResult = this.lastSelectorResults[i]
        const nextResult = selector(this.state, args)
        if (lastResult !== nextResult) {
          needsUpdate = true
        }
      }
      if (needsUpdate) {
        this.host.requestUpdate()
      }
    })
    this.unsubscribeFns.push(unsubscribe)
  }
  /**
   * Called when the host is disconnected from the component tree. For custom
   * element hosts, this corresponds to the `disconnectedCallback()` lifecycle,
   * which is called the host or an ancestor component is disconnected from the
   * document.
   */
  hostDisconnected() {
    this.unsubscribeFns.forEach((unsubscribe) => unsubscribe())
    this.unsubscribeFns = []
  }
  /**
   * Called during the client-side host update, just before the host calls
   * its own update.
   *
   * Code in `update()` can depend on the DOM as it is not called in
   * server-side rendering.
   */
  hostUpdate() {}
  /**
   * Called after a host update, just before the host calls firstUpdated and
   * updated. It is not called in server-side rendering.
   *
   */
  hostUpdated() {}
}
