'use client';

import { cookieStoreCache } from '@cookie-store/core';
import { useCallback, useRef, useSyncExternalStore } from 'react';

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
