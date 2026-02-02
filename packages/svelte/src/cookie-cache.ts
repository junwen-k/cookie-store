import {
  CookieStoreCache as CoreCookieStoreCache,
  cookieStoreCache as coreCookieStoreCache,
} from '@cookie-store/core';
import { createSubscriber } from 'svelte/reactivity';

/**
 * Reactive CookieStoreCache for Svelte using createSubscriber.
 * Wraps the core cache and makes getters reactive.
 */
export class CookieStoreCache extends CoreCookieStoreCache {
  #subscribe: () => void;

  constructor() {
    super();

    this.#subscribe = createSubscriber((update) => {
      const listener = () => update();

      coreCookieStoreCache.addEventListener('change', listener);

      return () => {
        coreCookieStoreCache.removeEventListener('change', listener);
      };
    });
  }

  /**
   * Reactive getter for a single cookie.
   * Automatically tracks in Svelte components.
   */
  override get(name: string): CookieListItem | null {
    this.#subscribe();
    return coreCookieStoreCache.get(name);
  }

  /**
   * Reactive getter for all cookies (optionally filtered by name).
   * Automatically tracks in Svelte components.
   * Returns a new array copy to ensure Svelte reactivity detects changes.
   */
  override getAll(name?: string): CookieList {
    this.#subscribe();
    // Return new array copy for Svelte reactivity
    return [...coreCookieStoreCache.getAll(name)];
  }
}

/**
 * Singleton reactive cookie cache instance for Svelte.
 * Use this in your Svelte components for automatic reactivity.
 *
 * @example
 * ```svelte
 * <script>
 *   import { cookieStoreCache, cookieStore } from '@cookie-store/svelte';
 *
 *   const session = $derived(cookieStoreCache.get('session'));
 *
 *   async function login() {
 *     await cookieStore.set('session', 'token123');
 *   }
 * </script>
 *
 * <div>{session ? `Logged in: ${session.value}` : 'Not logged in'}</div>
 * ```
 */
export const cookieStoreCache = new CookieStoreCache();
