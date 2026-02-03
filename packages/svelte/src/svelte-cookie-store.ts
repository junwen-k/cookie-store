import { CookieStoreCache, cookieStoreCache } from '@cookie-store/core';
import { createSubscriber } from 'svelte/reactivity';

export class SvelteCookieStore extends CookieStoreCache {
  #subscribe: () => void;

  constructor() {
    super();

    this.#subscribe = createSubscriber((update) => {
      const listener = () => update();

      cookieStoreCache.addEventListener('change', listener);

      return () => {
        cookieStoreCache.removeEventListener('change', listener);
      };
    });
  }

  override get(name: string): CookieListItem | null {
    this.#subscribe();
    return cookieStoreCache.get(name);
  }

  override getAll(name?: string): CookieList {
    this.#subscribe();
    return cookieStoreCache.getAll(name);
  }
}

export const svelteCookieStore = new SvelteCookieStore();
