# @cookie-store/solid

Idiomatic reactive Solid bindings for the [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API).

## 📦 Installation

```bash
pnpm add @cookie-store/solid
```

## Usage

```tsx
import { createCookie } from '@cookie-store/solid';

function App() {
  const session = createCookie('session');

  return (
    <div>
      <p>{session()?.value ?? 'Not logged in'}</p>
      <button
        onClick={() =>
          window.cookieStore.set('session', 'token', {
            expires: Date.now() + 86400000,
          })
        }
      >
        Login
      </button>
    </div>
  );
}
```
