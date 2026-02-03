# @cookie-store/react

Idiomatic reactive React bindings for the [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API).

## 📦 Installation

```bash
pnpm add @cookie-store/react
```

## Usage

```tsx
import { useCookie, useCookies } from '@cookie-store/react';

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
      <button onClick={() => window.cookieStore.delete('session')}>Logout</button>
    </div>
  );
}
```
