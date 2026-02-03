import { cookieStoreCache } from '@cookie-store/core';
import { useEffect, useState } from 'preact/hooks';

export function useCookie(name: string): CookieListItem | null {
  const [cookie, setCookie] = useState<CookieListItem | null>(cookieStoreCache.get(name));

  useEffect(() => {
    const listener = () => {
      setCookie(cookieStoreCache.get(name));
    };

    cookieStoreCache.addEventListener('change', listener);

    return () => {
      cookieStoreCache.removeEventListener('change', listener);
    };
  }, [name]);

  return cookie;
}

export function useCookies(name?: string): CookieList {
  const [cookies, setCookies] = useState<CookieList>(cookieStoreCache.getAll(name));

  useEffect(() => {
    const listener = () => {
      setCookies(cookieStoreCache.getAll(name));
    };

    cookieStoreCache.addEventListener('change', listener);

    return () => {
      cookieStoreCache.removeEventListener('change', listener);
    };
  }, [name]);

  return cookies;
}
