# @deskcrew/vue

![DeskCrew widget for vue: install @deskcrew/vue, one import, live chat and tickets on every page](https://deskcrew.io/packages/deskcrew-vue.gif)

Add the [DeskCrew](https://deskcrew.io) support widget to a Vue 3 app: live chat, AI answers grounded in your knowledge base, and a help center. A plugin for `main.js` or a component for a layout; either way one script tag, isolated in a Shadow DOM.

## Install

```
npm install @deskcrew/vue
```

As a plugin, in `src/main.js`:

```js
import { createApp } from 'vue'
import deskcrew from '@deskcrew/vue'
import App from './App.vue'

createApp(App)
  .use(deskcrew, { widgetKey: 'pub_your_widget_key', board: 'your-board' })
  .mount('#app')
```

Or as a component, anywhere in a layout that renders once:

```vue
<script setup>
import { DeskCrewWidget } from '@deskcrew/vue'
</script>

<template>
  <DeskCrewWidget widget-key="pub_your_widget_key" board="your-board" />
</template>
```

Get the key from the Install page of your DeskCrew dashboard. With SSR (Nuxt, Vite SSR) the server does nothing and the client injects the widget on hydration; Nuxt users can use `@deskcrew/nuxt` instead.

## What you get

- **AI answers grounded in your own help articles.** The assistant only answers from the knowledge base you publish, so it cannot invent product facts.
- **A human approves before anything sends.** Every AI draft waits in an approval queue. Nothing reaches a customer unreviewed.
- **Every conversation becomes a ticket.** Widget chats, emails and board posts land in one dashboard with full history.
- **Visitors who leave still get answered.** Leave an email address and the reply arrives by email.

## Options

| Option      | Required | Notes                                                                                |
| ----------- | -------- | ------------------------------------------------------------------------------------ |
| `widgetKey` | yes      | Your public widget key, `pub_...`, from the Install page of your DeskCrew dashboard. |
| `board`     | no       | Your board slug (lowercase letters, numbers, dashes). Enables the feedback link.     |
| `color`     | no       | Accent colour as a 6-digit hex value, e.g. `#4f46e5`.                                |
| `position`  | no       | `right` (default) or `left`.                                                         |
| `greeting`  | no       | First line the launcher shows.                                                       |

Invalid optional values are dropped with a console warning; a missing or malformed key means the widget is not added at all, so a bad config can never put arbitrary markup on your page.

## Privacy

The only thing this package adds to your site is one `<script>` tag that loads `https://deskcrew.io/desk.js` with your public key. The widget runs inside a Shadow DOM and does not touch your styles. Terms: https://deskcrew.io/terms. Privacy: https://deskcrew.io/privacy.

## Contributing

Issues and pull requests are welcome at https://github.com/webmilmind1/vue-deskcrew. Run `npm test` before opening a PR; the suite covers the tag builder, the plugin and the component. Keep the package dependency-free (it emits one script tag) and note any option change in the Options table above.

## License

MIT
