import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTag, buildBootstrap, buildAttrs } from '../build-tag.js'

test('valid key: tag contains the widget src, key and defer', () => {
  const { tag, warnings } = buildTag({ widgetKey: 'pub_abc12345' })
  assert.ok(tag)
  assert.match(tag, /src="https:\/\/deskcrew\.io\/desk\.js"/)
  assert.match(tag, /data-key="pub_abc12345"/)
  assert.match(tag, /\bdefer\b/)
  assert.equal(warnings.length, 0)
})

test('optional attributes are included when provided', () => {
  const { tag } = buildTag({
    widgetKey: 'pub_abc12345',
    board: 'acme',
    color: '#4f46e5',
    position: 'left',
    greeting: 'Hi there!',
  })
  assert.match(tag, /data-board="acme"/)
  assert.match(tag, /data-color="#4f46e5"/)
  assert.match(tag, /data-position="left"/)
  assert.match(tag, /data-greeting="Hi there!"/)
})

test('optional attributes are omitted when not provided', () => {
  const { tag } = buildTag({ widgetKey: 'pub_abc12345' })
  assert.doesNotMatch(tag, /data-board/)
  assert.doesNotMatch(tag, /data-color/)
  assert.doesNotMatch(tag, /data-position/)
  assert.doesNotMatch(tag, /data-greeting/)
})

test('malformed or missing key: no tag and a warning', () => {
  const bad = buildTag({ widgetKey: 'nope' })
  assert.equal(bad.tag, null)
  assert.ok(bad.warnings.length > 0)

  const missing = buildTag({})
  assert.equal(missing.tag, null)
  assert.ok(missing.warnings.length > 0)

  assert.equal(buildAttrs({ widgetKey: 'pub_short' }).attrs, null) // 5 chars < 8
})

test('invalid optional values are dropped with a warning, tag still renders', () => {
  const { tag, warnings } = buildTag({ widgetKey: 'pub_abc12345', color: 'red', position: 'top' })
  assert.ok(tag)
  assert.doesNotMatch(tag, /data-color/)
  assert.doesNotMatch(tag, /data-position/)
  assert.ok(warnings.length >= 2)
})

test('greeting is HTML-escaped in the tag', () => {
  const { tag } = buildTag({ widgetKey: 'pub_abc12345', greeting: 'Hi "you" & <them>' })
  assert.match(tag, /data-greeting="Hi &quot;you&quot; &amp; &lt;them&gt;"/)
})

test('astro bootstrap references the src, key and defer, and cannot break out of the script', () => {
  const { code } = buildBootstrap({ widgetKey: 'pub_abc12345', greeting: '</script><img src=x>' })
  assert.ok(code)
  assert.ok(code.includes('https://deskcrew.io/desk.js'))
  assert.ok(code.includes('pub_abc12345'))
  assert.ok(code.includes('s.defer = true'))
  assert.ok(!code.includes('</script>'))

  assert.equal(buildBootstrap({ widgetKey: 'bad' }).code, null)
})
