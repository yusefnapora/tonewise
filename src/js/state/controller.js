
/**
 * @typedef {import('lit').ReactiveControllerHost} ReactiveControllerHost
 * @typedef {import('./store.js').StateStore} StateStore
 * @typedef {import('./store.js').RootState} RootState
 *
 * @typedef {object} StateListener 
 * @property {(RootState) => void} stateChanged
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

    host.addController(this)
  }



  /**
   * Called when the host is connected to the component tree. For custom
   * element hosts, this corresponds to the `connectedCallback()` lifecycle,
   * which is only called when the component is connected to the document.
   */
  hostConnected() {
    this.store.subscribe(() => {
      this.host.stateChanged(this.store.getState())
    })
  }
  /**
   * Called when the host is disconnected from the component tree. For custom
   * element hosts, this corresponds to the `disconnectedCallback()` lifecycle,
   * which is called the host or an ancestor component is disconnected from the
   * document.
   */
  hostDisconnected() {}
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