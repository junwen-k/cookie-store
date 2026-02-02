# @cookie-store/solid

Reactive Cookie Store API bindings for SolidJS.

## Installation

```bash
pnpm add @cookie-store/solid
```

## Usage

```tsx
import { createCookie, createCookies, cookieStore } from '@cookie-store/solid';
import { For } from 'solid-js';

function Component() {
  const session = createCookie('session');
  const allCookies = createCookies();

  async function login() {
    await cookieStore.set('session', 'token123', {
      expires: Date.now() + 86400000,
      secure: true,
      sameSite: 'strict',
    });
  }

  async function logout() {
    await cookieStore.delete('session');
  }

  return (
    <div>
      {session() ? (
        <div>
          <p>Logged in: {session()!.value}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Not logged in</p>
          <button onClick={login}>Login</button>
        </div>
      )}

      <h2>All Cookies:</h2>
      <ul>
        <For each={allCookies()}>
          {(cookie) => (
            <li>
              {cookie.name}: {cookie.value}
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
```

## API

### Signal Creators

- `createCookie(name: string)`: Returns an accessor function for a single cookie
- `createCookies(name?: string)`: Returns an accessor function for all cookies (optionally filtered)

Both functions use SolidJS's `from()` to create reactive signals that automatically track cookie changes.

### Native Cookie Store

- `cookieStore`: Re-exported native Cookie Store API for mutations
  - `cookieStore.set(name, value, options)`: Set a cookie
  - `cookieStore.delete(name)`: Delete a cookie
  - `cookieStore.get(name)`: Get a cookie (async, non-reactive)
  - `cookieStore.getAll()`: Get all cookies (async, non-reactive)

## License

MIT
