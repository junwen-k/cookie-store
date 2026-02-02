'use client';

import { cookieStoreCache } from '@cookie-store/core';
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
    cookieStoreCache.addEventListener('change', onStoreChange);
    return () => {
      cookieStoreCache.removeEventListener('change', onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => cookieStoreCache.get(name), [name]);

  const getServerSnapshot = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Reactive hook for reading multiple cookies.
 * Returns an array of cookie objects.
 *
 * Uses useSyncExternalStore for optimal React 18+ concurrent rendering support.
 *
 * @param name - Optional cookie name to filter by. If not provided, returns all cookies.
 * @returns Array of cookie objects
 *
 * @example
 * ```tsx
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
  const subscribe = useCallback((onStoreChange: () => void) => {
    cookieStoreCache.addEventListener('change', onStoreChange);
    return () => {
      cookieStoreCache.removeEventListener('change', onStoreChange);
    };
  }, []);

  // When name is undefined, getAll() returns stable #cookies reference - perfect!
  // When name is provided, getAll(name) filters which creates new array - need caching
  const cacheRef = useRef<CookieList>([]);

  const getSnapshot = useCallback(() => {
    const result = cookieStoreCache.getAll(name);

    // If no name filter, return stable reference directly
    if (!name) {
      return result;
    }

    // For filtered results, cache to maintain reference stability
    if (arraysEqual(cacheRef.current, result)) {
      return cacheRef.current;
    }

    cacheRef.current = result;
    return result;
  }, [name]);

  const getServerSnapshot = useCallback(() => [], []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Helper to compare arrays by value
function arraysEqual(arr1: CookieList, arr2: CookieList): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i]?.name !== arr2[i]?.name || arr1[i]?.value !== arr2[i]?.value) {
      return false;
    }
  }
  return true;
}
