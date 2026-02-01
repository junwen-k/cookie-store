# @cookie-store/core

Core synchronous cache for [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API). Enables idiomatic reactive bindings across frameworks by providing synchronous read access to cookies.

## Philosophy

This package provides a **thin synchronous adapter** over the native Cookie Store API. It doesn't add features or replace the native API—it simply mirrors cookies in memory to enable synchronous reads, which most reactive frameworks expect.

**Native + Idiomatic**: Works with native browser API while being idiomatic to each framework's reactive patterns.

## Installation

```bash
npm install @cookie-store/core
```

## Usage

```typescript
import { cookieCache, cookieStore } from '@cookie-store/core';

// Synchronous read from cache
const sessionCookie = cookieCache.get('session');
console.log(sessionCookie?.value);

// Write using native API
await cookieStore.set('session', 'token123', {
  expires: Date.now() + 86400000,
  secure: true,
  sameSite: 'strict',
});

// Subscribe to changes
const unsubscribe = cookieCache.subscribe(() => {
  console.log('Cookies changed!');
  const updated = cookieCache.get('session');
  console.log('New value:', updated?.value);
});

// Clean up
unsubscribe();
```

## API

### `CookieStoreCache`

Main cache class that mirrors the native Cookie Store.

#### Methods

##### `get(name: string): CookieListItem | null`

Get a cookie by name (synchronous). Returns `null` if cookie doesn't exist.

##### `getAll(names?: string[]): Map<string, CookieListItem>`

Get all cookies as a Map. Optionally filter by names array.

##### `subscribe(listener: () => void): () => void`

Subscribe to cache changes. Returns unsubscribe function.

##### `isReady(): boolean`

Check if cache has completed initial sync from native Cookie Store.

### Exports

- `cookieCache` - Singleton cache instance (use this in most cases)
- `CookieStoreCache` - Class for creating custom instances
- `cookieStore` - Re-exported native Cookie Store API for mutations

## Design

### Why a Cache?

The Cookie Store API is **async**, but most reactive frameworks expect **sync** getters:

- **React**: `useSyncExternalStore` requires synchronous `getSnapshot()`
- **Svelte 5**: Fine-grained reactivity expects synchronous getters
- **Solid**: Signals work best with synchronous reads
- **Vue**: Simpler with synchronous reads (though can handle async)

The cache bridges this gap by maintaining an in-memory mirror of cookies.

### Read vs Write

- **Reads**: Synchronous from cache (`cookieCache.get()`)
- **Writes**: Async using native API (`cookieStore.set()`)

This asymmetry is intentional—reads need to be fast and sync, writes can be async.

### Performance

- **Single event listener**: One listener on native Cookie Store, not one per component
- **Minimal memory**: Only stores current cookies (typically < 1KB)
- **Instant reads**: No async overhead after initial sync

## SSR Support

The cache automatically detects browser environment and gracefully handles SSR:

```typescript
// SSR-safe - returns null on server
const cookie = cookieCache.get('session');

// Check if running in browser
if (cookieStore) {
  await cookieStore.set('session', 'value');
}
```

## Browser Support

Requires [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API) support:

- ✅ Chrome/Edge 87+
- ✅ Opera 73+
- ❌ Firefox (not yet supported)
- ❌ Safari (not yet supported)

For unsupported browsers, consider using traditional `document.cookie` or a polyfill.

## Framework Bindings

This is a low-level package. Most users should use framework-specific bindings:

- [`@cookie-store/react`](../react) - React hooks
- [`@cookie-store/vue`](../vue) - Vue composables
- [`@cookie-store/svelte`](../svelte) - Svelte stores
- [`@cookie-store/solid`](../solid) - Solid signals
- [`@cookie-store/preact`](../preact) - Preact hooks

## License

MIT
