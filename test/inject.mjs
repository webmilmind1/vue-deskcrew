import test from 'node:test'
import assert from 'node:assert/strict'
import { injectDeskcrew, deskcrew } from '../index.js'

function fakeDocument() {
  const head = {
    children: [],
    appendChild(el) {
      this.children.push(el)
    },
  }
  return {
    head,
    querySelector(sel) {
      return head.children.find((el) => sel.includes(el.src)) || null
    },
    createElement() {
      return {
        attrs: {},
        setAttribute(k, v) {
          this.attrs[k] = v
        },
      }
    },
  }
}

test('injects once into document.head with the widget attributes', () => {
  globalThis.document = fakeDocument()
  assert.equal(injectDeskcrew({ widgetKey: 'pub_abc12345', board: 'acme' }), true)
  assert.equal(injectDeskcrew({ widgetKey: 'pub_abc12345', board: 'acme' }), true)
  assert.equal(document.head.children.length, 1)
  const el = document.head.children[0]
  assert.equal(el.src, 'https://deskcrew.io/desk.js')
  assert.equal(el.attrs['data-key'], 'pub_abc12345')
  assert.equal(el.attrs['data-board'], 'acme')
  assert.equal(el.defer, true)
  delete globalThis.document
})

test('no document (server) is a no-op', () => {
  delete globalThis.document
  assert.equal(injectDeskcrew({ widgetKey: 'pub_abc12345' }), false)
})

test('plugin install injects and exposes $deskcrew', () => {
  globalThis.document = fakeDocument()
  const app = { config: { globalProperties: {} } }
  deskcrew.install(app, { widgetKey: 'pub_abc12345' })
  assert.equal(document.head.children.length, 1)
  assert.equal(typeof app.config.globalProperties.$deskcrew.inject, 'function')
  delete globalThis.document
})
