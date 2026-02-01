# @cookie-store/vue

Vue composables for reactive Cookie Store API bindings.

## Installation

```bash
npm install @cookie-store/vue
```

## Usage

```vue
<script setup>
import { useCookie, useCookies, cookieStore } from '@cookie-store/vue';

// Single cookie
const session = useCookie('session');

// Multiple cookies
const cookies = useCookies(['session', 'theme']);

// Mutations use native Cookie Store API
async function login() {
  await cookieStore.set('session', 'token123', {
    expires: Date.now() + 86400000,
    secure: true,
    sameSite: 'strict',
  });
}
</script>

<template>
  <div>
    <p>Session: {{ session?.value }}</p>
    <button @click="login">Login</button>
  </div>
</template>
```

## API

### `useCookie(name: string)`

Returns a reactive ref to a single cookie. Returns `null` if not found.

### `useCookies(names?: string[])`

Returns a reactive ref to a Map of cookies. Optionally filter by cookie names.

### `cookieStore`

Re-exported native Cookie Store API for mutations.

## License

MIT
