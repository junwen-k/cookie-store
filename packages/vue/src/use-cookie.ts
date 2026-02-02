import { cookieStoreCache } from '@cookie-store/core';
import { onBeforeUnmount, readonly, shallowRef, type Ref } from 'vue';

/**
 * Reactive composable for reading a single cookie.
 * Returns a readonly ref to the cookie object or null if not found.
 *
 * @param name - The name of the cookie to watch
 * @returns Readonly ref to the cookie object or null
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCookie, cookieStore } from '@cookie-store/vue';
 *
 * const session = useCookie('session');
 *
 * async function login() {
 *   await cookieStore.set('session', 'token123', {
 *     expires: Date.now() + 86400000,
 *     secure: true,
 *     sameSite: 'strict'
 *   });
 * }
 * </script>
 *
 * <template>
 *   <div>{{ session ? `Logged in: ${session.value}` : 'Not logged in' }}</div>
 * </template>
 * ```
 */
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

/**
 * Reactive composable for reading multiple cookies.
 * Returns a readonly ref to an array of cookie objects.
 *
 * @param name - Optional cookie name to filter by. If not provided, returns all cookies.
 * @returns Readonly ref to array of cookie objects
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCookies } from '@cookie-store/vue';
 *
 * const cookies = useCookies(); // All cookies
 * const sessionCookies = useCookies('session'); // Only 'session' cookies
 * </script>
 *
 * <template>
 *   <div>
 *     <p v-for="cookie in cookies" :key="cookie.name">
 *       {{ cookie.name }}: {{ cookie.value }}
 *     </p>
 *   </div>
 * </template>
 * ```
 */
export function useCookies(name?: string): Readonly<Ref<readonly CookieListItem[]>> {
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
