'use client';

import { cookieCache } from '@cookie-store/core';
import { useCallback, useRef, useSyncExternalStore } from 'react';

/**
 * Reactive hook for reading a single cookie.
 * Returns the cookie object or null if not found or unavailable.
 *
 * Uses useSyncExternalStore for optimal React 18+ concurrent rendering support.
 *
 * @param name - The name of the cookie to watch
 * @returns The cookie object or null
 *
 * @example
 * ```tsx
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
  const subscribe = useCallback((onStoreChange: () => void) => {
    cookieCache.addEventListener('change', onStoreChange);
    return () => {
      cookieCache.removeEventListener('change', onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => cookieCache.get(name), [name]);

  const getServerSnapshot = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Reactive hook for reading multiple cookies.
 * Returns a Map of cookie names to cookie objects.
 *
 * Uses useSyncExternalStore for optimal React 18+ concurrent rendering support.
 *
 * @param names - Optional array of cookie names to watch. If not provided, watches all cookies.
 * @returns Map of cookie names to cookie objects
 *
 * @example
 * ```tsx
 * function Component() {
 *   const cookies = useCookies(['session', 'theme']);
 *   const session = cookies.get('session');
 *   const theme = cookies.get('theme');
 *
 *   return (
 *     <div>
 *       Session: {session?.value}
 *       Theme: {theme?.value}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCookies(name?: string): CookieList {
  const subscribe = useCallback((onStoreChange: () => void) => {
    cookieCache.addEventListener('change', onStoreChange);
    return () => {
      cookieCache.removeEventListener('change', onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => cookieCache.getAll(name), [name]);

  const getServerSnapshot = useCallback(() => [], []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
