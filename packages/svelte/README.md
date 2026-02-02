# @cookie-store/svelte

Reactive Cookie Store API bindings for Svelte 5.

## Installation

```bash
pnpm add @cookie-store/svelte
```

## Usage

```svelte
<script>
  import { cookieCache, cookieStore } from '@cookie-store/svelte';

  // Reactive cookie value using $derived
  const session = $derived(cookieCache.get('session'));
  const allCookies = $derived(cookieCache.getAll());

  async function login() {
    await cookieStore.set('session', 'token123', {
      expires: Date.now() + 86400000,
      secure: true,
      sameSite: 'strict'
    });
  }

  async function logout() {
    await cookieStore.delete('session');
  }
</script>

<div>
  {#if session}
    <p>Logged in: {session.value}</p>
    <button onclick={logout}>Logout</button>
  {:else}
    <p>Not logged in</p>
    <button onclick={login}>Login</button>
  {/if}
</div>

<h2>All Cookies:</h2>
<ul>
  {#each allCookies as cookie}
    <li>{cookie.name}: {cookie.value}</li>
  {/each}
</ul>
```

## API

### `cookieCache`

Reactive cookie cache that automatically updates Svelte components when cookies change.

- `cookieCache.get(name: string)`: Get a single cookie (reactive)
- `cookieCache.getAll(name?: string)`: Get all cookies, optionally filtered by name (reactive)

### `cookieStore`

Native Cookie Store API for mutations. Re-exported from `@cookie-store/core`.

- `cookieStore.set(name, value, options)`: Set a cookie
- `cookieStore.delete(name)`: Delete a cookie
- `cookieStore.get(name)`: Get a cookie (async, non-reactive)
- `cookieStore.getAll()`: Get all cookies (async, non-reactive)

## License

MIT
