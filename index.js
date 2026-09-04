import { buildAttrs } from './build-tag.js'

/** Add the widget <script> to the document once. Safe to call more than once. No-op on the server. */
export function injectDeskcrew(options) {
  if (typeof document === 'undefined') return false
  const { attrs, warnings } = buildAttrs(options)
  for (const message of warnings) console.warn(message)
  if (!attrs) return false
  if (document.querySelector('script[src="https://deskcrew.io/desk.js"]')) return true
  const s = document.createElement('script')
  for (const [name, value] of attrs) {
    if (name === 'src') s.src = value
    else s.setAttribute(name, value)
  }
  s.defer = true
  document.head.appendChild(s)
  return true
}

/**
 * app.use(deskcrew, { widgetKey: 'pub_...' }) in main.js. Injects the widget when the
 * app is created in the browser; on the server (SSR) it does nothing and the client
 * side of the same app injects it on hydration.
 */
export const deskcrew = {
  install(app, options) {
    injectDeskcrew(options)
    app.config.globalProperties.$deskcrew = { inject: () => injectDeskcrew(options) }
  },
}

/** <DeskCrewWidget widget-key="pub_..." /> renders nothing and injects the script on mount. */
export const DeskCrewWidget = {
  name: 'DeskCrewWidget',
  props: {
    widgetKey: { type: String, required: true },
    board: String,
    color: String,
    position: String,
    greeting: String,
  },
  mounted() {
    injectDeskcrew({
      widgetKey: this.widgetKey,
      board: this.board,
      color: this.color,
      position: this.position,
      greeting: this.greeting,
    })
  },
  render() {
    return null
  },
}

export default deskcrew
export { buildTag } from './build-tag.js'
