import { cookieStoreCache } from '@cookie-store/core';
import { from } from 'solid-js';

/**
 * Creates a reactive signal for reading a single cookie.
 * Uses SolidJS's `from()` to create a signal from the cookie cache.
 *
 * @param name - The name of the cookie to watch
 * @returns Accessor function that returns the cookie object or null
 *
 * @example
 * ```tsx
 * import { createCookie, cookieStore } from '@cookie-store/solid';
 *
 * function Component() {
 *   const session = createCookie('session');
 *
 *   const handleLogin = async () => {
 *     await cookieStore.set('session', 'token123', {
 *       expires: Date.now() + 86400000,
 *       secure: true,
 *       sameSite: 'strict'
 *     });
 *   };
 *
 *   return <div>{session() ? `Logged in: ${session()!.value}` : 'Not logged in'}</div>;
 * }
 * ```
 */
export function createCookie(name: string) {
  return from<CookieListItem | null>((set) => {
    const listener = () => {
      set(cookieStoreCache.get(name));
    };

    cookieStoreCache.addEventListener('change', listener);

    return () => {
      cookieStoreCache.removeEventListener('change', listener);
    };
  }, cookieStoreCache.get(name));
}

/**
 * Creates a reactive signal for reading multiple cookies.
 * Uses SolidJS's `from()` to create a signal from the cookie cache.
 *
 * @param name - Optional cookie name to filter by. If not provided, returns all cookies.
 * @returns Accessor function that returns an array of cookie objects
 *
 * @example
 * ```tsx
 * import { createCookies } from '@cookie-store/solid';
 * import { For } from 'solid-js';
 *
 * function Component() {
 *   const cookies = createCookies(); // All cookies
 *   const sessionCookies = createCookies('session'); // Only 'session' cookies
 *
 *   return (
 *     <div>
 *       <For each={cookies()}>
 *         {(cookie) => <div>{cookie.name}: {cookie.value}</div>}
 *       </For>
 *     </div>
 *   );
 * }
 * ```
 */
export function createCookies(name?: string) {
  return from<CookieList>((set) => {
    const listener = () => {
      // Create new array copy for reactivity
      set([...cookieStoreCache.getAll(name)]);
    };

    cookieStoreCache.addEventListener('change', listener);

    return () => {
      cookieStoreCache.removeEventListener('change', listener);
    };
  }, cookieStoreCache.getAll(name));
}
