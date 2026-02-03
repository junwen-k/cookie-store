# @cookie-store/svelte

Idiomatic reactive Svelte 5 bindings for the [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API).

## 📦 Installation

```bash
pnpm add @cookie-store/svelte
```

## Usage

```svelte
<script lang="ts">
  import { svelteCookieStore } from '@cookie-store/svelte';

  const session = svelteCookieStore.get('session');

  async function login() {
    await window.cookieStore.set('session', 'token', { expires: Date.now() + 86400000 });
  }
</script>

{#if session}
  <p>Logged in: {session.value}</p>
{:else}
  <button onclick={login}>Login</button>
{/if}
```
