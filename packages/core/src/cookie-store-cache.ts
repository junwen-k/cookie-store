/**
 * Synchronous cache for Cookie Store API.
 * Maintains an in-memory mirror of cookies and provides synchronous read access.
 * This enables idiomatic reactive patterns across frameworks that expect sync getters.
 *
 * The cache acts as a single source of truth - wrapping the native Cookie Store API
 * and providing both synchronous data access AND event notifications to bindings.
 */
export class CookieStoreCache {
  #cache = new Map<string, CookieListItem>();
  #ready = false;

  constructor() {
    // Only initialize in browser with Cookie Store API support
    if (typeof window !== 'undefined' && 'cookieStore' in window) {
      this.#initialize();
    } else {
      throw new Error('Cookie Store API not supported');
    }
  }

  async #initialize() {
    try {
      const cookies = await window.cookieStore.getAll();
      cookies.forEach((cookie) => {
        if (cookie.name) {
          this.#cache.set(cookie.name, cookie);
        }
      });
      this.#ready = true;
    } catch (error) {
      console.error('Failed to initialize cookie cache:', error);
    }

    window.cookieStore.addEventListener('change', this.#handleChange);
  }

  #handleChange = (event: CookieChangeEvent) => {
    event.changed?.forEach((cookie) => {
      if (cookie.name) {
        this.#cache.set(cookie.name, cookie);
      }
    });
    event.deleted?.forEach((cookie) => {
      if (cookie.name) {
        this.#cache.delete(cookie.name);
      }
    });
  };

  get(name: string): CookieListItem | null {
    return this.#cache.get(name) ?? null;
  }

  getAll(name?: string): CookieList {
    return Array.from(this.#cache.values()).filter((cookie) =>
      name ? cookie.name === name : true
    );
  }

  addEventListener(...args: Parameters<typeof window.cookieStore.addEventListener>): void {
    window.cookieStore?.addEventListener(...args);
  }

  removeEventListener(...args: Parameters<typeof window.cookieStore.removeEventListener>): void {
    window.cookieStore?.removeEventListener(...args);
  }

  isReady(): boolean {
    return this.#ready;
  }
}

export const cookieCache = new CookieStoreCache();
