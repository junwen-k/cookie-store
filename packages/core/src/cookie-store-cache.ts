/**
 * Synchronous cache for Cookie Store API.
 * Maintains an in-memory mirror of cookies as a stable array & provides synchronous read access.
 * This enables idiomatic reactive patterns across frameworks that expect sync getters.
 *
 * The cache acts as a single source of truth - wrapping the native Cookie Store API
 * and providing both synchronous data access AND event notifications to bindings.
 */
export class CookieStoreCache {
  #ready = false;
  #cookies: CookieList = [];

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
      this.#updateCookiesArrayFromList(cookies);
      this.#ready = true;
    } catch (error) {
      console.error('Failed to initialize cookie cache:', error);
    }

    window.cookieStore.addEventListener('change', this.#handleChange);
  }

  /**
   * Always update the stable array reference in-place,
   * replacing values but not the array object.
   */
  #updateCookiesArrayFromList(cookies: CookieList) {
    this.#cookies.length = 0;
    for (const cookie of cookies) {
      this.#cookies.push(cookie);
    }
  }

  #handleChange = (event: CookieChangeEvent) => {
    let changed = false;

    // Apply changed cookies
    event.changed?.forEach((changedCookie) => {
      if (!changedCookie.name) return;
      // Replace or insert cookie in the array
      const idx = this.#cookies.findIndex((c) => c.name === changedCookie.name);
      if (idx >= 0) {
        this.#cookies[idx] = changedCookie;
      } else {
        this.#cookies.push(changedCookie);
      }
      changed = true;
    });

    // Apply deleted cookies
    event.deleted?.forEach((deletedCookie) => {
      if (!deletedCookie.name) return;
      const idx = this.#cookies.findIndex((c) => c.name === deletedCookie.name);
      if (idx >= 0) {
        this.#cookies.splice(idx, 1);
        changed = true;
      }
    });

    // No other array reference, so just do nothing extra.
    // Listeners get notified only if underlying API emits.
  };

  /**
   * Lookup by iterating the array. (O(n))
   * For small cookie sets, this is likely fine.
   */
  get(name: string): CookieListItem | null {
    return this.#cookies.find((cookie) => cookie.name === name) ?? null;
  }

  /**
   * If given a name, returns a fresh array of matching cookies.
   * Otherwise always returns the stable reference.
   */
  getAll(name?: string): CookieList {
    if (name) {
      return this.#cookies.filter((cookie) => cookie.name === name);
    }
    return this.#cookies;
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
