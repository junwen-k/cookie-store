# @cookie-store/preact

Idiomatic reactive Preact bindings for the [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API).

## 📦 Installation

```bash
pnpm add @cookie-store/preact
# Optional: pnpm add @preact/signals
```

## Usage

### Using hooks

```tsx
import { useCookie } from '@cookie-store/preact';

function App() {
  const session = useCookie('session');

  return (
    <div>
      <p>{session?.value ?? 'Not logged in'}</p>
      <button
        onClick={() =>
          window.cookieStore.set('session', 'token', { expires: Date.now() + 86400000 })
        }
      >
        Login
      </button>
    </div>
  );
}
```

### Using `@preact/signals` (optional)

If you're already using `@preact/signals` in your project, you can switch to the signals variant by changing imports. The only difference is you read values via `.value`:

```tsx
import { useCookie } from '@cookie-store/preact/signals';

function App() {
  const sessionSignal = useCookie('session');

  const session = sessionSignal.value;

  return (
    <div>
      <p>{session?.value ?? 'Not logged in'}</p>
      <button
        onClick={() =>
          window.cookieStore.set('session', 'token', { expires: Date.now() + 86400000 })
        }
      >
        Login
      </button>
    </div>
  );
}
```
