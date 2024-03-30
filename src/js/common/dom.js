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
 * @param {string} dark
 * @param {string} [light]
 */
export function setMetaThemeColors(dark, light) {
  light = light ?? dark

  const lightMeta = document.querySelector(
    'meta[name="theme-color"]:not([media])',
  )
  const darkMeta = document.querySelector(
    'meta[name="theme-color"][media="(prefers-color-scheme: dark)"]',
  )

  lightMeta?.setAttribute('content', light)
  darkMeta?.setAttribute('content', dark)
}

/**
 * @param {string} str
 * @param {Element} [scope]
 */
export function resolveCSSVariables(str, scope) {
  scope = scope ?? document.body

  const matches = [...str.matchAll(/var\((--.*?)\)/g)]
  if (matches.length === 0) {
    return str
  }
  const style = window.getComputedStyle(scope)
  let res = str
  for (const m of matches) {
    const [key, defaultVal] = m[1].split(',')
    const val = style.getPropertyValue(key) || defaultVal
    res = res.replace(m[0], val)
  }
  return res
}

/**
 * @param {(key?: 'enter' | 'space') => unknown} callback
 */
export function keyboardActivationEventListener(callback) {
  /** @param {KeyboardEvent} e */
  return function (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      return callback('enter')
    }
    if (e.key === ' ') {
      e.preventDefault()
      return callback('space')
    }
  }
}
