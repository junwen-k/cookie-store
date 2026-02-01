# Cookie Store - Reactive Cookie Store API Wrapper

## Overview

A reactive wrapper around the native [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API) for modern frameworks (React, Vue, Svelte, Solid, Preact). Unlike `ui-call` which manages promise-based state, this library provides reactive bindings to the browser's native Cookie Store API with automatic reactivity on cookie changes.

## Key Differences from ui-call

1. **No Core Package Needed**: We're wrapping a native browser API (`window.cookieStore`), not implementing custom state management
2. **Event-Driven**: Cookie changes are observed via the native `change` event on `CookieStore`
3. **Simpler Architecture**: Each framework package directly wraps the native API with reactive primitives
4. **Browser API First**: Methods are thin wrappers around native `CookieStore` methods

## Architecture

```
packages/
├── react/           - React hooks (useCookieStore, useCookie)
├── vue/             - Vue composables (useCookieStore, useCookie)
├── svelte/          - Svelte stores with reactive getters
├── solid/           - Solid signals/stores
├── preact/          - Preact hooks (similar to React)
└── typescript-config/ - Shared TypeScript configs
```

**No core package**: Each framework package independently wraps `window.cookieStore` with framework-specific reactivity.

## Browser API Reference

### Native CookieStore Interface

```typescript
interface CookieStore {
  // Methods
  get(name?: string): Promise<CookieListItem | null>;
  get(options?: CookieStoreGetOptions): Promise<CookieListItem | null>;
  getAll(name?: string): Promise<CookieListItem[]>;
  getAll(options?: CookieStoreGetOptions): Promise<CookieListItem[]>;
  set(name: string, value: string): Promise<void>;
  set(options: CookieInit): Promise<void>;
  delete(name: string): Promise<void>;
  delete(options: CookieStoreDeleteOptions): Promise<void>;
  
  // Events
  addEventListener(type: 'change', listener: (event: CookieChangeEvent) => void): void;
  removeEventListener(type: 'change', listener: (event: CookieChangeEvent) => void): void;
}

interface CookieListItem {
  name: string;
  value: string;
  domain: string | null;
  path: string;
  expires: DOMHighResTimeStamp | null;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

interface CookieInit {
  name: string;
  value: string;
  expires?: DOMHighResTimeStamp | null;
  domain?: string | null;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
  secure?: boolean;
}

interface CookieChangeEvent extends Event {
  changed: ReadonlyArray<CookieListItem>;
  deleted: ReadonlyArray<CookieListItem>;
}
```

## Package Specifications

### Common Features (All Packages)

1. **Type Safety**: Full TypeScript support with proper types for all Cookie Store API methods
2. **Reactive Updates**: Automatic re-rendering when cookies change (via native `change` event)
3. **SSR Safety**: Graceful handling when `window.cookieStore` is undefined (server-side)
4. **Error Handling**: Proper error boundaries for unsupported browsers

### Package APIs

#### 1. React (`@cookie-store/react`)

```typescript
// Reactive hook for a single cookie (returns null if not found or unavailable)
function useCookie(name: string): CookieListItem | null;

// Reactive hook for multiple cookies (returns Map for efficient lookups)
function useCookies(names?: string[]): Map<string, CookieListItem>;

// Direct access to native API for mutations (non-reactive, but triggers updates)
const cookieStore: CookieStore | undefined;
```

**Usage example:**
```typescript
function UserProfile() {
  const session = useCookie('session');
  const theme = useCookie('theme');
  
  const handleLogin = async () => {
    await cookieStore.set('session', 'token123', {
      expires: Date.now() + 86400000,
      secure: true,
      sameSite: 'strict'
    });
  };
  
  const handleLogout = async () => {
    await cookieStore.delete('session');
  };
  
  return (
    <div>
      {session ? `Logged in: ${session.value}` : 'Not logged in'}
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

**Implementation approach:**
- `useCookie`: Uses `useSyncExternalStore` to subscribe to cookie changes, filters for specific name
- `useCookies`: Similar pattern, filters for specified names (or all if none specified)
- Subscribe to native `cookieStore.addEventListener('change', ...)` and update when relevant cookies change
- Mutations use native API directly - the change event automatically triggers re-renders

#### 2. Vue (`@cookie-store/vue`)

```typescript
// Composable for a single cookie (returns Ref<null> if not found or unavailable)
function useCookie(name: MaybeRef<string>): Ref<CookieListItem | null>;

// Composable for multiple cookies (returns Ref<Map>)
function useCookies(names?: MaybeRef<string[]>): Ref<Map<string, CookieListItem>>;

// Direct access to native API for mutations (non-reactive, but triggers updates)
const cookieStore: CookieStore | undefined;
```

**Usage example:**
```typescript
<script setup>
const session = useCookie('session');
const theme = useCookie('theme');

const handleLogin = async () => {
  await cookieStore.set('session', 'token123', {
    expires: Date.now() + 86400000,
    secure: true,
    sameSite: 'strict'
  });
};

const handleLogout = async () => {
  await cookieStore.delete('session');
};
</script>

<template>
  <div>
    {{ session ? `Logged in: ${session.value}` : 'Not logged in' }}
    <button @click="handleLogin">Login</button>
    <button @click="handleLogout">Logout</button>
  </div>
</template>
```

**Implementation approach:**
- Use `ref()` for reactive state
- Set up event listener in `onMounted`, cleanup in `onUnmounted`
- Support `MaybeRef` for reactive cookie name changes
- Mutations use native API directly - the change event automatically triggers updates

#### 3. Svelte (`@cookie-store/svelte`)

```typescript
// Reactive store for a single cookie using Svelte 5 runes
function cookie(name: string): {
  subscribe(run: (cookie: CookieListItem | null) => void): () => void;
}

// Reactive store for multiple cookies
function cookies(names?: string[]): {
  subscribe(run: (cookies: Map<string, CookieListItem>) => void): () => void;
}

// Direct access to native API for mutations (non-reactive, but triggers updates)
export const cookieStore: CookieStore | undefined;
```

**Usage example:**
```svelte
<script>
  import { cookie, cookieStore } from '@cookie-store/svelte';
  
  const session = cookie('session');
  const theme = cookie('theme');
  
  async function handleLogin() {
    await cookieStore.set('session', 'token123', {
      expires: Date.now() + 86400000,
      secure: true,
      sameSite: 'strict'
    });
  }
  
  async function handleLogout() {
    await cookieStore.delete('session');
  }
</script>

<div>
  {$session ? `Logged in: ${$session.value}` : 'Not logged in'}
  <button on:click={handleLogin}>Login</button>
  <button on:click={handleLogout}>Logout</button>
</div>
```

**Implementation approach (Svelte 5):**
- Use `createSubscriber` from `svelte/reactivity` to create stores
- Wrap native `cookieStore` with Svelte store contract
- Track subscriptions and manage `change` event listeners
- Mutations use native API directly - the change event automatically triggers updates

#### 4. Solid (`@cookie-store/solid`)

```typescript
// Reactive signal for a single cookie
function createCookie(name: Accessor<string> | string): Accessor<CookieListItem | null>;

// Reactive signal for multiple cookies
function createCookies(names?: Accessor<string[]> | string[]): Accessor<Map<string, CookieListItem>>;

// Direct access to native API for mutations (non-reactive, but triggers updates)
const cookieStore: CookieStore | undefined;
```

**Usage example:**
```typescript
function UserProfile() {
  const session = createCookie('session');
  const theme = createCookie('theme');
  
  const handleLogin = async () => {
    await cookieStore.set('session', 'token123', {
      expires: Date.now() + 86400000,
      secure: true,
      sameSite: 'strict'
    });
  };
  
  const handleLogout = async () => {
    await cookieStore.delete('session');
  };
  
  return (
    <div>
      {session() ? `Logged in: ${session().value}` : 'Not logged in'}
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

**Implementation approach:**
- Use `createSignal` for reactive state
- Use `createEffect` / `onCleanup` for event listener lifecycle
- Support reactive `Accessor<string>` for cookie name changes
- Mutations use native API directly - the change event automatically triggers updates

#### 5. Preact (`@cookie-store/preact`)

```typescript
// Reactive hook for a single cookie (returns null if not found or unavailable)
function useCookie(name: string): CookieListItem | null;

// Reactive hook for multiple cookies (returns Map for efficient lookups)
function useCookies(names?: string[]): Map<string, CookieListItem>;

// Direct access to native API for mutations (non-reactive, but triggers updates)
const cookieStore: CookieStore | undefined;
```

**Preact Signals support:**
```typescript
import { Signal } from '@preact/signals';

// Create a signal that automatically updates when cookie changes
function createCookieSignal(name: string): Signal<CookieListItem | null>;

// Create a signal for multiple cookies
function createCookiesSignal(names?: string[]): Signal<Map<string, CookieListItem>>;
```

**Usage example:**
```typescript
function UserProfile() {
  const session = useCookie('session');
  const theme = useCookie('theme');
  
  const handleLogin = async () => {
    await cookieStore.set('session', 'token123', {
      expires: Date.now() + 86400000,
      secure: true,
      sameSite: 'strict'
    });
  };
  
  const handleLogout = async () => {
    await cookieStore.delete('session');
  };
  
  return (
    <div>
      {session ? `Logged in: ${session.value}` : 'Not logged in'}
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

// With signals (fine-grained reactivity)
import { createCookieSignal, cookieStore } from '@cookie-store/preact/signals';

function UserProfile() {
  const session = createCookieSignal('session');
  
  return <div>{session.value ? `Logged in: ${session.value.value}` : 'Not logged in'}</div>;
}
```

**Implementation approach:**
- Similar to React but using Preact hooks
- Additional Preact Signals support for fine-grained reactivity without re-renders
- Mutations use native API directly - the change event automatically triggers updates

## Feature Matrix

| Feature | React | Vue | Svelte | Solid | Preact |
|---------|-------|-----|--------|-------|--------|
| Single cookie reactivity | ✅ | ✅ | ✅ | ✅ | ✅ |
| Multiple cookies reactivity | ✅ | ✅ | ✅ | ✅ | ✅ |
| Native API mutations | ✅ | ✅ | ✅ | ✅ | ✅ |
| SSR safe | ✅ | ✅ | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reactive name param | ❌ | ✅ | ❌ | ✅ | ❌ |
| Signals support | ❌ | ❌ | ❌ | ❌ | ✅ |

**Design Philosophy**: Minimal abstraction layer - hooks/composables return reactive cookie values, mutations happen through native `cookieStore` API

## Implementation Details

### Event Subscription Pattern

All packages follow this minimal pattern:

1. **On mount/subscribe**: 
   - Check if `window.cookieStore` exists (return null/empty if not)
   - Fetch initial cookie value(s)
   - Add `change` event listener that filters for relevant cookie names
   - Update reactive state when relevant cookies change

2. **On change event**:
   - Filter `event.changed` and `event.deleted` for tracked cookie names
   - Update reactive state accordingly
   - Framework handles re-render automatically

3. **On unmount/unsubscribe**:
   - Remove `change` event listener

4. **Mutations**:
   - Use native `cookieStore.set()` / `cookieStore.delete()` directly
   - Native API automatically fires `change` event
   - Change event triggers reactive updates

### Simple React Implementation Example

```typescript
function useCookie(name: string): CookieListItem | null {
  const subscribe = (callback: () => void) => {
    if (!cookieStore) return () => {};
    
    const listener = (event: CookieChangeEvent) => {
      // Only update if this cookie changed
      const affected = [...event.changed, ...event.deleted]
        .some(cookie => cookie.name === name);
      if (affected) callback();
    };
    
    cookieStore.addEventListener('change', listener);
    return () => cookieStore.removeEventListener('change', listener);
  };
  
  const getSnapshot = () => {
    if (!cookieStore) return null;
    // Return cached value, fetch on mount
    return currentValue;
  };
  
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
```

**Key insight**: We don't need to wrap mutations because the native API already fires events that trigger reactivity!

### SSR/Browser Detection

```typescript
const isBrowser = typeof window !== 'undefined' && 'cookieStore' in window;
const cookieStore = isBrowser ? window.cookieStore : undefined;
```

### Error Handling

- Return `null` or empty array when `cookieStore` is unavailable
- Catch and expose errors from async cookie operations
- Provide graceful degradation for unsupported browsers

## Browser Support

The Cookie Store API is available in:
- Chrome/Edge 87+
- Opera 73+
- Not in Firefox or Safari (as of 2026)

All packages should check for API availability and handle gracefully.

## Testing Strategy

1. **Unit Tests**: Mock `window.cookieStore` and test reactivity
2. **Integration Tests**: Use `happy-dom` or `jsdom` with Cookie Store API polyfill
3. **Type Tests**: Use `vitest` with type testing for TypeScript safety
4. **E2E Tests**: Test in real browsers using examples

## Examples Structure

```
examples/
├── react-vite-demo/
├── vue-vite-demo/
├── svelte-kit-demo/
├── solid-start-demo/
└── preact-vite-demo/
```

Each example should demonstrate:
- Reading cookies
- Setting cookies with options (secure, sameSite, expires, etc.)
- Deleting cookies
- Reactive updates across components
- Cookie consent banner (practical use case)

## Package Dependencies

### React
```json
{
  "peerDependencies": {
    "react": ">=16.14.0"
  }
}
```

### Vue
```json
{
  "peerDependencies": {
    "vue": ">=3.3.0"
  }
}
```

### Svelte
```json
{
  "peerDependencies": {
    "svelte": ">=5.0.0"
  }
}
```

### Solid
```json
{
  "peerDependencies": {
    "solid-js": ">=1.8.0"
  }
}
```

### Preact
```json
{
  "peerDependencies": {
    "preact": ">=10.0.0"
  },
  "optionalDependencies": {
    "@preact/signals": ">=1.2.0"
  }
}
```

## Build Configuration

- Use `tsup` for building (consistent with `ui-call`)
- Target ESM and CJS formats
- Generate TypeScript declarations
- Tree-shakeable exports

## Documentation Requirements

Each package should include:
1. **README.md**: Installation, basic usage, API reference
2. **Examples**: Codesandbox/Stackblitz demos
3. **Migration Guide**: From `document.cookie` to Cookie Store API
4. **Browser Compatibility**: Clear warnings about browser support

## Open Questions for Discussion

1. **Naming Convention**: ✅ Agreed
   - `@cookie-store/react`, `@cookie-store/vue`, etc. (matching your ui-call pattern)

2. **Core Package**: 
   - **Recommendation**: No core package needed
   - Each framework wraps native API directly with minimal shared code
   - Only shared package: `typescript-config` for build configs

3. **Service Worker Support**:
   - Cookie Store API works in Service Workers via `ServiceWorkerGlobalScope.cookieStore`
   - Should we support this? Or focus on window context first?
   - **Recommendation**: Add in v1.1, not critical for initial release

4. **Polyfill Strategy**:
   - Cookie Store API not in Firefox/Safari (as of 2026)
   - **Option A**: Strict Cookie Store API only (return null when unavailable)
   - **Option B**: Fallback to `document.cookie` parsing (adds complexity, defeats native API philosophy)
   - **Recommendation**: Option A - let users handle fallback if needed, keep library focused

5. **Advanced Features**:
   - Cookie change subscriptions with filters? (Already possible via native API)
   - Batch cookie operations? (Syntactic sugar over multiple `set()` calls)
   - Cookie middleware (validation, encryption)? (Outside scope of thin wrapper)
   - **Recommendation**: Start minimal, add only if clear demand emerges

6. **API Design Final Decision**:
   - **Proposed**: Read-only hooks + native mutations (minimal abstraction)
   - **Alternative**: Include mutation wrappers in return value (like react-cookie)
   
   ```typescript
   // Minimal (recommended)
   const session = useCookie('session');
   await cookieStore.set('session', 'value');
   
   // vs Alternative (more like react-cookie)
   const [session, setSession, deleteSession] = useCookie('session');
   await setSession('value');
   ```
   
   **Question**: Which feels better for the developer experience?

## Next Steps

1. ✅ Review and finalize this specification
2. ⬜ Decide on package naming and repository structure
3. ⬜ Create monorepo scaffolding
4. ⬜ Implement React package first (proof of concept)
5. ⬜ Create example application
6. ⬜ Implement remaining framework packages
7. ⬜ Write comprehensive tests
8. ⬜ Documentation and examples
9. ⬜ CI/CD setup
10. ⬜ Publish to npm
