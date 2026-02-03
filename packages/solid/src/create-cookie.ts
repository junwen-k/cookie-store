import { cookieStoreCache } from '@cookie-store/core';
import { from } from 'solid-js';

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

export function createCookies(name?: string) {
  return from<CookieList>((set) => {
    const listener = () => {
      set(cookieStoreCache.getAll(name));
    };

    cookieStoreCache.addEventListener('change', listener);

    return () => {
      cookieStoreCache.removeEventListener('change', listener);
    };
  }, cookieStoreCache.getAll(name));
}
