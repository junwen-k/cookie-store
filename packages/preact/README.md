# @cookie-store/preact

Reactive Cookie Store API bindings for Preact with lightweight hooks and optional first-class @preact/signals support.

## Installation

```bash
pnpm add @cookie-store/preact
# Optional: for signals support
pnpm add @preact/signals
```

## Usage

### Regular Hooks

```tsx
import { useCookie, useCookies, cookieStore } from '@cookie-store/preact';

function Component() {
  const session = useCookie('session');
  const allCookies = useCookies();

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
      {session ? (
        <div>
          <p>Logged in: {session.value}</p>
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
        {allCookies.map((cookie) => (
          <li key={cookie.name}>
            {cookie.name}: {cookie.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Signals (Optional)

For better performance and fine-grained reactivity, use the signals API:

```tsx
import { useCookie, useCookies, cookieStore } from '@cookie-store/preact/signals';

function Component() {
  const session = useCookie('session');
  const allCookies = useCookies();

  async function login() {
    await cookieStore.set('session', 'token123');
  }

  return (
    <div>
      {session.value ? <p>Logged in: {session.value.value}</p> : <p>Not logged in</p>}

      <h2>All Cookies ({allCookies.value.length}):</h2>
      <ul>
        {allCookies.value.map((cookie) => (
          <li key={cookie.name}>
            {cookie.name}: {cookie.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## API

### Regular Hooks

- `useCookie(name: string)`: Returns the cookie object or null
- `useCookies(name?: string)`: Returns an array of cookies

### Signals API (`@cookie-store/preact/signals`)

- `useCookie(name: string)`: Returns a signal containing the cookie object or null
- `useCookies(name?: string)`: Returns a signal containing an array of cookies

### Native Cookie Store

- `cookieStore`: Re-exported native Cookie Store API for mutations
  - `cookieStore.set(name, value, options)`: Set a cookie
  - `cookieStore.delete(name)`: Delete a cookie
  - `cookieStore.get(name)`: Get a cookie (async, non-reactive)
  - `cookieStore.getAll()`: Get all cookies (async, non-reactive)

## License

MIT
