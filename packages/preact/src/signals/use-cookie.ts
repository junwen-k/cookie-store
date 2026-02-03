import { cookieStoreCache } from '@cookie-store/core';
import { useSignal, useSignalEffect } from '@preact/signals';

export function useCookie(name: string) {
  const cookie = useSignal<CookieListItem | null>(cookieStoreCache.get(name));

  useSignalEffect(() => {
    const listener = () => {
      cookie.value = cookieStoreCache.get(name);
    };

    cookieStoreCache.addEventListener('change', listener);

    return () => {
      cookieStoreCache.removeEventListener('change', listener);
    };
  });

  return cookie;
}

export function useCookies(name?: string) {
  const cookies = useSignal<CookieList>(cookieStoreCache.getAll(name));

  useSignalEffect(() => {
    const listener = () => {
      // Create new array copy for reactivity
      cookies.value = [...cookieStoreCache.getAll(name)];
    };

    cookieStoreCache.addEventListener('change', listener);

    return () => {
      cookieStoreCache.removeEventListener('change', listener);
    };
  });

  return cookies;
}
