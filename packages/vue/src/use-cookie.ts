import { cookieCache } from '@cookie-store/core';
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
  const cookie = shallowRef<CookieListItem | null>(cookieCache.get(name));

  const listener = () => {
    cookie.value = cookieCache.get(name);
  };

  cookieCache.addEventListener('change', listener);

  onBeforeUnmount(() => {
    cookieCache.removeEventListener('change', listener);
  });

  return readonly(cookie);
}

/**
 * Reactive composable for reading multiple cookies.
 * Returns a readonly ref to a Map of cookie names to cookie objects.
 *
 * @param names - Optional array of cookie names to watch. If not provided, watches all cookies.
 * @returns Readonly ref to Map of cookie names to cookie objects
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCookies } from '@cookie-store/vue';
 *
 * const cookies = useCookies(['session', 'theme']);
 * const session = computed(() => cookies.value.get('session'));
 * const theme = computed(() => cookies.value.get('theme'));
 * </script>
 *
 * <template>
 *   <div>
 *     <p>Session: {{ session?.value }}</p>
 *     <p>Theme: {{ theme?.value }}</p>
 *   </div>
 * </template>
 * ```
 */
export function useCookies(
  names?: Array<string>
): Readonly<Ref<ReadonlyMap<string, CookieListItem>>> {
  // Helper to create filtered map
  const createFilteredMap = (): ReadonlyMap<string, CookieListItem> => {
    const allCookies = cookieCache.getAll();
    const filtered = new Map<string, CookieListItem>();

    allCookies.forEach((cookie) => {
      if (cookie.name && (!names || names.includes(cookie.name))) {
        filtered.set(cookie.name, cookie);
      }
    });

    return filtered;
  };

  const cookies = shallowRef<ReadonlyMap<string, CookieListItem>>(createFilteredMap());

  const listener = () => {
    cookies.value = createFilteredMap();
  };

  cookieCache.addEventListener('change', listener);

  onBeforeUnmount(() => {
    cookieCache.removeEventListener('change', listener);
  });

  return readonly(cookies);
}
