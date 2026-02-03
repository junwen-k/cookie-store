# @cookie-store/core

Synchronous cache for the [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API). Mirrors cookies in memory for synchronous reads so framework bindings can stay reactive. This package is internal and not meant for general or public use.

## Scope

This package targets **main thread (document)** usage for UI reactivity only. As the [Cookie Store API docs](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API) state:

> "The `url` option enables the modification of a cookie scoped under a particular URL. Service workers can obtain cookies that would be sent to any URL under their scope. From a document you may only obtain the cookies at the current URL, so the only valid URL in a document context is the document's URL."

The `url` (`CookieStoreGetOptions`) option is strictly for service workers and is omitted from this API.

## Usage

```ts
import { cookieStoreCache } from '@cookie-store/core';

// Sync read
const session = cookieStoreCache.get('session');

// Writes use the native API
await window.cookieStore.set('session', 'token', {
  expires: Date.now() + 86400000,
});
```
