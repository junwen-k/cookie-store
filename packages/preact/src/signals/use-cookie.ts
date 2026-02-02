import { cookieCache } from '@cookie-store/core';
import { useSignal, useSignalEffect } from '@preact/signals';

/**
 * Reactive hook for reading a single cookie using Preact signals.
 * Returns a signal containing the cookie object or null if not found.
 *
 * @param name - The name of the cookie to watch
 * @returns Signal containing the cookie object or null
 *
 * @example
 * ```tsx
 * import { useCookie, cookieStore } from '@cookie-store/preact/signals';
 *
 * function Component() {
 *   const session = useCookie('session');
 *
 *   const handleLogin = async () => {
 *     await cookieStore.set('session', 'token123', {
 *       expires: Date.now() + 86400000,
 *       secure: true,
 *       sameSite: 'strict'
 *     });
 *   };
 *
 *   return <div>{session.value ? `Logged in: ${session.value.value}` : 'Not logged in'}</div>;
 * }
 * ```
 */
export function useCookie(name: string) {
  const cookie = useSignal<CookieListItem | null>(cookieCache.get(name));

  useSignalEffect(() => {
    const listener = () => {
      cookie.value = cookieCache.get(name);
    };

    cookieCache.addEventListener('change', listener);

    return () => {
      cookieCache.removeEventListener('change', listener);
    };
  });

  return cookie;
}

/**
 * Reactive hook for reading multiple cookies using Preact signals.
 * Returns a signal containing an array of cookie objects.
 *
 * @param name - Optional cookie name to filter by. If not provided, returns all cookies.
 * @returns Signal containing array of cookie objects
 *
 * @example
 * ```tsx
 * import { useCookies } from '@cookie-store/preact/signals';
 *
 * function Component() {
 *   const cookies = useCookies(); // All cookies
 *   const sessionCookies = useCookies('session'); // Only 'session' cookies
 *
 *   return (
 *     <div>
 *       {cookies.value.map(cookie => (
 *         <div key={cookie.name}>{cookie.name}: {cookie.value}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCookies(name?: string) {
  const cookies = useSignal<CookieList>(cookieCache.getAll(name));

  useSignalEffect(() => {
    const listener = () => {
      // Create new array copy for reactivity
      cookies.value = [...cookieCache.getAll(name)];
    };

    cookieCache.addEventListener('change', listener);

    return () => {
      cookieCache.removeEventListener('change', listener);
    };
  });

  return cookies;
}
