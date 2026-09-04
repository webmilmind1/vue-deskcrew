// Framework-agnostic core for the DeskCrew widget packages.
//
// Everything here is a pure function of its options: no Astro imports, no I/O,
// so it can be unit-tested on its own (see test/build-tag.mjs).

/** The canonical DeskCrew widget bundle. desk.js derives its API origin from this src. */
export const WIDGET_SRC = 'https://deskcrew.io/desk.js'

// Strict shapes: a value is only ever placed into markup after it matches one of
// these, so nothing arbitrary can reach the page.
const KEY_RE = /^pub_[A-Za-z0-9]{8,64}$/
const BOARD_RE = /^[a-z0-9-]+$/
const COLOR_RE = /^#[0-9a-fA-F]{6}$/
const POSITIONS = new Set(['left', 'right'])

/**
 * Validate options and produce the ordered [name, value] attribute list for the
 * widget <script>. Returns `{ attrs: null }` (nothing should be injected) when
 * the widget key is missing or malformed; invalid *optional* values are dropped
 * with a warning but never block the widget.
 *
 * @param {Record<string, unknown> | undefined | null} options
 * @returns {{ attrs: string[][] | null, warnings: string[] }}
 */
export function buildAttrs(options) {
  const warnings = []
  const opts = options || {}

  const key = typeof opts.widgetKey === 'string' ? opts.widgetKey.trim() : ''
  if (!key) {
    warnings.push(
      '[deskcrew] No widgetKey was provided. The support widget was NOT added. ' +
        'Copy your pub_ key from https://deskcrew.io/dashboard/install.',
    )
    return { attrs: null, warnings }
  }
  if (!KEY_RE.test(key)) {
    warnings.push(
      `[deskcrew] widgetKey "${key}" is not a valid public key (expected pub_...). ` +
        'the support widget was NOT added.',
    )
    return { attrs: null, warnings }
  }

  const attrs = [
    ['src', WIDGET_SRC],
    ['data-key', key],
  ]

  const board = typeof opts.board === 'string' ? opts.board.trim() : ''
  if (board) {
    if (BOARD_RE.test(board)) attrs.push(['data-board', board])
    else
      warnings.push(`[deskcrew] board "${board}" is not a valid slug (a-z, 0-9, dashes). Ignored.`)
  }

  const color = typeof opts.color === 'string' ? opts.color.trim() : ''
  if (color) {
    if (COLOR_RE.test(color)) attrs.push(['data-color', color])
    else
      warnings.push(`[deskcrew] color "${color}" is not a 6-digit hex value like #4f46e5. Ignored.`)
  }

  const position = typeof opts.position === 'string' ? opts.position.trim() : ''
  if (position) {
    if (POSITIONS.has(position)) attrs.push(['data-position', position])
    else warnings.push(`[deskcrew] position "${position}" must be "left" or "right". Ignored.`)
  }

  const greeting = typeof opts.greeting === 'string' ? opts.greeting.trim() : ''
  if (greeting) attrs.push(['data-greeting', greeting])

  return { attrs, warnings }
}

/**
 * Escape a value for use inside a double-quoted HTML attribute.
 * @param {unknown} value
 */
function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Build the canonical `<script ...>` tag string for the widget (handy for
 * debugging or manual placement), or `null` when options are invalid.
 *
 * @param {Record<string, unknown> | undefined | null} options
 * @returns {{ tag: string | null, warnings: string[] }}
 */
export function buildTag(options) {
  const { attrs, warnings } = buildAttrs(options)
  if (!attrs) return { tag: null, warnings }
  const rendered = attrs.map(([name, value]) => `${name}="${escapeHtmlAttr(value)}"`).join(' ')
  return { tag: `<script ${rendered} defer></script>`, warnings }
}

/**
 * Escape a string for safe embedding as a JS literal inside an inline <script>.
 * `<`, `>` and `&` are escaped so a value can never close the inline script tag.
 * @param {unknown} value
 */
function jsLiteral(value) {
  return JSON.stringify(String(value))
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

/**
 * Astro's `injectScript('head-inline', ...)` takes JS, not a raw external tag,
 * so we emit a tiny bootstrap that creates the widget <script> element and
 * appends it. Returns `{ code: null }` when options are invalid.
 *
 * @param {Record<string, unknown> | undefined | null} options
 * @returns {{ code: string | null, warnings: string[] }}
 */
export function buildBootstrap(options) {
  const { attrs, warnings } = buildAttrs(options)
  if (!attrs) return { code: null, warnings }

  const dataLines = attrs
    .filter(([name]) => name !== 'src')
    .map(([name, value]) => `  s.setAttribute(${jsLiteral(name)}, ${jsLiteral(value)});`)
    .join('\n')

  const guard = `script[src=${JSON.stringify(WIDGET_SRC)}]`
  const code =
    '(function () {\n' +
    `  if (document.querySelector(${jsLiteral(guard)})) return;\n` +
    '  var s = document.createElement("script");\n' +
    `  s.src = ${jsLiteral(WIDGET_SRC)};\n` +
    '  s.defer = true;\n' +
    (dataLines ? dataLines + '\n' : '') +
    '  document.head.appendChild(s);\n' +
    '})();'

  return { code, warnings }
}
