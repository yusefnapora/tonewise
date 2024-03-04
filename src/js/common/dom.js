/**
 * Registers a custom element class with the given `tagName`, only
 * if the tag has not already been defined.
 *
 * @template {typeof HTMLElement} T
 * @param {string} tagName
 * @param {T} elementClass
 */
export function registerElement(tagName, elementClass) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, elementClass)
  }
}
