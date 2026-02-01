# @cookie-store/react

Reactive [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API) hooks for React.

## Installation

```bash
npm install @cookie-store/react
# or
pnpm add @cookie-store/react
# or
yarn add @cookie-store/react
```

## Features

- 🍪 **Native API** — Thin wrapper around the Cookie Store API
- ⚡ **Reactive** — Automatic re-renders when cookies change
- 🪶 **Lightweight** — Minimal abstraction layer
- 🛠️ **Type-safe** — Full TypeScript support
- ⚛️ **React 18+** — Uses `useSyncExternalStore` for optimal performance

## Usage

### Reading a single cookie

Use `useCookie` to reactively read a single cookie:

```tsx
import { useCookie, cookieStore } from '@cookie-store/react';

function AuthStatus() {
  const session = useCookie('session');

  const handleLogin = async () => {
    await cookieStore.set('session', 'token123', {
      expires: Date.now() + 86400000, // 24 hours
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
  };

  const handleLogout = async () => {
    await cookieStore.delete('session');
  };

  return (
    <div>
      {session ? (
        <>
          <p>Logged in: {session.value}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <p>Not logged in</p>
          <button onClick={handleLogin}>Login</button>
        </>
      )}
    </div>
  );
}
```

### Reading multiple cookies

Use `useCookies` to reactively read multiple cookies:

```tsx
import { useCookies, cookieStore } from '@cookie-store/react';

function UserPreferences() {
  // Watch specific cookies
  const cookies = useCookies(['theme', 'language', 'fontSize']);

  const theme = cookies.get('theme');
  const language = cookies.get('language');
  const fontSize = cookies.get('fontSize');

  const updateTheme = async (newTheme: string) => {
    await cookieStore.set('theme', newTheme, {
      expires: Date.now() + 365 * 86400000, // 1 year
      path: '/',
    });
  };

  return (
    <div>
      <p>Theme: {theme?.value || 'default'}</p>
      <p>Language: {language?.value || 'en'}</p>
      <p>Font Size: {fontSize?.value || '16px'}</p>
      <button onClick={() => updateTheme('dark')}>Dark Mode</button>
    </div>
  );
}
```

### Watch all cookies

```tsx
import { useCookies } from '@cookie-store/react';

function AllCookies() {
  // No filter - watches all cookies
  const cookies = useCookies();

  return (
    <div>
      <h2>All Cookies ({cookies.size})</h2>
      <ul>
        {Array.from(cookies.entries()).map(([name, cookie]) => (
          <li key={name}>
            {name}: {cookie.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## API

### `useCookie(name: string): CookieListItem | null`

Reactive hook for reading a single cookie.

**Parameters:**

- `name` - The cookie name to watch

**Returns:**

- `CookieListItem | null` - The cookie object or null if not found

**Example:**

```tsx
const session = useCookie('session');
console.log(session?.value); // cookie value
console.log(session?.expires); // expiration timestamp
console.log(session?.secure); // secure flag
```

### `useCookies(names?: string[]): Map<string, CookieListItem>`

Reactive hook for reading multiple cookies.

**Parameters:**

- `names` (optional) - Array of cookie names to watch. If not provided, watches all cookies.

**Returns:**

- `Map<string, CookieListItem>` - Map of cookie names to cookie objects

**Example:**

```tsx
const cookies = useCookies(['session', 'theme']);
const session = cookies.get('session');
const theme = cookies.get('theme');
```

### `cookieStore: CookieStore | undefined`

The native Cookie Store API object. Use this for mutations (set/delete).

**Example:**

```tsx
// Set a cookie
await cookieStore.set('name', 'value', {
  expires: Date.now() + 86400000,
  secure: true,
  sameSite: 'lax',
  path: '/',
});

// Delete a cookie
await cookieStore.delete('name');
```

## Cookie Store API Types

```typescript
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
```

## SSR Support

The hooks gracefully handle server-side rendering:

```tsx
function Component() {
  const cookie = useCookie('name');
  // Returns null during SSR
  // Returns cookie value after hydration
}
```

## Browser Support

The Cookie Store API is currently supported in:

- Chrome/Edge 87+
- Opera 73+

Not supported in Firefox or Safari (as of 2026).

The library will return `null` or empty `Map` when the API is unavailable.

## Performance

This library uses `useSyncExternalStore` for optimal performance:

- Only re-renders when watched cookies change
- No unnecessary re-renders for unrelated cookie changes
- Efficient event subscription management

## License

MIT
