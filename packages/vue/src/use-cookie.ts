import { cookieStoreCache } from '@cookie-store/core';
import { onBeforeUnmount, readonly, shallowRef, type Ref } from 'vue';

export function useCookie(name: string): Readonly<Ref<CookieListItem | null>> {
  const cookie = shallowRef<CookieListItem | null>(cookieStoreCache.get(name));

  const listener = () => {
    cookie.value = cookieStoreCache.get(name);
  };

  cookieStoreCache.addEventListener('change', listener);

  onBeforeUnmount(() => {
    cookieStoreCache.removeEventListener('change', listener);
  });

  return readonly(cookie);
}

export function useCookies(name?: string): Readonly<Ref<ReadonlyArray<CookieListItem>>> {
  // getAll() returns stable reference, but Vue's shallowRef needs new reference to trigger
  // Always create a copy to ensure Vue reactivity detects changes
  const cookies = shallowRef<CookieList>([...cookieStoreCache.getAll(name)]);

  const listener = () => {
    // Create new array reference for Vue reactivity
    cookies.value = [...cookieStoreCache.getAll(name)];
  };

  cookieStoreCache.addEventListener('change', listener);

  onBeforeUnmount(() => {
    cookieStoreCache.removeEventListener('change', listener);
  });

  return readonly(cookies);
}
