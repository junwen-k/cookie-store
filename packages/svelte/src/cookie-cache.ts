import {
  CookieStoreCache as CoreCookieStoreCache,
  cookieStoreCache as coreCookieStoreCache,
} from '@cookie-store/core';
import { createSubscriber } from 'svelte/reactivity';

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

  override get(name: string): CookieListItem | null {
    this.#subscribe();
    return coreCookieStoreCache.get(name);
  }

  override getAll(name?: string): CookieList {
    this.#subscribe();
    // Return new array copy for Svelte reactivity
    return [...coreCookieStoreCache.getAll(name)];
  }
}

export const cookieStoreCache = new CookieStoreCache();
