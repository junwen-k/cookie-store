import { DestroyRef, inject, signal, type Signal } from '@angular/core';
import { cookieStoreCache } from '@cookie-store/core';

export function injectCookie(name: string): Signal<CookieListItem | null> {
  const destroyRef = inject(DestroyRef);
  const cookie = signal<CookieListItem | null>(cookieStoreCache.get(name));

  const listener = () => {
    cookie.set(cookieStoreCache.get(name));
  };

  cookieStoreCache.addEventListener('change', listener);

  destroyRef.onDestroy(() => {
    cookieStoreCache.removeEventListener('change', listener);
  });

  return cookie.asReadonly();
}

export function injectCookies(name?: string): Signal<ReadonlyArray<CookieListItem>> {
  const destroyRef = inject(DestroyRef);
  const cookies = signal<CookieList>(cookieStoreCache.getAll(name));

  const listener = () => {
    cookies.set(cookieStoreCache.getAll(name));
  };

  cookieStoreCache.addEventListener('change', listener);

  destroyRef.onDestroy(() => {
    cookieStoreCache.removeEventListener('change', listener);
  });

  return cookies.asReadonly();
}
