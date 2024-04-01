import { store } from '../state/store.js'

/** @param {PointerEvent} e */
const pointerDown = (e) => {
  if (e.target instanceof HTMLElement) {
    e.target.releasePointerCapture(e.pointerId)
  }
  const indicator = document.createElement('div')
  indicator.id = `indicator-${e.pointerId}`
  indicator.classList.add('touch-indicator')
  document.body.appendChild(indicator)
  const transform = `translate(${e.clientX}px, ${e.clientY}px)`
  indicator.style.setProperty('--indicator-transform', transform)
}

/** @param {PointerEvent} e */
const pointerMove = (e) => {
  const indicatorId = `indicator-${e.pointerId}`
  /** @type {HTMLElement | undefined} */
  const indicator = document.body.querySelector(`#${indicatorId}`)
  const transform = `translate(${e.clientX}px, ${e.clientY}px)`
  indicator?.style.setProperty('--indicator-transform', transform)
}

/** @param {PointerEvent} e */
const pointerUpOrCancel = (e) => {
  const indicatorId = `indicator-${e.pointerId}`
  /** @type {HTMLElement | undefined} */
  const indicator = document.body.querySelector(`#${indicatorId}`)
  if (indicator) {
    document.body.removeChild(indicator)
  }
}

function addEventListeners() {
  document.body.addEventListener('pointerdown', pointerDown)
  document.body.addEventListener('pointermove', pointerMove)

  for (const event of ['pointerup', 'pointercancel']) {
    document.body.addEventListener(event, pointerUpOrCancel)
  }
}

function removeEventListeners() {
  document.body.removeEventListener('pointerdown', pointerDown)
  document.body.removeEventListener('pointermove', pointerMove)

  for (const event of ['pointerup', 'pointercancel']) {
    document.body.removeEventListener(event, pointerUpOrCancel)
  }
}

/** @param {import('../state/store.js').RootState} state */
function handleState(state) {
  if (state.preferences.showTouchHighlights === true) {
    addEventListeners()
  } else {
    removeEventListeners()
    for (const indicator of document.body.querySelectorAll('touch-indicator')) {
      document.body.removeChild(indicator)
    }
  }
}

export function setupTouchHighlights() {
  store.subscribe(() => {
    handleState(store.getState())
  })
  handleState(store.getState())
}
