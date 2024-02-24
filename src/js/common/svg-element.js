// @ts-check

import { createSVGElement, getFloatAttribute } from './dom.js'
import * as Types from './types.js'

const DEFAULT_VIEWBOX = { x: 0, y: 0, w: 1000, h: 1000 }

/**
 * A base class for components that render SVG.
 *
 * Initially adapted from https://jsfiddle.net/WebComponents/3kwn4f7e/
 * and this blog post: https://dev.to/dannyengelman/what-web-technologies-are-required-to-draw-a-pie-chart-in-2021-spoiler-alert-a-standard-web-component-will-do-1j56
 */
export class SVGComponentBase extends HTMLElement {
  /** @type {SVGSVGElement | undefined} */
  svg = undefined

  _viewBox = DEFAULT_VIEWBOX

  /** @type {Types.Rect} */
  get viewBox() {
    return this._viewBox
  }

  set viewBox(rect) {
    this._viewBox = rect
    if (this.svg) {
      this.svg.setAttribute('viewBox', `${rect.x} ${rect.y} ${rect.w} ${rect.h}`)
    }
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })
    const styles = new CSSStyleSheet()
    styles.replaceSync(`
      :host {
        display: flex;
        justify-content: center;
        width: 100%;
        height: 100%;
        flex: 0 0 auto;
      }    
    `)
    shadow.adoptedStyleSheets = [ styles ]
    
    // render on the next tick, so our child elements are parsed first
    setTimeout(() => {
      this.initSVGRoot()
      this.render()
    })
  }

  /**
   * Creates the root `<svg>` element and stores a reference to it at
   * `this.svg`. If any of our children are also subclasses of SVGComponentBase,
   * we nest them inside of our <svg> element using a <slot> wrapped in an
   * SVG <foreignObject> tag (see {@link slotIntoParentSVGComponent})
   *
   * @returns {SVGSVGElement}
   */
  initSVGRoot() {
    if (this.svg) {
      return this.svg
    }

    // subclasses can override the default viewBox by setting this.viewBox
    // before `super.render()`
    if (!this.viewBox) {
      this.viewBox = DEFAULT_VIEWBOX
    }

    const { x, y, w, h } = this.viewBox
    const viewBox = `${x} ${y} ${w} ${h}`
    this.svg = createSVGElement({
      tag: 'svg',
      attributes: { viewBox, xmlns: 'http://www.w3.org/2000/svg' },
    })


    this.shadowRoot?.appendChild(this.svg)

    let slotId = 0
    for (const child of this.childNodes) {
      if (!(child instanceof SVGComponentBase)) {
        continue
      }
      const slotName = `slot-${slotId}`
      child.slotIntoParentSVGComponent(this, slotName)
      slotId++
    }

    return this.svg
  }

  /**
   * Adds this components `<svg>` element to the `parent` component.
   * 
   * The way this works is weird, but it allows each component to
   * maintain their own shadow DOM, which lets you use CSS :part selectors
   * on each nested component.
   * 
   * Basically, we set the `slot` attribute on our own <svg> element to
   * the given `slotName`, and append a `<slot>` tag wrapped in an SVG
   * `<foreignElement>` tag to the parent's `<svg>` element.
   * 
   * The `<foreignElement>` has its dimensions set to cover the entire
   * viewBox of the parent SVG, but has `pointer-events: none` set so
   * that it doesn't eat all mouse clicks and prevent them from reaching
   * the parent.
   * @param {SVGComponentBase} parent
   * @param {string} slotName
   */
  slotIntoParentSVGComponent(parent, slotName) {
    if (!parent.svg) {
      return
    }

    const { x, y, w, h } = parent.viewBox
    const foreignObject = createSVGElement({
      tag: 'foreignObject',
      attributes: {
        x,
        y,
        width: w,
        height: h,
        'pointer-events': 'none',
      }
    })
    const slot = document.createElement('slot')
    slot.setAttribute('name', slotName)
    foreignObject.appendChild(slot)
    parent.svg.appendChild(foreignObject)

    this.viewBox = parent.viewBox
    this.setAttribute('slot', slotName)
  }

  render() {
    if (!this.svg) {
      this.svg = this.initSVGRoot()
    }

    const groupId = 'main-content'
    const group = createSVGElement({
      tag: 'g',
      attributes: {
        id: groupId,
        'pointer-events': 'visiblePainted',
      },
    })

    this.renderContent(group)

    const existing = this.svg.querySelector(`#${groupId}`)
    if (existing) {
      this.svg.replaceChild(group, existing)
    } else {
      this.svg.prepend(group)
    }
  }

  /**
   * Render content for this element to the provided SVG `<g>` element.
   *
   * @param {SVGGElement} group
   */
  renderContent(group) {}

  /**
   * @param {string} name
   * @returns {number|undefined}
   */
  getFloatAttribute(name) {
    return getFloatAttribute(this, name) 
  }
}

