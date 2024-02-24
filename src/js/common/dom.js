
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

/**
 * Creates an element in the SVG XML namespace with the given `tag`
 * and `attributes`.
 *
 * If an attribute value is of type `function`,
 * it will be assigned as a value on the element itself,
 * to support setting event handlers.
 *
 * All other attributes will be set using `SVGElement.setAttribute`.
 *
 * @template {keyof SVGElementTagNameMap} K
 *
 * @param {object} args
 * @param {K} args.tag tag name of element to create, e.g. 'svg', 'line', 'circle', etc.
 * @param {Record<string, string|number|Function|null|undefined>} [args.attributes] map of attribute names to values
 * @param {string} [args.innerHTML] optional value for element.innerHTML
 *
 * @returns {SVGElementTagNameMap[K]}
 */
export function createSVGElement(args) {
  const { tag } = args
  const attributes = args.attributes ?? {}
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag)
  for (const [key, val] of Object.entries(attributes)) {
    if (val == null) {
      continue
    }

    if (typeof val === 'function') {
      element[key] = val
    } else {
      element.setAttribute(key, val.toString())
    }
  }
  if (args.innerHTML) {
    element.innerHTML = args.innerHTML
  }
  return element
}


/**
 * Returns the value of the attribute on `element` with the given `name`
 * as a floating point number. Returns `undefined` if the attribute does
 * not exist or cannot be parsed as a float.
 * 
 * @param {Element} element
 * @param {string} name
 * @returns {number|undefined}
 */
export function getFloatAttribute(element, name) {
  const s = element.getAttribute(name)
  if (s) {
    const n = Number.parseFloat(s)
    if (!Number.isNaN(n)) {
      return n
    }
    console.warn(`invalid float value for ${name}`)
  }
  return undefined
}

/**
 * @template {HTMLElement} T
 * @template {new () => T} Constructor
 * @template {InstanceType<Constructor>} Instance
 * @param {Element} element
 * @param {Constructor} ctor
 * @returns {Instance[]} 
 */
export function getChildrenOfType(element, ctor) {
  const children = []
  for (const c of element.children) {
    if (c instanceof ctor) {
      children.push(c)
    }
  }
  return children
}

/**
 * @template {HTMLElement} T
 * @template {new () => T} Constructor
 * @template {InstanceType<Constructor>} Instance 
 * @param {Element} element
 * @param {Constructor} ctor
 * @returns {Instance | undefined} 
*/
export function getChildOfType(element, ctor) {
  const children = getChildrenOfType(element, ctor)
  if (children.length === 0) {
    return
  }
  return children[0]
}

/**
 * @template {HTMLElement} T
 * @template {new () => T} Constructor
 * @template {InstanceType<Constructor>} Instance
 * @param {Element} element
 * @param {Constructor} ctor
 * @returns {Instance} 
 */
export function getOrCreateChildOfClass(element, ctor) {
  const existing = getChildOfType(element, ctor)
  if (existing) {
    return existing
  }
  const child = new ctor()
  element.appendChild(child)
  return child
}

/**
 * Like Element.textContent, but returns only the content of a single Text node
 * that's a direct child of the given Element.
 * 
 * @param {Element} element
 * @returns {string | undefined} The text content of the node itself, ignoring children, or `undefined` if the node has no text content.
 */
export function getShallowTextContent(element) {
  for (const node of element.childNodes) {
    if (node instanceof Text) {
      return node.wholeText
    }
  }
}