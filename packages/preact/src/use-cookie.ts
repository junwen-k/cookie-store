import { cookieCache } from '@cookie-store/core';
import { useEffect, useState } from 'preact/hooks';

/**
 * Reactive hook for reading a single cookie using Preact hooks.
 * Returns the cookie object or null if not found.
 *
 * @param name - The name of the cookie to watch
 * @returns The cookie object or null
 *
 * @example
 * ```tsx
 * import { useCookie, cookieStore } from '@cookie-store/preact';
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
 *   return <div>{session ? `Logged in: ${session.value}` : 'Not logged in'}</div>;
 * }
 * ```
 */
export function useCookie(name: string): CookieListItem | null {
  const [cookie, setCookie] = useState<CookieListItem | null>(cookieCache.get(name));

  useEffect(() => {
    const listener = () => {
      setCookie(cookieCache.get(name));
    };

    cookieCache.addEventListener('change', listener);

    return () => {
      cookieCache.removeEventListener('change', listener);
    };
  }, [name]);

  return cookie;
}

/**
 * Reactive hook for reading multiple cookies using Preact hooks.
 * Returns an array of cookie objects.
 *
 * @param name - Optional cookie name to filter by. If not provided, returns all cookies.
 * @returns Array of cookie objects
 *
 * @example
 * ```tsx
 * import { useCookies } from '@cookie-store/preact';
 *
 * function Component() {
 *   const cookies = useCookies(); // All cookies
 *   const sessionCookies = useCookies('session'); // Only 'session' cookies
 *
 *   return (
 *     <div>
 *       {cookies.map(cookie => (
 *         <div key={cookie.name}>{cookie.name}: {cookie.value}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCookies(name?: string): CookieList {
  const [cookies, setCookies] = useState<CookieList>(cookieCache.getAll(name));

  useEffect(() => {
    const listener = () => {
      // Create new array copy for reactivity
      setCookies([...cookieCache.getAll(name)]);
    };

    cookieCache.addEventListener('change', listener);

    return () => {
      cookieCache.removeEventListener('change', listener);
    };
  }, [name]);

  return cookies;
}
