'use client';

import { cookieStoreCache } from '@cookie-store/core';
import { useCallback, useRef, useSyncExternalStore } from 'react';

// This might look a little hacky but it's intentional.
// Filtered cookies always return a new array reference, we need this comparison to determine if the list has changed.
function arraysEqual(a: CookieList, b: CookieList): boolean {
  // Check if arrays have the same length.
  if (a.length !== b.length) {
    return false;
  }

  // Compare each cookie's name and value in order.
  for (let i = 0; i < a.length; i++) {
    const aCookie = a[i];
    const bCookie = b[i];
    if (aCookie?.name !== bCookie?.name || aCookie?.value !== bCookie?.value) {
      return false;
    }
  }

  // All cookies match.
  return true;
}

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

export function useCookies(name?: string): CookieList {
  const subscribe = useCallback((onStoreChange: () => void) => {
    cookieStoreCache.addEventListener('change', onStoreChange);
    return () => {
      cookieStoreCache.removeEventListener('change', onStoreChange);
    };
  }, []);

  const cacheRef = useRef<CookieList>([]);

  const getSnapshot = useCallback(() => {
    const result = cookieStoreCache.getAll(name);
    if (!name) {
      return result;
    }

    // Ensure snapshot is a stable reference if results are the same.
    // Without this, React will infinitely re-render because the array reference changes.
    if (arraysEqual(cacheRef.current, result)) {
      return cacheRef.current;
    }

    cacheRef.current = result;
    return result;
  }, [name]);

  const getServerSnapshot = useCallback(() => [], []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
