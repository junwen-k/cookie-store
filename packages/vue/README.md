# @cookie-store/vue

Idiomatic reactive Vue bindings for the [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API).

## 📦 Installation

```bash
pnpm add @cookie-store/vue
```

## Usage

```vue
<script setup lang="ts">
import { useCookie } from '@cookie-store/vue';

const session = useCookie('session');

async function login() {
  await window.cookieStore?.set('session', 'token', { expires: Date.now() + 86400000 });
}
</script>

<template>
  <p>{{ session?.value ?? 'Not logged in' }}</p>
  <button @click="login">Login</button>
</template>
```
